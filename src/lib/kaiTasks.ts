/* Tarefas do K-AI: pedidos recorrentes salvos no banco, executados ao publicar. */

import { supabase } from '@/lib/korvilAuth';

export interface KaiTask {
  id: string;
  title: string;
  status: 'pending' | 'done';
  result: string | null;
  published_at: string | null;
  created_at: string;
}

export async function listTasks(): Promise<KaiTask[]> {
  const { data, error } = await supabase
    .from('kai_tasks')
    .select('id, title, status, result, published_at, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as KaiTask[];
}

export async function createTask(title: string): Promise<KaiTask> {
  const clean = title.trim();
  if (!clean) throw new Error('Descreva a tarefa.');
  const { data, error } = await supabase
    .from('kai_tasks')
    .insert({ title: clean })
    .select('id, title, status, result, published_at, created_at')
    .single();
  if (error) throw new Error(error.message);
  return data as KaiTask;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('kai_tasks').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export interface PublishResult {
  published: number;
  failed: number;
}

/**
 * Publica todas as tarefas pendentes: marca cada uma como feita.
 * A gravação real no projeto é feita pelo fluxo de execução da K-AI.
 */
export async function publishPendingTasks(
  publish: (title: string) => Promise<{ ok: boolean; error?: string }>,
  onDone?: (task: KaiTask, ok: boolean) => Promise<void> | void
): Promise<PublishResult> {
  const pending = (await listTasks()).filter((t) => t.status === 'pending');
  let published = 0;
  let failed = 0;
  for (const t of pending) {
    const r = await publish(t.title);
    const ok = r.ok;
    if (ok) {
      published++;
      await supabase
        .from('kai_tasks')
        .update({ status: 'done', result: r.error ? r.error : 'Publicado', published_at: new Date().toISOString() })
        .eq('id', t.id);
    } else {
      failed++;
      await supabase
        .from('kai_tasks')
        .update({ result: r.error ?? 'Falha ao publicar' })
        .eq('id', t.id);
    }
    if (onDone) await onDone(t, ok);
  }
  return { published, failed };
}
