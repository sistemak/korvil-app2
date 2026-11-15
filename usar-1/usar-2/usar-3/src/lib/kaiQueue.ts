/* Fila automática do K-AI: as tarefas executam uma por uma, sem ninguém clicar em nada.
   Cada tarefa entra na fila ao ser criada; a fila roda no próprio app e avisa por
   notificação + voz quando cada tarefa termina. */

import { supabase } from '@/lib/korvilAuth';
import { notifyTaskDone } from '@/lib/kaiNotify';
import { speak, playBip } from '@/lib/kaiVoice';
import { askKaiBrain } from '@/lib/kaiBrain';
import { pickAddress, speechText } from '@/lib/kaiPersonality';
import { isCreator } from '@/lib/creatorMode';

export interface QueueItem {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  startedAt?: number;
  error?: string;
}

type Listener = (items: QueueItem[]) => void;

let items: QueueItem[] = [];
let running = false;
const listeners = new Set<Listener>();

function emit() {
  for (const l of listeners) l(items);
}

export function onQueueChange(l: Listener): () => void {
  listeners.add(l);
  l(items);
  return () => listeners.delete(l);
}

export function getQueue(): QueueItem[] {
  return items;
}

/** Coloca uma tarefa na fila de execução automática. */
export function enqueueTask(id: string, title: string): void {
  if (items.some((i) => i.id === id)) return;
  items = [...items, { id, title, status: 'pending' }];
  emit();
  void runQueue();
}

/** Fila automática: executa uma tarefa por vez, na ordem de chegada. */
export async function runQueue(): Promise<void> {
  if (running) return;
  running = true;
  try {
    for (;;) {
      const next = items.find((i) => i.status === 'pending');
      if (!next) break;
      items = items.map((i) =>
        i.id === next.id ? { ...i, status: 'processing', startedAt: Date.now() } : i
      );
      emit();
      playBip();
      const ok = await executeTask(next);
      items = items.map((i) =>
        i.id === next.id ? { ...i, status: ok ? 'done' : 'failed', error: ok ? undefined : 'Falhou' } : i
      );
      emit();
      await notifyTaskDone(next.id, next.title, ok);
    }
  } finally {
    running = false;
  }
}

/** Executa uma tarefa: a IA decide o que fazer e o servidor grava no GitHub. */
async function executeTask(task: QueueItem): Promise<boolean> {
  try {
    if (!isCreator()) {
      await speak(speechText('Somente o criador pode executar tarefas de mudança.'));
      return false;
    }
    const res = await askKaiBrain(
      [
        {
          role: 'user',
          text: `ORDEM DE EXECUÇÃO (fila automática): ${task.title}. Execute a mudança real no app agora (action "edit_file").`,
        },
      ],
      { isAdmin: true }
    );
    const ok = res.ok && res.executed === true;
    await supabase
      .from('kai_tasks')
      .update({
        status: ok ? 'done' : 'pending',
        result: ok
          ? 'Executada pela fila automática'
          : res.error ?? (res.reply ? `IA respondeu sem executar: ${res.reply.slice(0, 80)}` : 'Não executou'),
        published_at: ok ? new Date().toISOString() : null,
      })
      .eq('id', task.id);
    if (!ok) {
      const fail = `A tarefa "${task.title}" falhou. Quer que eu tente de novo, ${pickAddress('auxilio')}?`;
      speak(speechText(fail));
    }
    return ok;
  } catch (e) {
    const fail = `A tarefa "${task.title}" falhou. Quer que eu tente de novo, ${pickAddress('auxilio')}?`;
    speak(speechText(fail));
    void e;
    return false;
  }
}

/** Reprocessa as que falharam (usado pelo botão "tentar de novo" e pela voz). */
export function retryFailed(): void {
  items = items.map((i) => (i.status === 'failed' ? { ...i, status: 'pending', error: undefined } : i));
  emit();
  void runQueue();
}
