import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Trash2, MessageSquare, ShieldCheck } from 'lucide-react';
import KAIRightMenu, { type KaiTarget } from '@/components/KAIRightMenu';
import KAITasksPanel from '@/components/KAITasksPanel';
import KaiProgramacoes from '@/components/KaiProgramacoes';
import LaboratorioPage from '@/components/LaboratorioPage';
import { publishPendingTasks } from '@/lib/kaiTasks';
import { startAutomationScheduler, checkDue } from '@/lib/kaiAutomations';
import BoltInputBox from '@/components/BoltInputBox';
import { speak, stopSpeaking, WakeListener, playBip } from '@/lib/kaiVoice';
import { buildReply, contextualWhisper, greeting, pickAddress, readyReply, setKaiUserName, setKaiCreatorMode, speechText } from '@/lib/kaiPersonality';
import { isAdminEmail, isCreator, markAsCreator, runCreatorAction } from '@/lib/creatorMode';
import { runUnlimited, executeCall, ensureUnlimitedReady, type PendingCall } from '@/lib/kaiUnlimited';
import { pushFileToRepo, detectAppChange, applySimpleChange } from '@/lib/kaiExec';
import { askKaiBrain } from '@/lib/kaiBrain';
import { ensureNotificationPermission, notifyTaskDone } from '@/lib/kaiNotify';
import { enqueueTask } from '@/lib/kaiQueue';
import { addHistory, snapshotBefore } from '@/lib/kaiHistory';
import { saveOfflineOrder, startOfflineSync, countOfflineOrders } from '@/lib/kaiOffline';
import { runDailyBackup } from '@/lib/kaiBackup';
import { getSessionUser, getMyProfile, displayName } from '@/lib/korvilAuth';

const POS_KEY = 'kai-btn-pos';
const HISTORY_KEY = 'kai-chat-history';

interface ChatSession {
  id: number;
  title: string;
  messages: { role: 'user' | 'kai'; text: string }[];
  updatedAt: number;
}

interface Whisper {
  id: number;
  text: string;
}

function loadHistory(): ChatSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? (JSON.parse(raw) as ChatSession[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Posição original: canto inferior direito.
function homePos() {
  return { x: window.innerWidth - 92 - 16, y: window.innerHeight - 92 - 24 };
}

function loadPos(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as { x: number; y: number };
      if (typeof p.x === 'number' && typeof p.y === 'number') return p;
    }
  } catch {
    // usa padrão
  }
  return homePos();
}

function clampPos(x: number, y: number) {
  const margin = 8;
  return {
    x: Math.max(margin, Math.min(window.innerWidth - 92 - margin, x)),
    y: Math.max(56, Math.min(window.innerHeight - 92 - margin, y)),
  };
}

export default function KAIButton() {
  const [pos, setPos] = useState(homePos);
  const [chatOpen, setChatOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rightMenuOpen, setRightMenuOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [programacoesOpen, setProgramacoesOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(loadHistory);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [pendingChange, setPendingChange] = useState<{ what: string } | null>(null);
  const [pendingCall, setPendingCall] = useState<PendingCall | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const userNameRef = useRef<string | null>(null);
  const [offlineCount, setOfflineCount] = useState(countOfflineOrders());

  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragMovedRef = useRef(false);
  const highlightTaskIdRef = useRef<string | null>(null);
  const btnRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;

  // Grava a troca de mensagens na conversa atual (ou cria uma nova).
  const appendMessages = useCallback((userText: string, kaiText: string) => {
    setSessions((prev) => {
      if (activeId !== null) {
        return prev.map((sess) =>
          sess.id === activeId
            ? {
                ...sess,
                messages: [...sess.messages, { role: 'user' as const, text: userText }, { role: 'kai' as const, text: kaiText }],
                updatedAt: Date.now(),
              }
            : sess
        );
      }
      const s: ChatSession = {
        id: Date.now(),
        title: userText.slice(0, 40),
        messages: [
          { role: 'user' as const, text: userText },
          { role: 'kai' as const, text: kaiText },
        ],
        updatedAt: Date.now(),
      };
      setActiveId(s.id);
      return [s, ...prev];
    });
  }, [activeId]);

  useEffect(() => {
    (async () => {
      const u = await getSessionUser();
      setUser(u);
      if (isAdminEmail(u?.email)) {
        markAsCreator();
        void runDailyBackup();
      }
      const p = await getMyProfile();
      if (p) {
        userNameRef.current = displayName(p);
        setKaiUserName(displayName(p));
      }
    })();
  }, []);

  // Modo offline: ordens ditas sem internet vão sozinhas quando a conexão volta.
  useEffect(() => {
    if (!user) return;
    const stop = startOfflineSync(async (text) => {
      try {
        const r = await askKaiBrain([{ role: 'user', text }], { email: user.email, isAdmin: isCreator() });
        return r.ok;
      } catch {
        return false;
      }
    });
    const t = setInterval(() => setOfflineCount(countOfflineOrders()), 3000);
    return () => {
      stop();
      clearInterval(t);
    };
  }, [user]);

  const isAdm = isCreator();
  setKaiCreatorMode(isAdm);
  void ensureUnlimitedReady();

  const pushWhisper = useCallback((text: string) => {
    const w = { id: Date.now(), text };
    setWhispers((prev) => [...prev.slice(-2), w]);
    setTimeout(() => {
      setWhispers((prev) => prev.filter((x) => x.id !== w.id));
    }, 4000);
  }, []);

  useEffect(() => {
    setPos(clampPos(loadPos().x, loadPos().y));
  }, []);

  // Notificações: pede permissão e, se o app abriu por uma notificação de tarefa,
  // destaca a tarefa, abre o painel e fala a mensagem em voz alta.
  useEffect(() => {
    if (!user) return;
    void ensureNotificationPermission();
    const params = new URLSearchParams(window.location.search);
    const taskId = params.get('tarefa');
    const say = params.get('falar');
    if (taskId) {
      params.delete('tarefa');
      params.delete('falar');
      const qs = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''));
      highlightTaskIdRef.current = taskId;
      setTasksOpen(true);
      if (say) speak(say);
    }
  }, [user]);

  // Agendador das automações: executa lembretes na hora programada.
  useEffect(() => {
    if (!user) return;
    const stop = startAutomationScheduler();
    // Abriu por notificação de automação: executa e abre o painel.
    const autoId = new URLSearchParams(window.location.search).get('automacao');
    if (autoId) {
      const qs = new URLSearchParams(window.location.search);
      qs.delete('automacao');
      const rest = qs.toString();
      window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));
      void checkDue();
      setProgramacoesOpen(true);
    }
    return stop;
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 30)));
    } catch {
      // ignora
    }
  }, [sessions]);

  const savePos = useCallback((x: number, y: number) => {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify({ x, y }));
    } catch {
      // ignora
    }
  }, []);

  // Mensagens laterais periódicas enquanto o app está aberto e o chat fechado.
  useEffect(() => {
    const id = setInterval(() => {
      if (!chatOpen && !document.hidden) {
        pushWhisper(contextualWhisper('Central Korvil'));
      }
    }, 45_000);
    const t0 = setTimeout(
      () => pushWhisper(`${greeting()}${isAdm ? ', K-RIADOR' : userNameRef.current ? `, ${userNameRef.current}` : ''}.`),
      3500
    );
    return () => {
      clearInterval(id);
      clearTimeout(t0);
    };
  }, [chatOpen, pushWhisper, isAdm]);

  const respond = useCallback(
    (text: string, talk: boolean) => {
      const { text: reply } = buildReply(text);
      appendMessages(text, reply);
      if (talk) speak(speechText(reply));
      else pushWhisper(reply);
    },
    [appendMessages, pushWhisper]
  );

  // Executa pedido de mudança confirmado (voz ou botão de confirmação do chat).
  const executeChange = useCallback(
    async (what: string) => {
      const change = await applySimpleChange(what);
      if (!change) {
        const msg = `Ainda não sei fazer isso sozinho, ${pickAddress('auxilio')}. Registrei o pedido.`;
        pushWhisper(msg);
        speak(speechText(msg));
        return;
      }
      const before = await snapshotBefore(change.path);
      const res = await pushFileToRepo(
        change.path,
        change.content,
        `K-AI: ${what.slice(0, 120)}`
      );
      if (res.ok) {
        addHistory({ what, file: change.path, summary: change.summary, undoContent: before });
      }
      const msg = res.ok
        ? `${change.summary} Salvei no GitHub, ${pickAddress('valorizacao')} — o app atualiza sozinho em instantes.`
        : `Não consegui salvar no GitHub: ${res.error}`;
      pushWhisper(msg);
      speak(speechText(msg));
    },
    [pushWhisper]
  );

  // Trata um pedido: cérebro (IA real) primeiro; modo simples como reserva.
  const handleCommand = useCallback(
    (text: string, talk: boolean) => {
      // Modo ilimitado (só criador): ações reais no celular antes de tudo.
      if (isAdm) {
        const u = runUnlimited(text);
        if (u.handled) {
          if (u.pendingAction && u.confirm) {
            setPendingCall(u.pendingAction);
            pushWhisper(u.confirm);
            speak(speechText(u.confirm));
            return;
          }
          if (u.spoken) {
            pushWhisper(u.spoken);
            speak(speechText(u.spoken));
            return;
          }
        }
      }
      const runFallback = () => {
        const change = detectAppChange(text);
        if (change) {
          if (!isAdm) {
            // Usuário comum: sem permissão para mudar o projeto. Só auxílio.
            const deny = `Mudanças no projeto são exclusivas do ADM, ${pickAddress('auxilio')}. Posso te ajudar a usar o app — é só pedir.`;
            pushWhisper(deny);
            speak(speechText(deny));
            respond(text, talk);
            return;
          }
          setPendingChange(change);
          playBip();
          const ask = buildReply(text).confirm ?? `Posso confirmar, ${pickAddress('auxilio')}? ${text.trim()}.`;
          pushWhisper(ask);
          speak(speechText(ask));
          return;
        }
        respond(text, talk);
      };

      const askBrain = () => {
        const history = [
          ...(activeSession?.messages.slice(-8) ?? []),
          { role: 'user' as const, text },
        ];

        askKaiBrain(history, { email: user?.email, isAdmin: isAdm }).then((r) => {
          if (!r.ok || !r.reply) {
            // Sem cérebro (sem chave, sem rede): volta ao modo simples.
            runFallback();
            return;
          }
          appendMessages(text, r.reply);
          if (talk) speak(speechText(r.reply));
          else pushWhisper(r.reply);
          if (r.denied) {
            const deny = 'Mudanças no projeto são exclusivas do ADM.';
            pushWhisper(deny);
            speak(speechText(deny));
          } else if (r.executed) {
            if (r.path) {
              addHistory({ what: text, file: r.path, summary: r.reply.slice(0, 120) });
            }
            const done = `Feito, ${pickAddress('valorizacao')}. Já está no GitHub — o app atualiza em instantes.`;
            pushWhisper(done);
            speak(speechText(done));
          } else if (r.path) {
            const fail = `Não consegui gravar no GitHub: ${r.error ?? 'erro desconhecido'}`;
            pushWhisper(fail);
            speak(speechText(fail));
          } else if (!r.ok && /conex|network|fetch/i.test(r.error ?? '')) {
            // Sem internet: guarda a ordem no aparelho e envia sozinho quando voltar.
            saveOfflineOrder(text);
            setOfflineCount(countOfflineOrders());
            const off = 'Estou sem internet, criador. Guardei sua ordem e vou executar sozinho quando a conexão voltar.';
            pushWhisper(off);
            speak(speechText(off));
          }
        });
      };

      if (isAdm) {
        runCreatorAction(text).then((r) => {
          if (r) {
            pushWhisper(r.spoken);
            speak(speechText(r.spoken));
            return;
          }
          askBrain();
        });
        return;
      }
      askBrain();
    },
    [pushWhisper, respond, isAdm, activeSession, user, appendMessages]
  );
  // Confirmação de ligação por voz: "sim" liga, "não" cancela.
  useEffect(() => {
    if (!pendingCall) return;
    const call = pendingCall;
    const w = new WakeListener({
      onWake: () => {},
      onCommand: (cmd) => {
        const lower = cmd.toLowerCase();
        if (/\b(sim|pode|manda|liga|confirmo|isso)\b/.test(lower)) {
          setPendingCall(null);
          const spoken = executeCall(call);
          pushWhisper(spoken);
          speak(speechText(spoken));
        } else if (/\b(n[aã]o|cancela|para|espera)\b/.test(lower)) {
          setPendingCall(null);
          const msg = `Cancelado, ${pickAddress('auxilio')}.`;
          pushWhisper(msg);
          speak(speechText(msg));
        }
      },
    });
    w.start();
    return () => w.stop();
  }, [pendingCall, pushWhisper]);

  // Confirmação por voz: "sim" executa, "não" cancela.
  useEffect(() => {
    if (!pendingChange) return;
    const what = pendingChange.what;
    const w = new WakeListener({
      onWake: () => {},
      onCommand: (cmd) => {
        const lower = cmd.toLowerCase();
        if (/\b(sim|pode|confirmo|manda|ok|isso)\b/.test(lower)) {
          setPendingChange(null);
          void executeChange(what);
        } else if (/\b(não|nao|cancela|para|espera)\b/.test(lower)) {
          setPendingChange(null);
          const msg = `Cancelado, ${pickAddress('auxilio')}.`;
          pushWhisper(msg);
          speak(speechText(msg));
        } else {
          handleCommand(cmd, true);
        }
      },
    });
    w.start();
    return () => w.stop();
  }, [pendingChange, executeChange, pushWhisper, handleCommand]);

  // Escuta contínua "KAI" (wake word) — começa junto com o app.
  useEffect(() => {
    if (!user) return; // só com sessão ativa (ADM ou usuário)
    let cancelled = false;
    let listener: WakeListener | null = null;

    const tryStart = (delay: number) => {
      const attempt = () => {
        if (cancelled) return;
        listener = new WakeListener({
          onWake: () => {
            setPulsing(true);
            setTimeout(() => setPulsing(false), 700);
            pushWhisper('Estou ouvindo...');
          },
          onCommand: (cmd) => handleCommand(cmd, true),
          onSilence: () => pushWhisper('Não foi nada. Chame de novo quando quiser.'),
        });
        listener.start();
      };
      setTimeout(attempt, delay);
    };

    tryStart(1500);
    return () => {
      cancelled = true;
      listener?.stop();
    };
  }, [handleCommand, pushWhisper, user]);

  const handlePressStart = (clientX: number, clientY: number) => {
    dragMovedRef.current = false;
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setOffset({ x: clientX - rect.left, y: clientY - rect.top });
    pressTimer.current = setTimeout(() => {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 700);
      setDragging(true);
    }, 2000);
  };

  const handlePressMove = (clientX: number, clientY: number) => {
    if (!dragging) return;
    dragMovedRef.current = true;
    setPos(clampPos(clientX - offset.x, clientY - offset.y));
  };

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (dragging) {
      setDragging(false);
      setPos((p) => {
        const cl = clampPos(p.x, p.y);
        savePos(cl.x, cl.y);
        return cl;
      });
      dragMovedRef.current = false;
    }
    // Se não estava arrastando, o clique simples é tratado pelo onClick.
  };

  const handleTap = () => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    setChatOpen((o) => {
      const next = !o;
      if (next) {
        stopSpeaking();
        speak(speechText(`${greeting()}, ${pickAddress('auxilio')}. Como posso ajudar?`));
      }
      return next;
    });
  };

  const handleDoubleTap = () => {
    const home = homePos();
    setPos(home);
    savePos(home.x, home.y);
  };

  const newChat = () => {
    setActiveId(null);
    setHistoryOpen(false);
  };

  const deleteSession = (id: number) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) setActiveId(null);
  };

  if (!user) return null;

  // Tela de perfil/login aberta: o botão fica por baixo e não pode bloquear o X.
  const modalOpen =
    typeof document !== 'undefined' && !!document.querySelector('[data-modal-screen]');

  return (
    <>
      {chatOpen && !modalOpen && (
        <div
          className="fixed z-[60] w-[300px] sm:w-[340px] bg-zinc-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden flex flex-col"
          style={{
            right: pos.x > window.innerWidth / 2 ? '16px' : 'auto',
            left: pos.x > window.innerWidth / 2 ? 'auto' : '16px',
            bottom: `${Math.max(24, window.innerHeight - pos.y - 20)}px`,
            maxHeight: '480px',
          }}
        >
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logokai.png" alt="K-AI" className="w-7 h-7 rounded-full object-cover bg-black"
                onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')}
              />
              <div>
                <span className="text-white font-bold text-sm">K-AI</span>
                <span className="text-cyan-200 text-[10px] block leading-none flex items-center gap-1">
                  {isAdm && <ShieldCheck size={10} className="text-cyan-300" />}
                  {isAdm ? 'ADM • Acesso total' : 'Online'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setHistoryOpen((h) => !h)}
                className="text-white/80 hover:text-white p-1 transition"
                aria-label="Histórico"
              >
                <MessageSquare size={16} />
              </button>
              <button
                onClick={() => setRightMenuOpen(true)}
                className="text-white/80 hover:text-white p-1 transition"
                aria-label="Abrir menu"
              >
                <span className="text-lg leading-none px-0.5">☰</span>
              </button>
              <button onClick={() => { setChatOpen(false); stopSpeaking(); }} className="text-white/80 hover:text-white p-1">
                <X size={16} />
              </button>
            </div>
          </div>

          {historyOpen && (
            <div className="border-b border-zinc-800 bg-zinc-900/80 max-h-40 overflow-y-auto">
              <button
                onClick={newChat}
                className="w-full text-left px-3 py-2 text-cyan-300 text-xs font-semibold hover:bg-zinc-800 transition border-b border-zinc-800"
              >
                + Nova conversa
              </button>
              {sessions.length === 0 && (
                <p className="px-3 py-2 text-zinc-500 text-xs">Nenhuma conversa anterior.</p>
              )}
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-2 px-3 py-2 hover:bg-zinc-800/70 transition ${
                    activeId === s.id ? 'bg-zinc-800' : ''
                  }`}
                >
                  <button
                    onClick={() => { setActiveId(s.id); setHistoryOpen(false); }}
                    className="flex-1 text-left text-zinc-300 text-xs truncate"
                  >
                    {s.title}
                  </button>
                  <button onClick={() => deleteSession(s.id)} className="text-zinc-500 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[160px]">
            {(!activeSession || activeSession.messages.length === 0) && (
              <p className="text-zinc-500 text-xs text-center py-6">
                Olá! Sou a K-AI. Diga "KAI" para falar comigo por voz, ou escreva abaixo.
              </p>
            )}
            {activeSession?.messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-100'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <BoltInputBox onSend={(text) => handleCommand(text, true)} />
        </div>
      )}

      <KAIRightMenu
        open={rightMenuOpen}
        onClose={() => setRightMenuOpen(false)}
        onSelect={(target: KaiTarget) => {
          setRightMenuOpen(false);
          if (target === 'tasks') setTasksOpen(true);
          if (target === 'laboratorio') setLabOpen(true);
          if (target === 'programacoes') setProgramacoesOpen(true);
          if (target === 'settings') {
            pushWhisper('Abra o ícone da sua conta no topo para configurar o perfil.');
          }
          if (target === 'bolt') window.open('https://bolt.new', '_blank');
          if (target === 'github') window.open('https://github.com/sistemak/korvil-app', '_blank');
        }}
      />

      <KAITasksPanel
        open={tasksOpen}
        onClose={() => setTasksOpen(false)}
        email={user?.email}
        isAdmin={isAdm}
        highlightId={highlightTaskIdRef.current}
      />

      {programacoesOpen && (
        <KaiProgramacoes onClose={() => setProgramacoesOpen(false)} />
      )}

      {labOpen && <LaboratorioPage onExit={() => setLabOpen(false)} />}

      {/* balõezinhos laterais */}
      <div className="fixed z-[54] pointer-events-none flex flex-col gap-1.5 items-end" style={{ right: window.innerWidth - pos.x + 8, top: pos.y + 12 }}>
        {whispers.map((w) => (
          <div
            key={w.id}
            className="bg-zinc-900/95 border border-cyan-500/30 text-cyan-100 text-[11px] rounded-xl rounded-tr-sm px-2.5 py-1.5 shadow-lg max-w-[220px] animate-[whisperIn_0.3s_ease-out]"
          >
            {w.text}
          </div>
        ))}
      </div>

      <div
        ref={btnRef}
        onMouseDown={(e) => handlePressStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePressMove(e.clientX, e.clientY)}
        onMouseUp={handlePressEnd}
        onMouseLeave={() => dragging && handlePressEnd()}
        onTouchStart={(e) => handlePressStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handlePressMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handlePressEnd}
        onClick={() => {
          const now = Date.now();
          const last = lastTapRef.current;
          lastTapRef.current = now;
          if (now - last < 300) {
            handleDoubleTap();
            lastTapRef.current = 0;
            if (tapTimer.current) clearTimeout(tapTimer.current);
          } else {
            tapTimer.current = setTimeout(() => {
              handleTap();
            }, 310);
          }
        }}
        className="fixed z-[55] select-none"
        style={{ left: pos.x, top: pos.y, touchAction: 'none', display: modalOpen ? 'none' : undefined }}
      >
        <div
          className={`relative w-[92px] h-[92px] rounded-full flex items-center justify-center cursor-pointer overflow-hidden transition-transform ${
            dragging ? 'scale-110' : 'hover:scale-105'
          }`}
          style={{
            background: 'radial-gradient(circle, #22d3ee 0%, #06b6d4 55%, #0891b2 100%)',
            boxShadow: '0 0 24px rgba(6,182,212,0.6), 0 0 48px rgba(6,182,212,0.3)',
            animation: pulsing
              ? 'kaiDoublePulse 0.7s ease-in-out'
              : dragging
                ? 'none'
                : 'kaiPulse 2s ease-in-out infinite',
          }}
        >
          <img
            src="/logokai.png"
            alt="K-AI"
            className="w-[76px] h-[76px] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </>
  );
}
