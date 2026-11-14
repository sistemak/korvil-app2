import { supabase } from '@/lib/korvilAuth';
import { transformacaoDb, TABELA_INSCRICOES } from '@/lib/transformacaoDb';

export interface InscricaoData {
  nome: string;
  cpf: string;
  data_nascimento: string;
  genero: string;
  whatsapp: string;
  email: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  objetivos: string[];
  nivel: string;
  respostas: { pergunta: string; resposta: string }[];
  plano_nome: string;
  plano_tipo: string;
  plano_freq: number;
  plano_valor: number;
  plano_mat: number;
  dias: string[];
  hora: string;
  total: number;
  payload: Record<string, unknown>;
  dados_brutos: Record<string, unknown>;
}

export interface AlunoResult {
  aluno_id: string;
  numero: number;
  is_new: boolean;
}

function normalizarNome(nome: string): string {
  return nome.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function gerarAlunoId(nome: string, numero: number): string {
  const primeiroNome = normalizarNome(nome).split(/\s+/).filter(Boolean)[0] ?? 'aluno';
  return `${primeiroNome.replace(/[^a-z0-9]/g, '')}pt${numero}`;
}

const QUESTOES_COLUNAS = [
  'Q1. Já praticou atividade física antes?',
  'Q2. Como descreve sua ALIMENTAÇÃO atual?',
  'Q3. Quantas horas DORME por noite?',
  'Q4. Possui RESTRIÇÃO alimentar?',
  'Q5. Qual parte do corpo quer MELHORAR mais?',
  'Q6. Possui DEFICIENCIA ou LIMITAÇÃO física?',
  'Q7. Está passando ou JÁ TEVE acompanhamento PSICOLÓGICO?',
  'Q8. Está fazendo ALGUM TRATAMENTO físico ou psicológico?',
  'Q9. Está fazendo USO DE MEDICAMENTOS? Quais?',
] as const;

type Aba = 'PRESENCIAL' | 'ONLINE';

interface AlunoExistente {
  id_aluno: string;
  n: number;
  cpf: string | null;
  nome: string | null;
  data_nascimento: string | null;
}

function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, '');
}

function chaveData(data: string): string {
  const iso = data.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[3]}${iso[2]}${iso[1]}`;
  return somenteDigitos(data);
}

function formatarCpf(digitos: string): string {
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function derivarAba(planoTipo: string): Aba {
  return planoTipo.includes('pres') ? 'PRESENCIAL' : 'ONLINE';
}

async function buscarAlunoExistente(dados: InscricaoData): Promise<AlunoExistente | null> {
  const cpf = somenteDigitos(dados.cpf);
  const { data, error } = await transformacaoDb
    .from(TABELA_INSCRICOES)
    .select('id_aluno, n, cpf, nome, data_nascimento')
    .in('cpf', [cpf, formatarCpf(cpf)]);
  if (error) throw new Error(error.message);

  const nomeChave = normalizarNome(dados.nome);
  const nascChave = chaveData(dados.data_nascimento);
  const achado = (data ?? []).find(
    (r) =>
      somenteDigitos(r.cpf ?? '') === cpf &&
      normalizarNome(r.nome ?? '') === nomeChave &&
      chaveData(r.data_nascimento ?? '') === nascChave,
  );
  return achado ?? null;
}

async function proximoNumero(aba: Aba): Promise<number> {
  const { data, error } = await transformacaoDb
    .from(TABELA_INSCRICOES)
    .select('n')
    .eq('aba', aba)
    .order('n', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? data.n + 1 : 0;
}

function montarCamposInscricao(dados: InscricaoData, aba: Aba) {
  const respostas = Object.fromEntries(
    QUESTOES_COLUNAS.map((coluna, i) => [coluna, dados.respostas[i]?.resposta ?? '']),
  );
  return {
    nome: dados.nome,
    cpf: dados.cpf,
    data_nascimento: dados.data_nascimento,
    idade: String(dados.payload.idade ?? ''),
    genero: dados.genero,
    whatsapp: dados.whatsapp,
    email: dados.email,
    cep: dados.cep,
    rua: dados.rua,
    numero: dados.numero,
    bairro: dados.bairro,
    cidade: dados.cidade,
    objetivos_prioridade: dados.objetivos.join(', '),
    nivel_atividade: dados.nivel,
    ...respostas,
    modalidade: aba,
    aba,
    tipo_plano: dados.plano_nome,
    dias: dados.dias.join(', '),
    horario: dados.hora,
    frequencia: `${dados.plano_freq}x`,
    valor_mensal: String(dados.plano_valor),
    matricula_paga: String(dados.plano_mat),
    total_primeiro_pagamento: String(dados.total),
    pode_editar: true,
    updated_at: new Date().toISOString(),
  };
}

export async function salvarInscricao(
  dados: InscricaoData
): Promise<{ aluno: AlunoResult | null; error: string | null }> {
  try {
    const existente = await buscarAlunoExistente(dados);

    if (existente) {
      const { error } = await transformacaoDb
        .from(TABELA_INSCRICOES)
        .update(montarCamposInscricao(dados, derivarAba(dados.plano_tipo)))
        .eq('id_aluno', existente.id_aluno);
      if (error) return { aluno: null, error: error.message };
      return { aluno: { aluno_id: existente.id_aluno, numero: existente.n, is_new: false }, error: null };
    }

    const aba = derivarAba(dados.plano_tipo);
    const numero = await proximoNumero(aba);
    const alunoId = gerarAlunoId(dados.nome, numero);

    const { error } = await transformacaoDb
      .from(TABELA_INSCRICOES)
      .insert({
        ...montarCamposInscricao(dados, aba),
        id_aluno: alunoId,
        n: numero,
        ordem_numero: numero,
        status: 'Ativo',
        status_turma: 'ATIVOS',
        setor: 'K-TP',
        app: 'KORVIL App',
      });
    if (error) return { aluno: null, error: error.message };
    return { aluno: { aluno_id: alunoId, numero, is_new: true }, error: null };
  } catch (err) {
    return { aluno: null, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}

/* ===== Admin / GIF permissions ===== */

const ADMIN_EMAILS_TP = [
  'korvilloja@gmail.com',
  'korvil.p@gmail.com',
  'korvil.tp@gmail.com',
  'sistemak.srv@gmail.com',
  'saydavid02@gmail.com',
  'saykorvil@gmail.com',
  'kalmacdc@gmail.com',
  'kafortunado@gmail.com',
];

export function isTransformacaoAdmin(email?: string | null, alunoId?: string | null): boolean {
  if (alunoId && alunoId.trim().toLowerCase() === 'ktp0') return true;
  if (email && ADMIN_EMAILS_TP.includes(email.trim().toLowerCase())) return true;
  return false;
}

export interface AlunoCronograma {
  id_aluno: string;
  n: number;
  nome: string;
  aba: string;
  modalidade: string;
  status: string;
  status_turma: string;
  tipo_plano: string;
  horario: string;
  dias: string;
  email: string;
}

export async function listarAlunosPorAba(aba: 'PRESENCIAL' | 'ONLINE' | 'ADM'): Promise<AlunoCronograma[]> {
  const { data, error } = await transformacaoDb
    .from(TABELA_INSCRICOES)
    .select('id_aluno, n, nome, aba, modalidade, status, status_turma, tipo_plano, horario, dias, email')
    .eq('aba', aba)
    .order('n', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AlunoCronograma[];
}

export async function listarTodosAlunos(): Promise<AlunoCronograma[]> {
  const { data, error } = await transformacaoDb
    .from(TABELA_INSCRICOES)
    .select('id_aluno, n, nome, aba, modalidade, status, status_turma, tipo_plano, horario, dias, email')
    .order('aba', { ascending: true })
    .order('n', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AlunoCronograma[];
}

export async function buscarAlunoPorId(alunoId: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await transformacaoDb
    .from(TABELA_INSCRICOES)
    .select('*')
    .eq('id_aluno', alunoId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Record<string, unknown> | null;
}

export async function salvarGifAluno(alunoId: string, gifUrl: string): Promise<{ error: string | null }> {
  const { error } = await transformacaoDb
    .from(TABELA_INSCRICOES)
    .update({ gif_url: gifUrl, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq('id_aluno', alunoId);
  return { error: error?.message ?? null };
}

/* ===== Weekly weight tracking ===== */

export interface PesoRegistro {
  id: string;
  peso: number;
  data_registro: string;
  data_edicao: string | null;
  semana_ano: string | null;
}

function getISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function getStatusSemanaPeso(now: Date = new Date()): {
  podeEditar: boolean;
  podeRegistrar: boolean;
  mensagem: string;
} {
  const day = now.getDay(); // 0=Dom, 1=Seg, ..., 6=Sáb
  const hours = now.getHours();

  // Sábado 00h00 até Domingo 23h59 = bloqueado (só visualiza)
  if (day === 6 || day === 0) {
    return { podeEditar: false, podeRegistrar: false, mensagem: 'Registro de peso bloqueado no fim de semana (sábado e domingo). Só é possível visualizar.' };
  }

  // Segunda-feira: só libera após 01h00
  if (day === 1 && hours < 1) {
    return { podeEditar: false, podeRegistrar: false, mensagem: 'Registro de peso libera segunda-feira a partir de 01h00.' };
  }

  // Segunda 01h00 até Sexta 23h59 = liberado
  if (day >= 1 && day <= 5) {
    if (day === 5 && hours >= 24) {
      return { podeEditar: false, podeRegistrar: false, mensagem: 'Registro de peso encerrado. Aguarde a próxima segunda.' };
    }
    return { podeEditar: true, podeRegistrar: true, mensagem: 'Registro de peso aberto. Você pode registrar e editar até sexta-feira 23h59.' };
  }

  return { podeEditar: false, podeRegistrar: false, mensagem: 'Fora do período de registro de peso.' };
}

export async function salvarPeso(alunoId: string, peso: number): Promise<{ error: string | null }> {
  const status = getStatusSemanaPeso();
  if (!status.podeRegistrar) return { error: status.mensagem };

  const semana = getISOWeek(new Date());

  const { data: existente } = await supabase
    .from('projeto_transformacao_pesos')
    .select('id, data_registro')
    .eq('aluno_id', alunoId)
    .eq('semana_ano', semana)
    .maybeSingle();

  if (existente) {
    const { error } = await supabase
      .from('projeto_transformacao_pesos')
      .update({ peso, data_edicao: new Date().toISOString() })
      .eq('id', existente.id);
    return { error: error?.message ?? null };
  }

  const { error } = await supabase
    .from('projeto_transformacao_pesos')
    .insert({ aluno_id: alunoId, peso, semana_ano: semana });
  return { error: error?.message ?? null };
}

export async function listarPesos(alunoId: string): Promise<PesoRegistro[]> {
  const { data } = await supabase
    .from('projeto_transformacao_pesos')
    .select('id, peso, data_registro, data_edicao, semana_ano')
    .eq('aluno_id', alunoId)
    .order('data_registro', { ascending: true });
  return (data as PesoRegistro[]) ?? [];
}

export async function buscarAlunoCompleto(alunoId: string): Promise<{
  aluno: Record<string, unknown> | null;
  inscricao: Record<string, unknown> | null;
  pesos: PesoRegistro[];
}> {
  const { data: inscricao } = await transformacaoDb
    .from(TABELA_INSCRICOES)
    .select('*')
    .eq('id_aluno', alunoId)
    .maybeSingle();

  if (!inscricao) return { aluno: null, inscricao: null, pesos: [] };

  const pesos = await listarPesos(alunoId);

  return { aluno: inscricao as Record<string, unknown>, inscricao: inscricao as Record<string, unknown>, pesos };
}
