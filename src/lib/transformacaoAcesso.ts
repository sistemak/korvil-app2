import { transformacaoDb, TABELA_INSCRICOES } from '@/lib/transformacaoDb';

export const PEDIR_IDENTIDADE_TRANSFORMACAO =
  'Para te direcionar para a página inicial do sistema do Projeto Transformação, preciso confirmar sua identidade. Por favor, me informe seu email e seu ID de acesso.';

export const ACESSO_TRANSFORMACAO_NEGADO =
  'Email ou ID não conferem com seu cadastro no Projeto Transformação. Verifique e tente novamente.';

export type ResultadoIdentidade =
  | { status: 'ok'; alunoId: string; nome: string }
  | { status: 'nao_confere' }
  | { status: 'erro' };

function semAcento(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function ehPedidoPaginaInicial(texto: string): boolean {
  const t = semAcento(texto);
  return /pagina inicial/.test(t) && /\b(direciona|direcione|leva|levar|manda|abre|abrir|ir|vai|vou)\b/.test(t);
}

export function extrairEmail(texto: string): string | null {
  const m = texto.match(/[^\s@]+@[^\s@]+\.[a-z]{2,}/i);
  return m ? m[0].toLowerCase().replace(/[.,;:!?]+$/, '') : null;
}

export function extrairId(texto: string): string | null {
  const m = semAcento(texto).match(/\bid\b\s*(?:[:=]|e\b)?\s*([a-z0-9]+)/);
  return m ? m[1] : null;
}

export async function verificarIdentidadeTransformacao(email: string, id: string): Promise<ResultadoIdentidade> {
  try {
    const { data, error } = await transformacaoDb
      .from(TABELA_INSCRICOES)
      .select('id_aluno, nome, email, status')
      .eq('id_aluno', id)
      .maybeSingle();

    if (error) return { status: 'erro' };
    if (!data) return { status: 'nao_confere' };

    const emailBate = !!data.email && data.email.trim().toLowerCase() === email.trim().toLowerCase();
    if (!emailBate) return { status: 'nao_confere' };

    return { status: 'ok', alunoId: data.id_aluno, nome: data.nome ?? '' };
  } catch {
    return { status: 'erro' };
  }
}
