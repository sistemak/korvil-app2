/* Histórico do K-AI: diário de tudo que ele fez (o que mudou, quando, onde),
   com desfazer — volta o arquivo anterior no GitHub. */

import { pushFileToRepo, readRepoFile } from '@/lib/kaiExec';

export interface KaiHistoryEntry {
  id: string;
  what: string;       // o que foi pedido
  file: string;       // onde mexeu
  summary: string;    // o que fez
  when: string;       // quando (ISO)
  undoContent?: string; // conteúdo anterior do arquivo, para desfazer
}

const KEY = 'kai-history';
const MAX = 50;

export function loadHistory(): KaiHistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as KaiHistoryEntry[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<KaiHistoryEntry, 'id' | 'when'>): void {
  const all = loadHistory();
  const e: KaiHistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    when: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify([e, ...all].slice(0, MAX)));
  } catch {
    // storage cheio: ignora
  }
}

/** Desfaz: grava de volta o conteúdo anterior do arquivo no GitHub. */
export async function undoEntry(entry: KaiHistoryEntry): Promise<{ ok: boolean; error?: string }> {
  if (!entry.undoContent) return { ok: false, error: 'Não tenho o estado anterior deste arquivo.' };
  return pushFileToRepo(
    entry.file,
    entry.undoContent,
    `K-AI: desfazendo "${entry.what.slice(0, 80)}"`
  );
}

/** Guarda o estado atual de um arquivo antes de o K-AI mexer (para permitir desfazer). */
export async function snapshotBefore(file: string): Promise<string | undefined> {
  const current = await readRepoFile(file);
  return current ?? undefined;
}
