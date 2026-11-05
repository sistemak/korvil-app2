/* Cliente do sistema de evolução autônoma do K-AI.
   Conecta o frontend à edge function kai-evolve e à tabela kai_proposals. */

import { supabase } from '@/lib/korvilAuth';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const EVOLVE_URL = `${SUPABASE_URL}/functions/v1/kai-evolve`;

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'executing' | 'executed' | 'failed';
export type ActionType = 'improve_ui' | 'fix_bug' | 'add_feature' | 'optimize' | 'refactor' | 'new_automation';

export interface KaiProposal {
  id: string;
  title: string;
  description: string;
  action_type: ActionType;
  target_file: string | null;
  proposed_changes: { reasoning?: string } | null;
  status: ProposalStatus;
  provider: string;
  push_sent: boolean;
  user_response: string | null;
  response_at: string | null;
  execution_result: { error?: string; file?: string; commit?: string; provider?: string } | null;
  executed_at: string | null;
  cycle_number: number;
  created_at: string;
}

export interface EvolutionLogEntry {
  id: string;
  proposal_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  provider: string | null;
  created_at: string;
}

export interface ProviderHealth {
  groq: { available: boolean; lastCheck: number };
  gemini: { available: boolean; lastCheck: number };
  pollinations: { available: boolean; lastCheck: number };
}

/* ---- Proposals ---- */

export async function listProposals(limit = 20): Promise<KaiProposal[]> {
  const { data, error } = await supabase
    .from('kai_proposals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as KaiProposal[];
}

export async function getPendingProposal(): Promise<KaiProposal | null> {
  const { data, error } = await supabase
    .from('kai_proposals')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as KaiProposal) ?? null;
}

export async function getProposal(id: string): Promise<KaiProposal | null> {
  const { data, error } = await supabase
    .from('kai_proposals')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as KaiProposal) ?? null;
}

/* ---- Evolution log ---- */

export async function listEvolutionLog(limit = 30): Promise<EvolutionLogEntry[]> {
  const { data, error } = await supabase
    .from('kai_evolution_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as EvolutionLogEntry[];
}

/* ---- Execute / Reject (from UI or from notification SIM/NÃO) ---- */

export async function executeProposal(proposalId: string): Promise<{ ok: boolean; error?: string; file?: string; commit?: string }> {
  try {
    const res = await fetch(EVOLVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action: 'execute', proposal_id: proposalId }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data?.error ?? `Servidor respondeu ${res.status}` };
    }
    const data = await res.json();
    return { ok: data.ok === true, error: data.error, file: data.file, commit: data.commit };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Falha de conexão' };
  }
}

export async function rejectProposal(proposalId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(EVOLVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action: 'reject', proposal_id: proposalId }),
    });
    if (!res.ok) return { ok: false, error: `Servidor respondeu ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Falha de conexão' };
  }
}

/* ---- Manual cycle trigger ---- */

export async function triggerEvolutionCycle(): Promise<{ ok: boolean; proposal_id?: string; title?: string; provider?: string; error?: string }> {
  try {
    const res = await fetch(EVOLVE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ action: 'generate' }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data?.error ?? `Servidor respondeu ${res.status}` };
    }
    return await res.json();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Falha de conexão' };
  }
}

/* ---- Provider health check (tests each AI endpoint) ---- */

export async function checkProviderHealth(): Promise<ProviderHealth> {
  const health: ProviderHealth = {
    groq: { available: false, lastCheck: Date.now() },
    gemini: { available: false, lastCheck: Date.now() },
    pollinations: { available: false, lastCheck: Date.now() },
  };

  // Pollinations — public, no key needed, test from frontend
  try {
    const res = await fetch('https://text.pollinations.ai/models', { signal: AbortSignal.timeout(5000) });
    health.pollinations.available = res.ok;
  } catch { /* offline */ }

  // Groq and Gemini — keys are server-side only, so we test via the korvil-ai function
  // by sending a tiny prompt with provider_pref set to each
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/korvil-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ prompt: 'ping', provider_pref: 'groq', setor: 'central', history: [] }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      health.groq.available = data.provider === 'groq';
    }
  } catch { /* groq offline */ }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/korvil-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ prompt: 'ping', provider_pref: 'gemini', setor: 'central', history: [] }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const data = await res.json();
      health.gemini.available = data.provider === 'gemini';
    }
  } catch { /* gemini offline */ }

  return health;
}

/* ---- Parse proposal ID from URL (when user taps notification and app opens) ---- */

export function getProposalIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('kai-proposal');
}

/* ---- Stats ---- */

export async function getEvolutionStats(): Promise<{ total: number; pending: number; executed: number; rejected: number; failed: number }> {
  const { count: total } = await supabase.from('kai_proposals').select('*', { count: 'exact', head: true });
  const { count: pending } = await supabase.from('kai_proposals').select('*', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: executed } = await supabase.from('kai_proposals').select('*', { count: 'exact', head: true }).eq('status', 'executed');
  const { count: rejected } = await supabase.from('kai_proposals').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
  const { count: failed } = await supabase.from('kai_proposals').select('*', { count: 'exact', head: true }).eq('status', 'failed');
  return {
    total: total ?? 0,
    pending: pending ?? 0,
    executed: executed ?? 0,
    rejected: rejected ?? 0,
    failed: failed ?? 0,
  };
}
