import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/korvilAuth';
import { transformacaoDb, TABELA_INSCRICOES } from '@/lib/transformacaoDb';
import { salvarInscricao, gerarAlunoId } from '@/lib/transformacaoInscricao';
import { ACESSO_TRANSFORMACAO_NEGADO, verificarIdentidadeTransformacao } from '@/lib/transformacaoAcesso';

const SESSAO_ALUNO_KEY = 'ktp_sessao_aluno';

const LOGO_KTP = 'https://github.com/sistemak/korvil-app/blob/main/korvil/sections/ktp/assets/images/logoktp.png?raw=true';
const LOGO_PROJETO = 'https://github.com/sistemak/korvil-app/blob/main/korvil/sections/ktp/projetotransformacao/assets/imagens/logoprojetotransformacao.png?raw=true';

const IDS_PERMITIDOS = [
  'ktp0', 'mag1', 'mcarla2', 'hvitoria3', 'alexandra4', 'michele5', 'aline6',
  'adriana7', 'joss8', 'amigaadrum9', 'amigaadrdois10', 'angel11', 'anapaula12',
  'gusta13', 'sueli14', 'fabi15', 'paula16', 'nop17', 'bianca18', 'lau19',
  'cass20', 'katia21', 'mara22', 'edna23', 'luciane24', 'marly25', 'mcris26',
  'juci27', 'joce28', 'marcos29', 'lucas30', 'celi31', 'jaque32', 'elisa33',
  'gice34', 'pati35', 'mel36', 'naty37', 'gon38', 'nicol39', 'tchuco40', 'dani41',
];

const OBJETIVOS = [
  'Ganho de Peso', 'Emagrecimento', 'Definição Muscular', 'Saúde',
  'Condicionamento Físico', 'Hipertrofia', 'Reabilitação Física',
];

const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];

const PERGUNTAS = [
  '1. Já praticou atividade física antes? *',
  '2. Como você descreve sua ALIMENTAÇÃO atual? *',
  '3. Quantas horas você DORME por noite? *',
  '4. Possui alguma RESTRIÇÃO alimentar? *',
  '5. Qual parte do corpo quer MELHORAR mais? *',
  '6. Possui alguma DEFICIENCIA ou LIMITAÇÃO fisica? *',
  '7. Está passando ou JÁ TEVE acompanhamento profissional PSICOLÓGICO? *',
  '8. Está fazendo ALGUM TRATAMENTO fisico ou psicológico? *',
  '9. Está fazendo USO DE MEDICAMENTOS? Quais? *',
];

const PLANOS = [
  { nome: 'AULA AVULSA ONLINE', valor: 20, mat: 0, tipo: 'avulso_online', freq: 5, info: '1x a 5x Dias | WhatsApp | Matrícula: GRÁTIS' },
  { nome: 'AULA AVULSA PRESENCIAL', valor: 20, mat: 0, tipo: 'avulso_pres', freq: 1, info: '1x Dia | Presencial | Matrícula: GRÁTIS | 7 vagas/horário' },
  { nome: 'PLANO ONLINE MENSAL', valor: 60, mat: 50, tipo: 'mensal_online', freq: 5, info: 'Escolha dias | App + WhatsApp | Matrícula: R$50,00' },
  { nome: 'PLANO PRESENCIAL 1x SEMANA', valor: 60, mat: 50, tipo: 'mensal_pres', freq: 1, info: 'Matrícula: R$50,00' },
  { nome: 'PLANO PRESENCIAL 2x SEMANA', valor: 80, mat: 50, tipo: 'mensal_pres', freq: 2, info: 'Matrícula: R$50,00' },
  { nome: 'PLANO PRESENCIAL 3x SEMANA', valor: 100, mat: 50, tipo: 'mensal_pres', freq: 3, info: 'Matrícula: R$50,00' },
  { nome: 'PLANO PRESENCIAL 4x SEMANA', valor: 130, mat: 50, tipo: 'mensal_pres', freq: 4, info: 'Matrícula: R$50,00' },
  { nome: 'PLANO PRESENCIAL 5x SEMANA', valor: 150, mat: 50, tipo: 'mensal_pres', freq: 5, info: 'Matrícula: R$50,00' },
];

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const HORARIOS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
];

const FASES = [
  {
    meses: 'JANEIRO A FEVEREIRO - OFF SEASON: PREPARO',
    titulo: '1. OFF SEASON - ADAPTAÇÃO GERAL',
    desc: 'Fase de adaptação total de corpo e mente às rotinas do Projeto TRANSFORMAÇÃO. Não existe dieta restritiva aqui. O objetivo é aumentar a ingestão calórica de forma estratégica para elevar energia, disposição, recuperação e preparar o metabolismo para o bulking. Para quem já fez o projeto no ano anterior, é o momento de liberdade consciente: aproveitar o que gosta sem sabotar os objetivos. Foco também na adaptação técnica: aprender execução correta dos exercícios e entender a metodologia semanal de cada fase. Essencial para ectomorfos e alunos com dificuldade de ganhar massa e peso. Se o objetivo for ganho de peso e hipertrofia, trabalhamos com superávit calórico. Se for emagrecimento e definição muscular, já iniciamos o controle calórico. Dieta mais liberal, mas sempre direcionada.',
  },
  {
    meses: 'MARÇO A MAIO - BULKING: EVOLUÇÃO',
    titulo: '2. BULKING - HIPERTROFIA MÁXIMA',
    desc: 'Fase prioritária de construção. Objetivo principal: hipertrofia muscular, ganho de força, regeneração tecidual, reabilitação e condicionamento físico geral com foco em saúde e performance. Regra básica: comer mais do que gasta. Dieta limpa e protocolar, totalmente alinhada aos objetivos escolhidos por cada aluno, com prioridade máxima em proteínas de alta qualidade, carboidratos complexos e micronutrientes. Treinos estruturados para progressão de carga e execução técnica impecável, sem erros. Zero desperdício. Essa é a fase de ganhar massa magra de verdade, volume e densidade muscular. Disciplina na dieta e no treino é obrigatória para construir a base sólida do físico.',
  },
  {
    meses: 'JUNHO A AGOSTO - MAINTENANCE: MANTER RESULTADOS',
    titulo: '3. MAINTENANCE - CONSOLIDAÇÃO',
    desc: 'Fase de manutenção e consolidação de todos os ganhos conquistados no bulking. Momento de verificar, ajustar e refinar o protocolo geral do projeto. Objetivo: manter massa magra, reduzir levemente a gordura corporal e densificar a musculatura. Preparação física e mental para a fase de cutting. Foco total em disciplina, consistência e nutrição inteligente para nutrir o físico. Trabalhamos também o equilíbrio da mente, da alma e do estado de espírito. Os treinos são de intensidade mediana para evitar lesões, preservar articulações e não comprometer a energia da fase final. Esta é a ponte entre construção e definição. Fase de lapidar o que foi construído.',
  },
  {
    meses: 'SETEMBRO A NOVEMBRO - CUTTING: FINALIZAÇÃO',
    titulo: '4. CUTTING - DEFINIÇÃO TOTAL',
    desc: 'Fase de finalização e exposição do resultado do Projeto TRANSFORMAÇÃO. Objetivo: eliminar o máximo de gordura corporal possível preservando 100% da massa muscular conquistada. Dieta rigorosa com déficit calórico controlado e estratégico. Treinos intensos, técnicos e precisos. Não pode errar e não pode se lesionar. Foco total em estética, simetria, vascularização e modelagem do físico. É aqui que o trabalho do ano inteiro aparece. Fase de definição muscular geral, performance máxima e resultado visível. Execução perfeita em dieta e treino. Sem falhas.',
  },
  {
    meses: 'DEZEMBRO - FÉRIAS: APROVEITAR OS RESULTADOS',
    titulo: '5. DEZEMBRO - FÉRIAS ESTRATÉGICAS',
    desc: 'Período oficial de férias e recarga. Treinos leves com exercícios de rotina, mobilidade e manutenção. Objetivo: aproveitar os resultados conquistados, descansar corpo e articulações e manter o corpo ativo sem pressão. Momento para avaliar o ano, celebrar a evolução e repensar as escolhas de objetivos para o próximo ciclo do projeto. É a fase de transição: manter a constância sem estresse. Para voltar no ano seguinte com mais foco, mais energia e mais estratégia para atingir um novo nível.',
  },
];

const PARTICIPANTES = ['Crianças (10+)', 'Jovens', 'Adultos', 'Idosos', 'Praticantes', 'Atletas'];
const METODOLOGIA = ['1. Manutenção', '2. Resistência', '3. Força', '4. Hipertrofia'];

function maskCpf(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
}

function maskWhats(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d{0,2})/, '($1');
  if (d.length <= 6) return d.replace(/^(\d{2})(\d+)/, '($1) $2');
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

function maskCep(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
}

function calcAge(dateStr: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '';
  const birth = new Date(dateStr + 'T00:00:00');
  if (isNaN(birth.getTime())) return '';
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 && age < 130 ? `${age} anos` : '';
}

const cardCls = 'bg-[#0e1115] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.35)]';
const tituloSecao = 'text-base sm:text-lg font-bold text-white mb-4 pb-3 border-b border-white/10';
const inputCls = 'w-full bg-[#151920] border border-white/10 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/15 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white outline-none transition-all';
const labelCls = 'text-sm text-zinc-300 font-medium mb-1.5 block';
const btnCls = 'w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-[0.99] shadow-[0_8px_24px_rgba(34,211,238,0.2)] transition-all disabled:opacity-60 disabled:cursor-not-allowed';
const opcaoCls = 'border border-white/10 bg-[#151920] text-zinc-200 hover:border-cyan-400/60 transition';
const opcaoAtivaCls = 'border border-cyan-400 bg-cyan-400/10 text-white';

function Passos({ ativo }: { ativo: number }) {
  const nomes = ['ANAMNESE', 'PLANOS', 'DADOS'];
  return (
    <div className="grid grid-cols-3 gap-2 mb-6 p-2 bg-[#0e1115] rounded-2xl border border-white/10">
      {nomes.map((n, i) => {
        const atual = i + 1 === ativo;
        return (
          <div key={n} className={`text-center py-2.5 rounded-xl transition-colors ${atual ? 'bg-cyan-400/10 text-cyan-300' : 'text-zinc-500'}`}>
            <span className={`block font-bold text-base ${atual ? 'text-cyan-300' : 'text-zinc-500'}`}>{i + 1}</span>
            <span className="text-[11px] sm:text-xs font-semibold tracking-wide">{n}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TransformacaoScreen({ onClose, onAcessar }: { onClose: () => void; onAcessar?: (id: string) => void }) {
  const navigate = useNavigate();
  const [view, setView] = useState<'intro' | 'inscricao'>('intro');

  // inscrição
  const [etapa, setEtapa] = useState(1);
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [respostas, setRespostas] = useState<string[]>(Array(9).fill(''));
  const [nivel, setNivel] = useState('');
  const [planoSel, setPlanoSel] = useState<typeof PLANOS[number] | null>(null);
  const [dias, setDias] = useState<string[]>([]);
  const [hora, setHora] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [nasc, setNasc] = useState('');
  const [genero, setGenero] = useState('');
  const [whats, setWhats] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [erro, setErro] = useState('');

  const toggleObjetivo = (obj: string) => {
    setObjetivos((prev) => {
      if (prev.includes(obj)) return prev.filter((o) => o !== obj);
      if (prev.length >= 7) return prev;
      return [...prev, obj];
    });
  };

  const selPlano = (p: typeof PLANOS[number]) => {
    setPlanoSel(p);
    setDias(p.freq === 5 ? [...DIAS] : []);
    setHora('');
    setErro('');
  };

  const toggleDia = (dia: string) => {
    if (!planoSel || planoSel.freq === 5) return;
    setDias((prev) => {
      if (prev.includes(dia)) return prev.filter((d) => d !== dia);
      if (prev.length >= planoSel.freq) return prev;
      return [...prev, dia];
    });
  };

  const buscarCep = async (valor: string) => {
    const digits = valor.replace(/\D/g, '');
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setRua(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
      }
    } catch {
      // segue sem preencher
    }
  };

  const continuarAnamnese = () => {
    if (objetivos.length === 0) {
      setErro('Selecione pelo menos 1 objetivo.');
      return;
    }
    setErro('');
    setEtapa(2);
  };

  const continuarPlanos = () => {
    if (!planoSel) {
      setErro('Selecione um plano.');
      return;
    }
    if (dias.length !== planoSel.freq) {
      setErro(`Selecione ${planoSel.freq} dia(s).`);
      return;
    }
    if (!hora) {
      setErro('Selecione 1 horário.');
      return;
    }
    setErro('');
    setEtapa(3);
  };

  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [idGerado, setIdGerado] = useState('');

  // countdown tela 3
  const [contagem, setContagem] = useState<number | null>(null);
  const [idPreview, setIdPreview] = useState('');
  const [podeFinalizar, setPodeFinalizar] = useState(false);
  const contagemRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // popup login
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginErro, setLoginErro] = useState('');

  const finalizar = async () => {
    if (!nome.trim()) { setErro('Preencha o nome.'); return; }
    if (!cpf) { setErro('Preencha o CPF.'); return; }
    if (!whats) { setErro('Preencha o WhatsApp.'); return; }
    if (!cep) { setErro('Preencha o CEP.'); return; }
    if (!numero) { setErro('Preencha o número.'); return; }
    setErro('');
    if (!planoSel) return;

    setEnviando(true);
    setSucesso(false);

    const total = planoSel.valor + planoSel.mat;
    const hoje = new Date().toLocaleDateString('pt-BR');
    const idade = calcAge(nasc);

    const respostasJson = PERGUNTAS.map((p, i) => ({
      pergunta: p.replace(' *', ''),
      resposta: respostas[i] ?? '',
    }));

    const payload = {
      nome, cpf, data_nascimento: nasc, genero, whatsapp: whats, email,
      cep, rua, numero, bairro, cidade, objetivos, nivel, respostas: respostasJson,
      plano: { nome: planoSel.nome, tipo: planoSel.tipo, freq: planoSel.freq, valor: planoSel.valor, mat: planoSel.mat },
      dias, hora, total, data_envio: hoje, idade,
    };

    const dadosBrutos = {
      nome, cpf, nasc, genero, whats, email,
      cep, rua, numero, bairro, cidade,
      objetivos, nivel, respostas,
      plano: { ...planoSel },
      dias, hora, total,
      timestamp: new Date().toISOString(),
    };

    const { aluno, error: saveError } = await salvarInscricao({
      nome,
      cpf,
      data_nascimento: nasc,
      genero,
      whatsapp: whats,
      email,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      objetivos,
      nivel,
      respostas: respostasJson,
      plano_nome: planoSel.nome,
      plano_tipo: planoSel.tipo,
      plano_freq: planoSel.freq,
      plano_valor: planoSel.valor,
      plano_mat: planoSel.mat,
      dias,
      hora,
      total,
      payload,
      dados_brutos: dadosBrutos,
    });

    if (saveError || !aluno) {
      setEnviando(false);
      setErro('Erro ao salvar inscrição: ' + (saveError || 'erro desconhecido'));
      return;
    }

    await supabase.functions.invoke('send-transformacao-whatsapp', { body: { ...payload, aluno_id: aluno.aluno_id, aluno_numero: aluno.numero } });

    setEnviando(false);
    setSucesso(true);
    setIdGerado(aluno.is_new ? `${aluno.aluno_id} (nº ${aluno.numero})` : `${aluno.aluno_id} (nº ${aluno.numero}) — dados atualizados`);
    setEtapa(1);
    setObjetivos([]);
    setRespostas(Array(9).fill(''));
    setNivel('');
    setPlanoSel(null);
    setDias([]);
    setHora('');
    setNome(''); setCpf(''); setNasc(''); setGenero('');
    setWhats(''); setEmail(''); setCep('');
    setRua(''); setNumero(''); setBairro(''); setCidade('');
  };

  const iniciarContagem = () => {
    if (contagemRef.current) return;
    if (!nome.trim() || !cpf || !whats || !cep || !numero) return;
    setPodeFinalizar(false);
    setContagem(5);
    let n = 5;
    contagemRef.current = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        if (contagemRef.current) { clearInterval(contagemRef.current); contagemRef.current = null; }
        setContagem(null);
        setPodeFinalizar(true);
      } else {
        setContagem(n);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => { if (contagemRef.current) clearInterval(contagemRef.current); };
  }, []);

  useEffect(() => {
    if (etapa !== 3) { setContagem(null); setPodeFinalizar(false); setIdPreview(''); if (contagemRef.current) { clearInterval(contagemRef.current); contagemRef.current = null; } }
  }, [etapa]);

  const gerarIdPreview = async () => {
    if (!nome.trim()) { setIdPreview(''); return; }
    const aba = planoSel?.tipo.includes('pres') ? 'PRESENCIAL' : 'ONLINE';
    const { data } = await transformacaoDb
      .from(TABELA_INSCRICOES)
      .select('n')
      .eq('aba', aba)
      .order('n', { ascending: false })
      .limit(1)
      .maybeSingle();
    const proximo = (data?.n ?? -1) + 1;
    setIdPreview(gerarAlunoId(nome, proximo));
  };

  useEffect(() => {
    if (etapa === 3 && nome.trim().length > 2) {
      const t = setTimeout(() => void gerarIdPreview(), 300);
      return () => clearTimeout(t);
    } else {
      setIdPreview('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome, etapa]);

  const fecharLogin = () => {
    setShowLogin(false);
    setLoginEmail('');
    setLoginId('');
    setLoginErro('');
    setLoginBusy(false);
  };

  const confirmarLogin = async () => {
    if (!loginEmail.trim() || !loginId.trim()) {
      setLoginErro('Preencha e-mail e ID.');
      return;
    }
    setLoginErro('');
    setLoginBusy(true);

    const id = loginId.trim().toLowerCase().replace(/\s+/g, '');
    const email = loginEmail.trim().toLowerCase();
    const resultado = await verificarIdentidadeTransformacao(email, id);

    if (resultado.status !== 'ok') {
      setLoginBusy(false);
      setLoginErro(resultado.status === 'nao_confere' ? ACESSO_TRANSFORMACAO_NEGADO : 'Não foi possível confirmar agora. Tente novamente.');
      return;
    }

    try { localStorage.setItem(SESSAO_ALUNO_KEY, JSON.stringify({ id: resultado.alunoId, email })); } catch { /* ignora */ }
    setLoginBusy(false);
    fecharLogin();
    navigate('/transformacao', { replace: true });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#07080a] overflow-y-auto text-zinc-100">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_60%)]" />

      <div className="relative min-h-full max-w-[880px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={view === 'intro' ? onClose : () => { setView('intro'); setEtapa(1); }}
          className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-[#0e1115]/90 text-zinc-200 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
          aria-label={view === 'intro' ? 'Fechar' : 'Voltar'}
        >
          {view === 'intro' ? <X size={18} /> : <ArrowLeft size={18} />}
        </button>

        {view === 'intro' ? (
          <div className="mt-6 sm:mt-8 space-y-8 sm:space-y-10">
            <header className="text-center">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-cyan-300 uppercase mb-6">K-TP Treinamento Personalizado</p>
              <div className="flex justify-center items-center gap-4 sm:gap-6 mb-6">
                <img src={LOGO_KTP} alt="Logo K-TP" className="max-w-[130px] sm:max-w-[150px] rounded-2xl p-2 bg-[#0e1115] border border-white/10" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')} />
                <img src={LOGO_PROJETO} alt="Logo Projeto Transformação" className="max-w-[130px] sm:max-w-[150px] rounded-2xl p-2 bg-[#0e1115] border border-white/10" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')} />
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">PROJETO TRANSFORMAÇÃO</h1>
            </header>

            <section className={cardCls}>
              <h2 className={tituloSecao}>Sobre o programa</h2>
              <p className="text-zinc-200 text-base sm:text-lg leading-relaxed mb-5">
                Programa de guia fitness de alta performance desenvolvido por Say Korvil.
              </p>
              <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-5 text-center">
                <p className="font-bold text-white leading-relaxed text-base sm:text-lg">
                  TREINADOR<br />TERAPEUTA HOLÍSTICO
                </p>
                <p className="mt-1 font-semibold text-cyan-300">ESPECIALISTA EM RESULTADOS</p>
              </div>
            </section>

            <section className={cardCls}>
              <h2 className={tituloSecao}>Participantes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PARTICIPANTES.map((p) => (
                  <div key={p} className="bg-[#151920] border border-white/10 rounded-xl px-3.5 py-3 text-sm font-medium text-zinc-100 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> {p}
                  </div>
                ))}
              </div>
            </section>

            <section className={cardCls}>
              <h2 className={tituloSecao}>Metodologia</h2>
              <div className="grid grid-cols-2 gap-3">
                {METODOLOGIA.map((m) => (
                  <div key={m} className="bg-[#151920] border border-white/10 rounded-xl px-3.5 py-3 text-sm font-medium text-zinc-100 flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> {m}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-base sm:text-lg font-bold text-white mb-4">Linha do tempo do projeto</h2>
              <div className="space-y-4">
                {FASES.map((f) => (
                  <article key={f.titulo} className="bg-[#0e1115] border border-white/10 rounded-2xl p-5 sm:p-7 transition-colors hover:border-cyan-400/40">
                    <span className="inline-block text-[11px] sm:text-xs font-bold tracking-wide text-cyan-300 bg-cyan-400/10 border border-cyan-400/30 rounded-full px-3 py-1 mb-4">
                      {f.meses}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3">{f.titulo}</h3>
                    <p className="text-zinc-300 text-[15px] leading-[1.7]">{f.desc}</p>
                  </article>
                ))}
              </div>
            </section>

            <div className="space-y-3 pb-6">
              <button onClick={() => { setView('inscricao'); setEtapa(1); }} className={btnCls}>
                COMEÇAR INSCRIÇÃO
              </button>
              <button onClick={() => setShowLogin(true)} className="w-full py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base border border-cyan-400 text-cyan-300 bg-transparent hover:bg-cyan-400/10 transition-colors">
                ACESSAR PROJETO
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8">
            <h1 className="text-center text-lg sm:text-xl font-bold text-white mb-5 sm:mb-6">
              K-TP | Projeto Transformação
            </h1>
            <Passos ativo={etapa} />

            {erro && (
              <div className="mb-5 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-center font-semibold">
                {erro}
              </div>
            )}

            {etapa === 1 && (
              <div className="space-y-5">
                <div className={cardCls}>
                  <div className={tituloSecao}>Objetivos: escolha na ordem de prioridade (1 até 7)</div>
                  <p className="text-emerald-400 text-sm font-semibold mb-4 min-h-[22px]">
                    {objetivos.length > 0 ? `Prioridade: ${objetivos.map((o, i) => `${i + 1}º ${o}`).join(' > ')}` : ''}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {OBJETIVOS.map((obj) => {
                      const pos = objetivos.indexOf(obj);
                      return (
                        <button
                          key={obj}
                          onClick={() => toggleObjetivo(obj)}
                          className={`px-4 py-3 rounded-xl text-left text-sm font-semibold transition ${
                            pos > -1 ? opcaoAtivaCls : opcaoCls
                          }`}
                        >
                          {pos > -1 ? <b className="text-emerald-400">{pos + 1}. </b> : null}
                          {obj}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={cardCls}>
                  <div className={tituloSecao}>Anamnese - histórico</div>
                  <div className="mb-4">
                    <label className={labelCls}>Nível de Atividade Física *</label>
                    <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={inputCls}>
                      <option value="">Selecione</option>
                      {NIVEIS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  {PERGUNTAS.map((p, i) => (
                    <div key={p} className="mb-4">
                      <label className={labelCls}>{p}</label>
                      <textarea
                        rows={2}
                        value={respostas[i]}
                        onChange={(e) => setRespostas((prev) => prev.map((r, j) => (j === i ? e.target.value : r)))}
                        className={inputCls}
                      />
                    </div>
                  ))}
                  <button onClick={continuarAnamnese} className={btnCls + ' mt-2'}>CONTINUAR</button>
                </div>
              </div>
            )}

            {etapa === 2 && (
              <div className="space-y-5">
                <div className={cardCls}>
                  <div className={tituloSecao}>1. Escolha 1 plano</div>
                  <div className="space-y-3">
                    {PLANOS.map((p) => (
                      <button
                        key={p.nome}
                        onClick={() => selPlano(p)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl transition ${
                          planoSel?.nome === p.nome ? opcaoAtivaCls : opcaoCls
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-bold text-cyan-300 text-sm">{p.nome}</span>
                          <span className="font-bold text-emerald-400 text-sm whitespace-nowrap">
                            {p.freq === 1 && p.tipo === 'avulso_pres' ? 'R$20,00/aula' : p.tipo === 'avulso_online' ? 'R$20,00/aula' : `R$${p.valor},00/mês`}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1.5">{p.info}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 mt-4">*Matrícula R$50,00 obrigatória para novos. Válida até Dezembro.</p>
                </div>

                <div className={cardCls}>
                  <div className={tituloSecao}>2. Escolha dias e horário</div>
                  <p className="text-sm text-cyan-300 font-semibold mb-3">Dias: seg à sex</p>
                  <div className="grid grid-cols-5 gap-2 sm:gap-2.5 mb-3">
                    {DIAS.map((d) => {
                      const sel = dias.includes(d);
                      const travado = planoSel?.freq === 5;
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDia(d)}
                          className={`py-3 rounded-xl text-center text-sm font-semibold transition ${
                            sel
                              ? opcaoAtivaCls
                              : travado
                                ? 'border border-white/5 bg-[#0a0c0f] text-zinc-600'
                                : planoSel
                                  ? opcaoCls
                                  : 'border border-white/5 bg-[#0a0c0f] text-zinc-600'
                          }`}
                        >
                          {d.slice(0, 3).toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-amber-300 font-semibold text-center mb-4">
                    {!planoSel ? 'Selecione um plano primeiro' : planoSel.freq === 5 ? 'Dias: Segunda, Terça, Quarta, Quinta, Sexta' : `Faltam ${planoSel.freq - dias.length} dia(s)`}
                  </p>
                  <p className="text-sm text-cyan-300 font-semibold mb-3">Horário fixo: 06h às 10h | 16h às 05h</p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-2.5">
                    {HORARIOS.map((h) => (
                      <button
                        key={h}
                        onClick={() => planoSel && setHora(h)}
                        className={`py-2 rounded-lg text-center text-xs font-semibold transition ${
                          hora === h
                            ? opcaoAtivaCls
                            : planoSel
                              ? opcaoCls
                              : 'border border-white/5 bg-[#0a0c0f] text-zinc-600'
                        }`}
                      >
                        {h}
                        <span className="block text-[10px] text-emerald-400 font-medium">7 vagas</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={continuarPlanos} className={btnCls}>CONTINUAR</button>
              </div>
            )}

            {etapa === 3 && (
              <div className="space-y-5">
                <div className={cardCls}>
                  <div className={tituloSecao}>3. Dados pessoais</div>
                  <div className="mb-4">
                    <label className={labelCls}>Nome Completo *</label>
                    <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>CPF *</label>
                      <input value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} maxLength={14} placeholder="000.000.000-00" inputMode="numeric" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Data Nasc *</label>
                      <input type="date" value={nasc} onChange={(e) => setNasc(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelCls}>Idade</label>
                      <input value={calcAge(nasc)} readOnly className={inputCls + ' text-emerald-400 font-semibold'} />
                    </div>
                    <div>
                      <label className={labelCls}>Gênero *</label>
                      <select value={genero} onChange={(e) => setGenero(e.target.value)} className={inputCls}>
                        <option value="">Selecione</option>
                        <option>Masculino</option>
                        <option>Feminino</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className={labelCls}>WhatsApp *</label>
                    <input value={whats} onChange={(e) => setWhats(maskWhats(e.target.value))} placeholder="(11) 99999-9999" inputMode="tel" className={inputCls} />
                  </div>
                  <div className="mb-4">
                    <label className={labelCls}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </div>

                  <div className={tituloSecao + ' mt-6'}>Endereço</div>
                  <div className="mb-4">
                    <label className={labelCls}>CEP *</label>
                    <input value={cep} onChange={(e) => setCep(maskCep(e.target.value))} onBlur={(e) => void buscarCep(e.target.value)} maxLength={9} placeholder="00000-000" inputMode="numeric" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelCls}>Rua</label>
                      <input value={rua} onChange={(e) => setRua(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Número *</label>
                      <input value={numero} onChange={(e) => setNumero(e.target.value)} inputMode="numeric" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Bairro</label>
                      <input value={bairro} onChange={(e) => setBairro(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className={labelCls}>Cidade</label>
                    <input value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputCls} />
                  </div>

                  {etapa === 3 && idPreview && !sucesso && (
                    <div className="mt-5 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-4 text-center">
                      <div className="text-xs text-cyan-300 font-semibold tracking-wide mb-1">SEU ID DE ALUNO</div>
                      <div className="text-2xl font-bold text-white tracking-wide">
                        {idPreview}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">Guarde este ID — ele será sua chave de acesso ao projeto.</div>
                    </div>
                  )}

                  {etapa === 3 && !podeFinalizar && !sucesso && contagem === null && (
                    <button
                      onClick={iniciarContagem}
                      className="w-full py-3.5 mt-4 rounded-xl font-semibold text-sm sm:text-base border border-cyan-400/40 text-cyan-300 bg-transparent hover:bg-cyan-400/10 transition-colors"
                    >
                      GERAR ID E LIBERAR FINALIZAR
                    </button>
                  )}

                  {etapa === 3 && contagem !== null && !sucesso && (
                    <div className="mt-4 text-center">
                      <div className="text-5xl font-bold text-cyan-300 animate-pulse">
                        {contagem}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">Gerando seu ID...</div>
                    </div>
                  )}

                  {etapa === 3 && podeFinalizar && !sucesso && (
                    <button
                      onClick={finalizar}
                      disabled={enviando}
                      className={btnCls + ' mt-4'}
                    >
                      {enviando ? 'SALVANDO...' : 'FINALIZAR INSCRIÇÃO'}
                    </button>
                  )}

                  {etapa === 3 && !podeFinalizar && !sucesso && contagem === null && (
                    <div className="mt-3 text-xs text-zinc-500 text-center">
                      Preencha todos os dados e clique acima para liberar o botão de finalizar.
                    </div>
                  )}

                  {sucesso && (
                    <div className="mt-4 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-center font-semibold">
                      Inscrição recebida com sucesso!
                      {idGerado && (
                        <div className="mt-2 text-cyan-300">
                          Seu ID: <b>{idGerado}</b>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showLogin && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4" onClick={fecharLogin}>
          <div
            className="relative w-full max-w-md bg-[#0e1115] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={fecharLogin}
              className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>

            <div className="mb-6">
              <div className="text-xs font-semibold tracking-wide text-cyan-300 mb-1">PROJETO TRANSFORMAÇÃO</div>
              <h2 className="text-xl font-bold text-white">Acessar projeto</h2>
            </div>

            {loginErro && (
              <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-center font-semibold">
                {loginErro}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={labelCls}>E-mail</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className={inputCls}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  onKeyDown={(e) => { if (e.key === 'Enter') void confirmarLogin(); }}
                />
              </div>
              <div>
                <label className={labelCls}>ID de aluno</label>
                <input
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className={inputCls}
                  placeholder="ex: marcos43"
                  onKeyDown={(e) => { if (e.key === 'Enter') void confirmarLogin(); }}
                />
              </div>
              <button
                onClick={confirmarLogin}
                disabled={loginBusy}
                className={btnCls}
              >
                {loginBusy ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'ENTRAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
