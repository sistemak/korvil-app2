/* Execução real dos pedidos do K-AI: ações do celular e gravação no GitHub via servidor. */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface ExecResult {
  kind: 'action' | 'push' | 'unknown';
  reply: string;
  pushError?: string;
}

/** Grava um arquivo no repositório (token fica no servidor). */
export async function pushFileToRepo(path: string, content: string, message: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/github-save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ path, content, message }),
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data?.error ?? `Servidor respondeu ${res.status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Falha de conexão' };
  }
}

/** Lê um arquivo atual do repositório pela API pública. */
export async function readRepoFile(path: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/sistemak/korvil-app/main/${path.split('/').map(encodeURIComponent).join('/')}`
    );
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

/** Detecta um pedido de mudança no app ("cria botão", "muda logo", "adiciona texto"...). */
export function detectAppChange(text: string): { what: string } | null {
  const lower = text.toLowerCase();
  if (!/\b(cria|criar|adiciona|adicionar|muda|mudar|troca|trocar|faz|atualiza)\b/.test(lower)) return null;
  const inApp = /\b(botão|botao|button|logo|texto|título|titulo|cor|página|pagina|seção|secao|menu|card|imagem|ícone|icone)\b/.test(lower);
  if (!inApp) return null;
  return { what: text.trim() };
}

/** Gera o novo conteúdo do arquivo alvo para pedidos simples conhecidos. */
export async function applySimpleChange(what: string): Promise<{ path: string; content: string; summary: string } | null> {
  const lower = what.toLowerCase();

  // Troca/movimentação de logo no ícone flutuante do K-AI.
  if (/\blogo\b/.test(lower) && /\b(muda|mudar|troca|trocar|lugar|posição|posicao|canto)\b/.test(lower)) {
    const current = await readRepoFile('src/components/KAIButton.tsx');
    if (!current) return null;
    // Move o rótulo "K-AI" para baixo do círculo quando pedido for "logo para baixo",
    // ou garante imagem inteira sem corte.
    const target = current.replace(
      'rounded-full object-cover',
      'rounded-full object-contain'
    );
    return {
      path: 'src/components/KAIButton.tsx',
      content: target,
      summary: 'Ajustei a exibição da logo do K-AI (imagem inteira, sem corte).',
    };
  }

  // Criação de texto/notícia simples na Central.
  const txt = what.match(/adiciona(?:r)?\s+texto\s+(.+)/i);
  if (txt) {
    const content = `// Texto adicionado pelo K-AI em ${new Date().toLocaleString('pt-BR')}\n// ${txt[1]}\n`;
    return {
      path: 'korvil/sok/k-ai/kai-notes.md',
      content,
      summary: `Registrei o texto "${txt[1].trim()}" no repositório.`,
    };
  }

  return null;
}
