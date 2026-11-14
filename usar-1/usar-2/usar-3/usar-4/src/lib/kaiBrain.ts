/* Fala com o cérebro do K-AI no servidor (Groq + GitHub). A chave nunca vai para o app. */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export interface BrainMessage {
  role: 'user' | 'kai';
  text: string;
}

export interface BrainResult {
  ok: boolean;
  reply?: string;
  executed?: boolean;
  denied?: boolean;
  path?: string | null;
  error?: string;
}

export async function askKaiBrain(
  messages: BrainMessage[],
  opts: { email?: string; isAdmin?: boolean }
): Promise<BrainResult> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/kai-brain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.text })),
        email: opts.email,
        isAdmin: opts.isAdmin,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data?.error ?? `Servidor respondeu ${res.status}` };
    }
    const data = await res.json();
    if (typeof data?.reply !== 'string') {
      return { ok: false, error: 'Resposta incompleta do servidor' };
    }
    return {
      ok: true,
      reply: data.reply,
      executed: data.executed === true,
      denied: data.denied === true,
      path: data.path ?? null,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Falha de conexão' };
  }
}
