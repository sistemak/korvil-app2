/* Painel de tarefas do K-AI: lista o que foi pedido e permite ditar novas tarefas. */

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, ListTodo, Loader2, Plus, Send, Trash2, X, XCircle } from 'lucide-react';
import { createTask, deleteTask, listTasks, publishPendingTasks, type KaiTask } from '@/lib/kaiTasks';
import { speechText, pickAddress } from '@/lib/kaiPersonality';
import { speak } from '@/lib/kaiVoice';
import { askKaiBrain } from '@/lib/kaiBrain';
import { ensureNotificationPermission, notifyTaskDone } from '@/lib/kaiNotify';
import { enqueueTask, onQueueChange, retryFailed, type QueueItem } from '@/lib/kaiQueue';
import { loadHistory, undoEntry, type KaiHistoryEntry } from '@/lib/kaiHistory';
import { countOfflineOrders } from '@/lib/kaiOffline';

interface Props {
  open: boolean;
  onClose: () => void;
  onPublished?: () => void;
  email?: string;
  isAdmin?: boolean;
  highlightId?: string | null;
}

export default function KAITasksPanel({ open, onClose, onPublished, email, isAdmin, highlightId }: Props) {
  const [tasks, setTasks] = useState<KaiTask[] | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState('');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [hist, setHist] = useState<KaiHistoryEntry[]>([]);
  const [undoing, setUndoing] = useState<string | null>(null);
  const [offlineCount, setOfflineCount] = useState(countOfflineOrders());

  useEffect(() => onQueueChange(setQueue), []);
  useEffect(() => setHist(loadHistory()), [open]);

  const doUndo = async (entry: KaiHistoryEntry) => {
    setUndoing(entry.id);
    const r = await undoEntry(entry);
    setUndoing(null);
    speak(
      speechText(
        r.ok
          ? `Desfeito. Voltei o arquivo como estava antes, ${pickAddress('auxilio')}.`
          : `Não consegui desfazer: ${r.error ?? 'erro'}`
      )
    );
  };

  useEffect(() => {
    if (!open) return;
    setError('');
    listTasks()
      .then(setTasks)
      .catch((e: unknown) => {
        setTasks([]);
        setError(e instanceof Error ? e.message : 'Não carregou a lista.');
      });
  }, [open]);

  if (!open) return null;

  const add = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      const t = await createTask(draft);
      setTasks((prev) => [t, ...(prev ?? [])]);
      setDraft('');
      enqueueTask(t.id, t.title);
      const msg = `Tarefa na fila, ${pickAddress('auxilio')}. Vou executar sozinho agora e te aviso quando terminar.`;
      speak(speechText(msg));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não consegui salvar a tarefa.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setTasks((prev) => (prev ?? []).filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch {
      setError('Não consegui apagar a tarefa.');
    }
  };

  const pendingCount = tasks?.filter((t) => t.status === 'pending').length ?? 0;

  const publish = async () => {
    if (publishing || pendingCount === 0) return;
    setPublishing(true);
    setError('');
    setPublishMsg('');
    try {
      const r = await publishPendingTasks(async (title) => {
        // A IA decide o que fazer com o pedido e o servidor grava no GitHub.
        const res = await askKaiBrain(
          [{ role: 'user', text: `ORDEM DE EXECUÇÃO (tarefa salva): ${title}. Execute a mudança real no app agora (action "edit_file").` }],
          { email, isAdmin }
        );
        if (res.ok && res.executed) return { ok: true };
        if (res.ok && res.denied) return { ok: false, error: 'Somente o ADM pode publicar mudanças' };
        return { ok: false, error: res.error ?? (res.reply ? `IA respondeu sem executar: ${res.reply.slice(0, 80)}` : 'Não executou') };
      }, async (task, ok) => {
        await notifyTaskDone(task.id, task.title, ok);
      });
      setTasks(await listTasks());
      const msg =
        r.published > 0
          ? `Publicadas ${r.published} tarefa(s), ${pickAddress('valorizacao')}.${r.failed ? ` ${r.failed} falharam.` : ''}`
          : 'Nenhuma tarefa pôde ser publicada.';
      setPublishMsg(msg);
      speak(speechText(msg));
      onPublished?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao publicar.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" data-modal-screen>
      <div className="w-full max-w-md bg-zinc-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/20 max-h-[85vh] flex flex-col">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <ListTodo size={16} /> TAREFAS DA K-AI
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          <button
            onClick={publish}
            disabled={publishing || pendingCount === 0}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl py-3 transition-colors"
          >
            {publishing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            PUBLICAR PROJETO{pendingCount > 0 ? ` (${pendingCount})` : ''}
          </button>
          {publishMsg && <p className="text-emerald-400 text-xs text-center">{publishMsg}</p>}

          <div className="border border-cyan-500/30 rounded-xl p-3 bg-black/40">
            <label className="text-xs font-semibold tracking-widest text-cyan-300 block mb-2">
              NOVA TAREFA
            </label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ex.: faça todo dia atualização do sistema. Ex.: faça todo dia melhorias e evolução automática da Central."
              rows={3}
              className="w-full bg-black/60 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-cyan-100 placeholder:text-cyan-200/30 outline-none resize-none"
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            <button
              onClick={add}
              disabled={saving || !draft.trim()}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm rounded-lg py-2.5 transition-colors"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              SALVAR TAREFA
            </button>
            <p className="text-[10px] text-zinc-500 mt-2">
              A tarefa entra na fila e o K-AI executa sozinho, uma por uma, te avisando com notificação e voz.
            </p>
          </div>

          {/* Fila automática */}
          {queue.length > 0 && (
            <div className="border border-cyan-500/20 rounded-xl p-3 bg-black/40">
              <h3 className="text-[10px] font-bold tracking-[0.25em] text-cyan-300/80 mb-2">FILA AUTOMÁTICA</h3>
              <div className="space-y-1">
                {queue.map((q) => (
                  <div key={q.id} className="flex items-center gap-2 text-xs">
                    {q.status === 'processing' ? (
                      <Loader2 size={12} className="animate-spin text-cyan-400" />
                    ) : q.status === 'done' ? (
                      <CheckCircle2 size={12} className="text-emerald-400" />
                    ) : q.status === 'failed' ? (
                      <XCircle size={12} className="text-red-400" />
                    ) : (
                      <Clock size={12} className="text-zinc-500" />
                    )}
                    <span className="text-zinc-300 truncate flex-1">{q.title}</span>
                    {q.status === 'failed' && (
                      <button
                        onClick={retryFailed}
                        className="text-cyan-400 text-[10px] font-bold shrink-0"
                      >
                        TENTAR DE NOVO
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico com desfazer */}
          {hist.length > 0 && (
            <div className="border border-zinc-800 rounded-xl p-3 bg-black/40">
              <h3 className="text-[10px] font-bold tracking-[0.25em] text-zinc-400 mb-2">DIÁRIO DO K-AI</h3>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {hist.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 text-[11px]">
                    <span className="text-zinc-500 shrink-0">
                      {new Date(h.when).toLocaleDateString('pt-BR')}{' '}
                      {new Date(h.when).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-zinc-300 truncate flex-1">{h.summary}</span>
                    {h.undoContent && (
                      <button
                        onClick={() => doUndo(h)}
                        disabled={undoing === h.id}
                        className="text-cyan-400 text-[10px] font-bold shrink-0 disabled:opacity-40"
                      >
                        {undoing === h.id ? '...' : 'DESFAZER'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-semibold tracking-[0.25em] text-cyan-300/80 mb-2">MINHAS TAREFAS</h3>
            {tasks === null && (
              <p className="text-zinc-500 text-xs flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Carregando...
              </p>
            )}
            {tasks?.length === 0 && (
              <p className="text-zinc-500 text-xs">Nenhuma tarefa ainda. Descreva a primeira acima.</p>
            )}
            <div className="space-y-2">
              {tasks?.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-start gap-2 border rounded-xl px-3 py-2.5 transition ${
                    highlightId === t.id
                      ? 'border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                      : 'border-zinc-800 bg-zinc-900/50'
                  }`}
                >
                  {highlightId === t.id && (
                    <span className="text-[9px] font-bold tracking-widest text-cyan-300 uppercase block">
                      Tarefa desta notificação
                    </span>
                  )}
                  <CheckCircle2
                    size={16}
                    className={t.status === 'done' ? 'text-emerald-400 mt-0.5' : 'text-zinc-600 mt-0.5'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 break-words">{t.title}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {t.status === 'done'
                        ? `Feita${t.published_at ? ` em ${new Date(t.published_at).toLocaleDateString('pt-BR')}` : ''}`
                        : 'Aguardando publicação'}
                    </p>
                    {t.status !== 'done' && t.result && (
                      <p className="text-[10px] text-amber-400 mt-0.5">{t.result}</p>
                    )}
                  </div>
                  <button
                    onClick={() => remove(t.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors mt-0.5"
                    aria-label="Apagar tarefa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center gap-2">
          <Plus size={12} className="text-cyan-400" />
          {offlineCount > 0
            ? `${offlineCount} ordem(ns) guardada(s) sem internet — vão sozinhas quando voltar a conexão.`
            : 'Fila automática ativa. O K-AI avisa com notificação + voz a cada tarefa.'}
        </div>
      </div>
    </div>
  );
}
