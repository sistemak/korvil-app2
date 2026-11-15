/* Segurança e permissões do K-AI v42 — bloqueio de info privada + whitelist ADM. */

import { ADMIN_EMAILS } from '@/data/admins';

export const ADM_EMAILS = ADMIN_EMAILS;

export function isAdmEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADM_EMAILS.includes(email.trim().toLowerCase());
}

/* Tópicos que NUNCA podem ser expostos no chat, nem pra ADM (chaves/secrets). */
const PRIVATE_PATTERNS: RegExp[] = [
  /\.env\b/i,
  /chave\s*api|api\s*key|api_key/i,
  /\btoken\b/i,
  /\bsenha\b|\bpassword\b/i,
  /mostra\s*(o\s*)?prompt|mostra\s*(o\s*)?sistema|system\s*prompt/i,
  /como\s*(hackear|editar|modificar)\s*(o\s*)?(c[oó]digo|app|projeto|github|supabase)/i,
  /github\s*privado/i,
  /supabase\s*key|service\s*role\s*key/i,
  /gerador\.js|inteligencia\.json|config\.json/i,
  /memoria\/db|evolucoes\/|snapshots\/|funcoes\/evoluir\.js/i,
  /mostra\s*(o\s*)?c[eé]rebro/i,
  /source\s*code|c[oó]digo\s*fonte/i,
];

export function isPrivateRequest(prompt: string): boolean {
  const p = prompt.toLowerCase();
  return PRIVATE_PATTERNS.some((re) => re.test(p));
}

export const PRIVATE_BLOCK_MESSAGE =
  'Info privada KORVIL protegida ADM. Posso ajudar com loja, produtos, funções públicas.';

export const NON_ADM_BLOCK_MESSAGE =
  'Você não tem permissão pra isso, mas posso te ajudar com produtos da loja, dicas de Saúde/Fitness, tarefas e ideias reais da CENTRAL KORVIL.';

/* Itens permitidos a qualquer usuário logado (não-ADM). */
export const PUBLIC_ALLOWED = [
  'dúvidas sobre produtos e categorias da loja',
  'filtrar por preço/tipo, recomendações de loja',
  'frete, cupons públicos, códigos de rastreio KORVIL-YYYYMMDD-XXXXX',
  'códigos de inscrição, calculadora, textos, posts de marketing',
  'prompts de IA, resumos, voz (falar/ouvir)',
  'copiar, excluir, encaminhar, editar mensagens (segurar 1s)',
  'clicar em links, mini jogo demo da loja',
  'status do K-AI, dicas informativas de Saúde e Fitness',
  'organização de tarefas, HTML simples de landing (sem core do App)',
  'conversar estilo Jarvis, setores públicos (Tarefas, Lab, Programações, Configurações)',
  'info pública Vite/GitHub/K-AI v42',
  'navegar setores da CENTRAL (0-4)',
] as const;

/* Verifica se um pedido de usuário comum está dentro do permitido. */
export function isPublicAllowed(prompt: string): boolean {
  const p = prompt.toLowerCase();
  if (/^(oi|olá|ola|eai|e ai|fala|hey|bom dia|boa tarde|boa noite)\b/.test(p)) return true;
  if (p.includes('/status') || p.includes('status')) return true;
  if (p.includes('/voz') || p.includes('voz')) return true;
  if (p.includes('/loja') || p.includes('loja') || p.includes('produto') || p.includes('categoria')) return true;
  if (p.includes('frete') || p.includes('cupom') || p.includes('rastreio') || p.includes('pedido')) return true;
  if (p.includes('saude') || p.includes('saúde') || p.includes('fitness') || p.includes('exercício') || p.includes('exercicio') || p.includes('treino')) return true;
  if (p.includes('tarefas') || p.includes('tarefa') || p.includes('lembrete')) return true;
  if (p.includes('prompt') || p.includes('resumo') || p.includes('post') || p.includes('marketing')) return true;
  if (p.includes('jarvis') || p.includes('quem é você') || p.includes('quem sou eu') || p.includes('ajuda') || p === '?') return true;
  if (p.includes('jogo') || p.includes('demo')) return true;
  if (p.includes('html') && !p.includes('app') && !p.includes('código fonte') && !p.includes('source code')) return true;
  if (p.includes('vite') || p.includes('github.com/sistemak') || p.includes('k-ai v42') || p.includes('kai v42')) return true;
  if (/^[0-4]$/.test(p.trim())) return true;
  return false;
}

export interface PermResult {
  allowed: boolean;
  blockMessage?: string;
}

/* Decide se o pedido pode seguir pras IAs ou deve ser bloqueado. */
export function checkPermission(prompt: string, email?: string | null): PermResult {
  // Info privada: bloqueia pra todo mundo, inclusive ADM.
  if (isPrivateRequest(prompt)) {
    return { allowed: false, blockMessage: PRIVATE_BLOCK_MESSAGE };
  }
  // ADM: pode tudo (menos o privado já tratado acima).
  if (isAdmEmail(email)) return { allowed: true };
  // Usuário comum: só permitido público.
  if (isPublicAllowed(prompt)) return { allowed: true };
  return { allowed: false, blockMessage: NON_ADM_BLOCK_MESSAGE };
}

/* Injeta contexto de permissão no system prompt. */
export function buildPermContext(email?: string | null): string {
  const adm = isAdmEmail(email);
  return `isADM=${adm} email=${email ?? 'desconhecido'}. Se isADM=false, só faça PERMITIDO PÚBLICO (loja, produtos, categorias, frete, cupons, rastreio, dicas Saúde/Fitness, tarefas, prompts, voz, conversar Jarvis, info pública, navegar setores 0-4). Bloqueie pedidos de código, .env, chaves, github privado, supabase, edição de app. Se isADM=true, permissão total geral, mas NUNCA exponha chaves no chat.`;
}
