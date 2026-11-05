/* Programações do K-AI: Automações > Lembretes. Formulário completo com
   salvamento automático a cada digitação (banco + aparelho), lista com status
   Pendente/Enviado/Falhou e ações Executar agora / Editar / Excluir / Duplicar. */

import { useEffect, useMemo, useState } from 'react';
import {
  AlarmClock, CalendarClock, CheckCircle2, Clock, Copy, Loader2, Pencil,
  Plus, RefreshCw, Send, Trash2, X, XCircle, ChevronRight, ArrowLeft,
} from 'lucide-react';
import {
  type KaiAutomation, type Channel, type RepeatMode,
  listAutomations, saveAutomation, deleteAutomation, duplicateAutomation,
  executeAutomation, emptyAutomation,
} from '@/lib/kaiAutomations';

type View = 'list' | 'form';

const CHANNELS: Array<{ id: Channel; label: string }> = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'call', label: 'Ligação' },
];

const REPEATS: Array<{ id: RepeatMode; label: string }> = [
  { id: 'once', label: 'Só uma vez' },
  { id: 'daily', label: 'Todo dia' },
  { id: 'weekly', label: 'Toda semana' },
  { id: 'monthly', label: 'Todo mês' },
  { id: 'yearly', label: 'Todo ano' },
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const inputCls =
  'w-full bg-black/60 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-cyan-100 placeholder:text-cyan-200/30 outline-none';

export default function KaiProgramacoes({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>('list');
  const [items, setItems] = useState<KaiAutomation[] | null>(null);
  const [editing, setEditing] = useState<KaiAutomation>(emptyAutomation());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    listAutomations()
      .then(setItems)
      .catch((e: unknown) => {
        setItems([]);
        setError(e instanceof Error ? e.message : 'Não carregou a lista.');
      });
  }, []);

  // Salvamento automático: qualquer mudança no formulário grava sozinha.
  const patch = useMemo(
    () => (changes: Partial<KaiAutomation>) => {
      setEditing((prev) => ({ ...prev, ...changes }));
      setSaving(true);
      setEditing((prev) => {
        const next = { ...prev, ...changes };
        saveAutomation(next)
          .then((saved) => {
            setEditing((cur) => (cur.id === next.id || !next.id ? { ...cur, id: saved.id } : cur));
            setError('');
            setItems((list) => {
              const others = (list ?? []).filter((x) => x.id !== saved.id);
              return [saved, ...others];
            });
          })
          .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Falhou ao salvar.'))
          .finally(() => setSaving(false));
        return next;
      });
    },
    []
  );

  const startNew = () => {
    setEditing(emptyAutomation());
    setView('form');
  };

  const startEdit = (a: KaiAutomation) => {
    setEditing(a);
    setView('form');
  };

  const doExecute = async (a: KaiAutomation) => {
    setExecuting(a.id);
    try {
      await executeAutomation(a);
      setItems(await listAutomations());
    } finally {
      setExecuting(null);
    }
  };

  const doDelete = async (id: string) => {
    setItems((prev) => (prev ?? []).filter((x) => x.id !== id));
    try {
      await deleteAutomation(id);
    } catch {
      setError('Não consegui excluir.');
    }
  };

  const doDuplicate = async (a: KaiAutomation) => {
    try {
      const copy = await duplicateAutomation(a);
      setItems((prev) => [copy, ...(prev ?? [])]);
    } catch {
      setError('Não consegui duplicar.');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4" data-modal-screen>
      <div className="w-full max-w-md bg-zinc-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/20 max-h-[85vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-sm flex items-center gap-2">
            {view === 'list' ? (
              <><CalendarClock size={16} /> PROGRAMAÇÕES</>
            ) : (
              <>
                <button onClick={() => setView('list')} className="text-white/80 hover:text-white" aria-label="Voltar">
                  <ArrowLeft size={16} />
                </button>
                LEMBRETES
              </>
            )}
          </span>
          <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {view === 'list' && (
          <div className="p-4 overflow-y-auto space-y-3">
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => { setEditing(emptyAutomation()); setView('form'); }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/60 hover:bg-zinc-800/60 transition text-sm font-semibold text-zinc-200"
              >
                <AlarmClock size={16} className="text-cyan-400" />
                Lembretes
                <ChevronRight size={14} className="ml-auto text-zinc-500" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-[0.25em] text-cyan-300/80">
                MINHAS AUTOMAÇÕES
              </h3>
              <button
                onClick={startNew}
                className="flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg px-3 py-1.5 transition-colors"
              >
                <Plus size={14} /> NOVO LEMBRETE
              </button>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}
            {items === null && (
              <p className="text-zinc-500 text-xs flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Carregando...
              </p>
            )}
            {items?.length === 0 && (
              <p className="text-zinc-500 text-xs">Nenhum lembrete ainda. Crie o primeiro.</p>
            )}

            {items?.map((a) => (
              <div
                key={a.id}
                className="border border-zinc-800 bg-zinc-900/50 rounded-xl px-3 py-2.5 space-y-1.5"
              >
                <div className="flex items-start gap-2">
                  {a.status === 'sent' ? (
                    <CheckCircle2 size={15} className="text-emerald-400 mt-0.5" />
                  ) : a.status === 'failed' ? (
                    <XCircle size={15} className="text-red-400 mt-0.5" />
                  ) : (
                    <Clock size={15} className="text-amber-400 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 break-words">
                      {a.title || a.message?.slice(0, 50) || 'Lembrete'}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {a.scheduled_at
                        ? new Date(a.scheduled_at).toLocaleString('pt-BR')
                        : 'Sem data'}{' '}
                      • {a.channels.map((c) => CHANNELS.find((x) => x.id === c)?.label).join(', ')}
                    </p>
                    <p className="text-[10px] mt-0.5">
                      <span
                        className={
                          a.status === 'sent'
                            ? 'text-emerald-400'
                            : a.status === 'failed'
                              ? 'text-red-400'
                              : 'text-amber-400'
                        }
                      >
                        {a.status === 'sent' ? 'Enviado' : a.status === 'failed' ? 'Falhou' : 'Pendente'}
                      </span>
                      {a.last_error && <span className="text-amber-400"> • {a.last_error}</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {a.status === 'failed' && (
                    <button
                      onClick={() => doExecute(a)}
                      disabled={executing === a.id}
                      className="flex items-center gap-1 text-[10px] font-bold text-cyan-300 hover:text-cyan-200 disabled:opacity-40"
                    >
                      <RefreshCw size={10} /> TENTAR DE NOVO
                    </button>
                  )}
                  <button
                    onClick={() => doExecute(a)}
                    disabled={executing === a.id}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
                  >
                    {executing === a.id ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />}
                    EXECUTAR AGORA
                  </button>
                  <button
                    onClick={() => startEdit(a)}
                    className="text-zinc-400 hover:text-white ml-auto"
                    aria-label="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => doDuplicate(a)}
                    className="text-zinc-400 hover:text-white"
                    aria-label="Duplicar"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={() => doDelete(a.id)}
                    className="text-zinc-500 hover:text-red-400"
                    aria-label="Excluir"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'form' && (
          <KaiLembretesForm value={editing} onChange={patch} saving={saving} />
        )}
      </div>
    </div>
  );
}

/* ---------------- Formulário de Lembretes ---------------- */

function KaiLembretesForm({
  value,
  onChange,
  saving,
}: {
  value: KaiAutomation;
  onChange: (changes: Partial<KaiAutomation>) => void;
  saving: boolean;
}) {
  const toggleChannel = (c: Channel) => {
    const has = value.channels.includes(c);
    const next = has ? value.channels.filter((x) => x !== c) : [...value.channels, c];
    onChange({ channels: next });
  };

  const toggleWeekday = (d: number) => {
    const has = value.weekdays.includes(d);
    onChange({
      weekdays: has ? value.weekdays.filter((x) => x !== d) : [...value.weekdays, d],
    });
  };

  return (
    <div className="p-4 overflow-y-auto space-y-4">
      {saving && (
        <p className="text-[10px] text-emerald-400 flex items-center gap-1.5">
          <Loader2 size={10} className="animate-spin" /> Salvando automaticamente...
        </p>
      )}

      {/* Título */}
      <div>
        <label className="text-xs font-semibold tracking-widest text-cyan-300 block mb-1.5">
          TÍTULO (OPCIONAL)
        </label>
        <input
          value={value.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          className={inputCls}
          placeholder="Ex.: Avisar treino"
        />
      </div>

      {/* Canais */}
      <div>
        <label className="text-xs font-semibold tracking-widest text-cyan-300 block mb-1.5">
          CANAIS (escolha 1, vários ou todos)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CHANNELS.map((c) => {
            const on = value.channels.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleChannel(c.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm border transition ${
                  on
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                    : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center text-[9px] font-bold ${
                    on ? 'bg-cyan-400 border-cyan-400 text-black' : 'border-zinc-600'
                  }`}
                >
                  {on ? '✓' : ''}
                </span>
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dados por canal */}
      {value.channels.includes('whatsapp') && (
        <ChannelBlock title="WHATSAPP">
          <input
            value={value.wa_from}
            onChange={(e) => onChange({ wa_from: e.target.value })}
            className={inputCls}
            placeholder="WhatsApp de quem vai enviar (seu) com DDD"
            inputMode="tel"
          />
          <input
            value={value.wa_to}
            onChange={(e) => onChange({ wa_to: e.target.value })}
            className={inputCls}
            placeholder="WhatsApp pra quem vai enviar, com DDD"
            inputMode="tel"
          />
          <input
            value={value.wa_to_name}
            onChange={(e) => onChange({ wa_to_name: e.target.value })}
            className={inputCls}
            placeholder="Nome da pessoa"
          />
        </ChannelBlock>
      )}

      {value.channels.includes('email') && (
        <ChannelBlock title="EMAIL">
          <input
            value={value.email_from}
            onChange={(e) => onChange({ email_from: e.target.value })}
            className={inputCls}
            placeholder="Email de quem vai enviar (seu)"
            inputMode="email"
          />
          <input
            value={value.email_to}
            onChange={(e) => onChange({ email_to: e.target.value })}
            className={inputCls}
            placeholder="Email pra quem vai enviar"
            inputMode="email"
          />
        </ChannelBlock>
      )}

      {value.channels.includes('sms') && (
        <ChannelBlock title="SMS">
          <input
            value={value.sms_from}
            onChange={(e) => onChange({ sms_from: e.target.value })}
            className={inputCls}
            placeholder="SMS de quem (seu número)"
            inputMode="tel"
          />
          <input
            value={value.sms_to}
            onChange={(e) => onChange({ sms_to: e.target.value })}
            className={inputCls}
            placeholder="SMS pra quem"
            inputMode="tel"
          />
          <input
            value={value.sms_to_name}
            onChange={(e) => onChange({ sms_to_name: e.target.value })}
            className={inputCls}
            placeholder="Nome da pessoa"
          />
        </ChannelBlock>
      )}

      {value.channels.includes('call') && (
        <ChannelBlock title="LIGAÇÃO">
          <input
            value={value.call_from}
            onChange={(e) => onChange({ call_from: e.target.value })}
            className={inputCls}
            placeholder="Ligação de quem (seu)"
            inputMode="tel"
          />
          <input
            value={value.call_to}
            onChange={(e) => onChange({ call_to: e.target.value })}
            className={inputCls}
            placeholder="Ligação pra quem"
            inputMode="tel"
          />
          <input
            value={value.call_to_name}
            onChange={(e) => onChange({ call_to_name: e.target.value })}
            className={inputCls}
            placeholder="Nome da pessoa"
          />
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={value.voice_call}
              onChange={(e) => onChange({ voice_call: e.target.checked })}
              className="w-4 h-4 accent-cyan-500"
            />
            Ativar voz na ligação (K-AI fala a mensagem ao atender)
          </label>
          {value.voice_call && (
            <p className="text-[10px] text-amber-400/90">
              A voz dentro da chamada precisa do app Android do Korvil. Hoje: o K-AI liga na hora
              programada e, em paralelo, avisa você com a mensagem em voz alta.
            </p>
          )}
        </ChannelBlock>
      )}

      {/* Mensagens */}
      {value.channels.length > 0 && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={value.same_message}
              onChange={(e) => onChange({ same_message: e.target.checked })}
              className="w-4 h-4 accent-cyan-500"
            />
            Usar mesma mensagem para todos os canais
          </label>
          {value.same_message ? (
            <textarea
              value={value.message}
              onChange={(e) => onChange({ message: e.target.value })}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Mensagem para todos os canais"
            />
          ) : (
            value.channels.map((c) => (
              <div key={c}>
                <label className="text-[10px] font-bold tracking-widest text-cyan-300/80 block mb-1">
                  MENSAGEM {c.toUpperCase()}
                </label>
                <textarea
                  value={value.messages_by_channel[c] ?? ''}
                  onChange={(e) =>
                    onChange({
                      messages_by_channel: {
                        ...value.messages_by_channel,
                        [c]: e.target.value,
                      },
                    })
                  }
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* Data e hora */}
      <div>
        <label className="text-xs font-semibold tracking-widest text-cyan-300 block mb-1.5">
          PROGRAMAR DATA E HORÁRIO
        </label>
        <input
          type="datetime-local"
          value={value.scheduled_at ? toLocalInput(value.scheduled_at) : ''}
          onChange={(e) =>
            onChange({
              scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : null,
            })
          }
          className={inputCls}
        />
      </div>

      {/* Repetição */}
      <div>
        <label className="text-xs font-semibold tracking-widest text-cyan-300 block mb-1.5">
          REPETIR
        </label>
        <select
          value={value.repeat}
          onChange={(e) => onChange({ repeat: e.target.value as RepeatMode })}
          className={inputCls}
        >
          {REPEATS.map((r) => (
            <option key={r.id} value={r.id} className="bg-zinc-900">
              {r.label}
            </option>
          ))}
        </select>
        {value.repeat === 'weekly' && (
          <div className="flex gap-1.5 mt-2">
            {WEEKDAYS.map((d, i) => {
              const on = value.weekdays.includes(i);
              return (
                <button
                  key={d}
                  onClick={() => toggleWeekday(i)}
                  className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold border transition ${
                    on
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                      : 'bg-black/40 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-[10px] text-zinc-500">
        Tudo salva sozinho enquanto você digita. Na hora marcada, o K-AI envia nos canais
        escolhidos, avisa você com notificação + voz e registra o status aqui.
      </p>
    </div>
  );
}

function ChannelBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-cyan-500/20 rounded-xl p-3 bg-black/40 space-y-2">
      <p className="text-[10px] font-bold tracking-widest text-cyan-300/80">{title}</p>
      {children}
    </div>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
