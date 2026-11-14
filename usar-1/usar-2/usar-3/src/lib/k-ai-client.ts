/* Cliente para a edge function korvil-ai — K-AI com Groq + Gemini,
   seletor de provider salvo em localStorage. */

import { supabase } from '@/lib/korvilAuth';

export type AIProvider = 'auto' | 'groq' | 'gemini' | 'pollinations';

const PROVIDER_KEY = 'kai_ia_selecionada';

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  auto: 'AUTO',
  groq: 'Groq',
  gemini: 'Gemini',
  pollinations: 'Pollinations',
};

export const PROVIDER_OPTIONS: { id: AIProvider; label: string; desc: string }[] = [
  { id: 'auto', label: 'AUTO', desc: 'K-AI Decide (recomendado)' },
  { id: 'groq', label: 'Groq', desc: 'GPT-OSS 120B' },
  { id: 'gemini', label: 'Gemini', desc: '1.5 Flash' },
  { id: 'pollinations', label: 'Pollinations', desc: 'Texto open-source' },
];

export function getProvider(): AIProvider {
  try {
    const v = localStorage.getItem(PROVIDER_KEY);
    if (v === 'auto' || v === 'groq' || v === 'gemini' || v === 'pollinations') return v;
  } catch {
    // ignora
  }
  return 'auto';
}

export function setProvider(p: AIProvider) {
  try {
    localStorage.setItem(PROVIDER_KEY, p);
  } catch {
    // ignora
  }
}

export interface KorvilAIResult {
  ok: boolean;
  reply: string;
  provider: string;
  auto_switched: boolean;
  error?: string;
}

export function getCodebaseSummary(): string {
  try {
    return localStorage.getItem('korvil-codebase-summary') ?? '';
  } catch {
    return '';
  }
}

export function generateCodebaseSummary(): string {
  try {
    const modules = import.meta.glob('/src/**/*.{ts,tsx}', { eager: false });
    const files = Object.keys(modules).sort();
    const lines = files.map((f) => {
      const parts = f.replace('/src/', '').split('/');
      return `${parts.join('/')}`;
    });
    const summary = `PROJETO KORVIL — ${files.length} arquivos TypeScript/React\n\n` +
      `Estrutura:\n` +
      lines.map((l) => `  src/${l}`).join('\n') +
      `\n\nStack: Vite + React + Tailwind + Supabase + lucide-react\n` +
      `PWA instalável, tema dark, K-AI com Groq/Gemini\n` +
      `Loja: catálogo, carrinho, checkout PIX, favoritos, pedidos\n` +
      `Auth: Supabase email/senha\n` +
      `Setores: Central, K-ALMA, K-AFORTUNADO, K-TP, Sistema K, Korvil-Loja`;
    localStorage.setItem('korvil-codebase-summary', summary);
    return summary;
  } catch {
    return '';
  }
}

export async function askKorvilAI(
  prompt: string,
  opts: { setor?: string; history?: { role: string; content: string }[]; provider?: AIProvider; codebaseContext?: string; email?: string | null; isADM?: boolean }
): Promise<KorvilAIResult> {
  const provider_pref = opts.provider ?? getProvider();
  const codebase_context = opts.codebaseContext ?? getCodebaseSummary();
  try {
    const { data, error } = await supabase.functions.invoke('korvil-ai', {
      body: {
        prompt,
        setor: opts.setor ?? 'central',
        history: opts.history ?? [],
        provider_pref,
        codebase_context,
        email: opts.email ?? null,
        isADM: opts.isADM ?? false,
      },
    });
    if (error) {
      return { ok: false, reply: 'K-AI offline', provider: 'error', auto_switched: false, error: error.message };
    }
    return {
      ok: data.provider !== 'error',
      reply: data.answer ?? 'Sem resposta',
      provider: data.provider ?? 'unknown',
      auto_switched: data.auto_switched === true,
    };
  } catch (e) {
    return { ok: false, reply: 'Falha de conexão', provider: 'error', auto_switched: false, error: e instanceof Error ? e.message : 'unknown' };
  }
}
