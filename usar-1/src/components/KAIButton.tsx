import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { X, Trash2, MessageSquare, ShieldCheck, Menu, Sparkles, ListTodo, FlaskConical, CalendarClock, Settings, ChevronDown, Brain } from 'lucide-react';
import KAIRightMenu, { type KaiTarget } from '@/components/KAIRightMenu';
import KAITasksPanel from '@/components/KAITasksPanel';
import KaiProgramacoes from '@/components/KaiProgramacoes';
import LaboratorioPage from '@/components/LaboratorioPage';
import KEditorPage from '@/components/KEditorPage';
import KaiEvolutionPanel from '@/components/KaiEvolutionPanel';
import { publishPendingTasks } from '@/lib/kaiTasks';
import { startAutomationScheduler, checkDue } from '@/lib/kaiAutomations';
import BoltInputBox from '@/components/BoltInputBox';
import { speak, stopSpeaking, WakeListener, playBip } from '@/lib/kaiVoice';
import { buildReply, contextualWhisper, greeting, pickAddress, readyReply, setKaiUserName, setKaiCreatorMode, speechText, setKaiScreen } from '@/lib/kaiPersonality';
import { isAdminEmail, isCreator, markAsCreator, runCreatorAction } from '@/lib/creatorMode';
import { runUnlimited, executeCall, ensureUnlimitedReady, type PendingCall } from '@/lib/kaiUnlimited';
import { pushFileToRepo, detectAppChange, applySimpleChange } from '@/lib/kaiExec';
import { askKaiBrain } from '@/lib/kaiBrain';
import { askHybridAI } from '@/lib/kaiHybrid';
import { askKorvilAI, getProvider, setProvider, generateCodebaseSummary, type AIProvider, PROVIDER_OPTIONS, PROVIDER_LABELS } from '@/lib/k-ai-client';
import { ensureNotificationPermission, notifyTaskDone } from '@/lib/kaiNotify';
import { enqueueTask } from '@/lib/kaiQueue';
import { addHistory, snapshotBefore } from '@/lib/kaiHistory';
import { saveOfflineOrder, startOfflineSync, countOfflineOrders } from '@/lib/kaiOffline';
import { runDailyBackup } from '@/lib/kaiBackup';
import { handleSlashCommand } from '@/lib/kaiCommands';
import { getPendingProposal } from '@/lib/kaiEvolution';
import { getSessionUser, getMyProfile, displayName } from '@/lib/korvilAuth';
import { checkPermission, PRIVATE_BLOCK_MESSAGE } from '@/lib/kaiSecurity';
import KaiMessage from '@/components/KaiMessage';

interface Props {
  onNavigateSection?: (id: string) => void;
  onOpenLoja?: () => void;
}

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

/* Escolhe 2 dicas aleatórias sem repetir as já usadas recentemente. */
function pickCaixaHints(pool: string[], usadas: string[]): string[] {
  let disp = pool.filter((b) => !usadas.includes(b));
  if (disp.length < 2) disp = pool;
  return [...disp].sort(() => Math.random() - 0.5).slice(0, 2);
}

export default function KAIButton({ onNavigateSection, onOpenLoja }: Props) {
  const [pos, setPos] = useState(homePos);
  const [chatOpen, setChatOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pulsing, setPulsing] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rightMenuOpen, setRightMenuOpen] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [programacoesOpen, setProgramacoesOpen] = useState(false);
  const [labOpen, setLabOpen] = useState(false);
  const [keditorOpen, setKeditorOpen] = useState(false);
  const [evolutionOpen, setEvolutionOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [pendingProposalCount, setPendingProposalCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>(loadHistory);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [pendingChange, setPendingChange] = useState<{ what: string } | null>(null);
  const [pendingCall, setPendingCall] = useState<PendingCall | null>(null);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const userNameRef = useRef<string | null>(null);
  const [offlineCount, setOfflineCount] = useState(countOfflineOrders());
  const [providerOpen, setProviderOpen] = useState(false);
  const [kaiMenuOpen, setKaiMenuOpen] = useState(false);
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(getProvider());

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

  // Abriu por notificação de proposta do K-AI: abre o painel de evolução.
  useEffect(() => {
    if (!user) return;
    const proposalId = new URLSearchParams(window.location.search).get('kai-proposal');
    if (proposalId) {
      const qs = new URLSearchParams(window.location.search);
      qs.delete('kai-proposal');
      const rest = qs.toString();
      window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));
      setEvolutionOpen(true);
    }
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
      const result = buildReply(text);
      if (result.isCommand) return; // comandos slash são tratados no handleCommand
      appendMessages(text, result.text);
      if (talk) speak(speechText(result.text));
      else pushWhisper(result.text);
    },
    [appendMessages, pushWhisper]
  );

  // Auto-scroll para a última mensagem sempre que chega uma nova.
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [activeSession?.messages.length, typing]);

  // Verifica propostas pendentes de evolução a cada 30s e mostra badge no botão.
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      try {
        const p = await getPendingProposal();
        setPendingProposalCount(p ? 1 : 0);
      } catch {
        setPendingProposalCount(0);
      }
    };
    void check();
    const id = setInterval(() => void check(), 30_000);
    return () => clearInterval(id);
  }, [user]);

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
      // Comandos slash — executam direto, sem gastar IA.
      if (text.trim().startsWith('/')) {
        const cmdResult = handleSlashCommand(text, {
          clearChat: () => {
            if (activeId !== null) {
              setSessions((prev) => prev.map((s) => s.id === activeId ? { ...s, messages: [], updatedAt: Date.now() } : s));
            } else {
              setActiveId(Date.now());
            }
          },
          openTasks: () => setTasksOpen(true),
          openEvolution: () => setEvolutionOpen(true),
          openProgramacoes: () => setProgramacoesOpen(true),
        });
        if (cmdResult?.handled) {
          appendMessages(text, cmdResult.reply);
          if (talk) speak(speechText(cmdResult.reply));
          if (cmdResult.action) void cmdResult.action();
          return;
        }
      }

      // Bloqueio de info privada — vale pra todo mundo (ADM inclusive).
      const perm = checkPermission(text, user?.email);
      if (!perm.allowed && perm.blockMessage) {
        appendMessages(text, perm.blockMessage);
        if (talk) speak(speechText(perm.blockMessage));
        else pushWhisper(perm.blockMessage);
        return;
      }
      // Atalhos numéricos 0-4: levam pras telas reais do App.
      const num = text.trim();
      if (/^[0-4]$/.test(num)) {
        const map: Record<string, { id: string; nome: string; loja?: boolean }> = {
          '0': { id: 'central', nome: 'CENTRAL KORVIL' },
          '1': { id: 'sistemak', nome: 'SISTEMA K' },
          '2': { id: 'ktp', nome: 'K-TP' },
          '3': { id: 'kafortunado', nome: 'K-AFORTUNADO' },
          '4': { id: 'kalma', nome: 'K-ALMA' },
        };
        const alvo = map[num];
        if (alvo) {
          if (alvo.loja && onOpenLoja) {
            onOpenLoja();
          } else if (onNavigateSection) {
            onNavigateSection(alvo.id);
          }
          const msg = `Indo pra ${alvo.nome}, ${pickAddress('auxilio')}.`;
          appendMessages(text, msg);
          if (talk) speak(speechText(msg));
          else pushWhisper(msg);
          return;
        }
      }
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
        setTyping(true);
        const history = [
          ...(activeSession?.messages.slice(-8) ?? []),
          { role: 'user' as const, text },
        ];

        const korvilHistory = history.map((m) => ({
          role: (m.role === 'kai' ? 'assistant' : m.role) as 'user' | 'assistant',
          content: m.text,
        }));

        askKorvilAI(text, { setor: 'central', history: korvilHistory, provider: getProvider(), email: user?.email, isADM: isAdm }).then((kr) => {
          if (kr.ok && kr.reply && kr.provider !== 'error') {
            setTyping(false);
            appendMessages(text, kr.reply);
            if (talk) speak(speechText(kr.reply));
            else pushWhisper(kr.reply);
            if (kr.auto_switched) {
              pushWhisper('Trocado automaticamente pra economizar');
            }
            return;
          }
          askKaiBrain(history, { email: user?.email, isAdmin: isAdm }).then((r) => {
          if (!r.ok || !r.reply) {
            // Reforço híbrido: Pollinations (OpenAI -> Mistral -> Text) -> fallback local.
            askHybridAI(text, korvilHistory).then((hr) => {
              if (hr.ok && hr.reply) {
                setTyping(false);
                appendMessages(text, hr.reply);
                if (talk) speak(speechText(hr.reply));
                else pushWhisper(hr.reply);
                return;
              }
              runFallback();
            });
            return;
          }
          setTyping(false);
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
    [pushWhisper, respond, isAdm, activeSession, user, appendMessages, onNavigateSection, onOpenLoja]
  );

  // Excluir uma mensagem do chat + histórico local.
  const deleteMessage = useCallback((index: number) => {
    if (activeId === null) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeId
          ? { ...s, messages: s.messages.filter((_, i) => i !== index), updatedAt: Date.now() }
          : s
      )
    );
  }, [activeId]);

  // Editar mensagem do usuário: remove a antiga e devolve pro input.
  const [editDraft, setEditDraft] = useState<string | null>(null);
  const editMessage = useCallback((text: string) => {
    setEditDraft(text);
  }, []);

  // Caixa de orientações topo: 15 dicas, mostra 3 aleatórias sem repetir, troca a cada 120s.
  // Caixa de orientações topo: lista enxuta, mostra 2 frases aleatórias a cada 2 min.
  const CAIXA_HINTS = [
    '💬 Dúvida? Pergunta que respondo',
    '🛒 Conhece K.L LOJA? Digite "loja"',
    '🚀 0 CENTRAL • 1 SISTEMA K • 2 K-TP • 3 K-AFORTUNADO • 4 K-ALMA',
    '🧬 Treino? Projeto TRANSFORMAÇÃO K-TP',
    '💊 Suplemento? Produtos da loja',
    '📌 Segure 1s numa mensagem: Copiar, Excluir, Encaminhar, Editar',
    '🔗 Links clicáveis nas respostas',
    '🗣️ Voz: diga "KAI" para falar comigo',
    '⚙️ Tarefas, Lab, Programações no menu ☰ do chat',
    '🧠 IA: Pollinations, Groq ou Gemini',
    '📈 Dicas de Saúde e Fitness no K-ALMA e K-TP',
    '🛍️ Frete, cupons e rastreio na KORVIL-LOJA',
  ];
  const [caixaShown, setCaixaShown] = useState<string[]>(() => pickCaixaHints(CAIXA_HINTS, []));
  const caixaUsadasRef = useRef<string[]>([]);
  const caixaTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const caixaTimerReset = useCallback(() => {
    if (caixaTimerRef.current) clearInterval(caixaTimerRef.current);
    caixaTimerRef.current = setInterval(() => {
      const picks = pickCaixaHints(CAIXA_HINTS, caixaUsadasRef.current);
      caixaUsadasRef.current = [...caixaUsadasRef.current, ...picks];
      if (caixaUsadasRef.current.length >= CAIXA_HINTS.length) caixaUsadasRef.current = [];
      setCaixaShown(picks);
    }, 120000);
  }, []);
  useEffect(() => {
    caixaTimerReset();
    return () => { if (caixaTimerRef.current) clearInterval(caixaTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
          className="fixed z-[90] w-[300px] sm:w-[340px] bg-zinc-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden flex flex-col"
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

          {/* Caixa de orientações K-AI (2 frases aleatórias, troca a cada 2 min) */}
          <div
            id="kai-orientacoes-box"
            className="bg-[#1a1a1a] border border-[#333] rounded-lg mx-2 my-2 px-2.5 py-1.5 text-[#ccc] text-[13px] leading-snug"
            style={{ minHeight: '60px', maxHeight: '80px', overflow: 'hidden' }}
            onTouchStart={() => { caixaTimerReset(); }}
            onTouchMove={() => { caixaTimerReset(); }}
            onTouchEnd={() => { caixaTimerReset(); }}
          >
            {caixaShown.map((h, i) => (
              <p key={i} style={{ margin: '3px 0' }}>{h}</p>
            ))}
          </div>

          {/* Seletor de IA escondido da barra do meio (display none) */}
          <div className="kai-ia-selector" style={{ display: 'none' }}>
            <div className="relative">
              <button
                onClick={() => setProviderOpen((o) => !o)}
                className="flex items-center gap-1 bg-zinc-800 rounded-full px-2 py-0.5 text-[10px] font-semibold text-cyan-300 hover:bg-zinc-700 transition"
              >
                K-AI: {PROVIDER_LABELS[currentProvider]}
                <ChevronDown size={10} />
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

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[160px]">
            {(!activeSession || activeSession.messages.length === 0) && !typing && (
              <div id="caixa-kai" style={{ display: 'none' }}>
                {CAIXA_HINTS.map((h, i) => (
                  <p key={i} style={{ margin: '4px 0' }}>{h}</p>
                ))}
              </div>
            )}
            {activeSession?.messages.map((m, i) => (
              <KaiMessage
                key={i}
                text={m.text}
                role={m.role}
                onDelete={() => deleteMessage(i)}
                onEdit={m.role === 'user' ? editMessage : undefined}
              />
            ))}
            {typing && (
              <div className="flex items-center gap-2 px-1 py-1.5">
                <div className="w-7 h-7 rounded-full bg-cyan-500/15 flex items-center justify-center shrink-0">
                  <Loader2 size={14} className="text-cyan-400 animate-spin" />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-sm px-3 py-2">
                  <span className="text-zinc-400 text-xs italic">K-AI está pensando...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <BoltInputBox onSend={(text) => handleCommand(text, true)} draft={editDraft} onDraftConsumed={() => setEditDraft(null)} />
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
          if (target === 'keditor') setKeditorOpen(true);
          if (target === 'evolucao') setEvolutionOpen(true);
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

      {keditorOpen && <KEditorPage onExit={() => setKeditorOpen(false)} />}

      {evolutionOpen && <KaiEvolutionPanel onClose={() => setEvolutionOpen(false)} />}

      {/* balõezinhos laterais */}
      <div className="fixed z-[89] pointer-events-none flex flex-col gap-1.5 items-end" style={{ right: window.innerWidth - pos.x + 8, top: pos.y + 12 }}>
        {whispers.map((w) => (
          <div
            key={w.id}
            className="bg-zinc-900/95 border border-cyan-500/30 text-cyan-100 text-[11px] rounded-xl rounded-tr-sm px-2.5 py-1.5 shadow-lg max-w-[220px] animate-[whisperIn_0.3s_ease-out]"
          >
            {w.text}
          </div>
        ))}
      </div>

      {/* Menu dropdown do K-AI: Tarefas, Laboratório, Programações, Configurações */}
      {kaiMenuOpen && (
        <div
          className="fixed z-[93] bg-zinc-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden animate-[whisperIn_0.2s_ease-out] py-2 w-52"
          style={{
            right: '16px',
            bottom: `${Math.max(180, window.innerHeight - pos.y - 20)}px`,
          }}
        >
          <div className="px-3 pb-2 border-b border-zinc-800 mb-2">
            <span className="text-cyan-300 font-bold text-xs flex items-center gap-1.5">
              <Sparkles size={12} /> Menu K-AI
            </span>
          </div>
          {[
            { label: 'Tarefas', icon: ListTodo, target: 'tasks' as const },
            { label: 'Laboratório', icon: FlaskConical, target: 'laboratorio' as const },
            { label: 'Programações', icon: CalendarClock, target: 'programacoes' as const },
            { label: 'Evolução K-AI', icon: Brain, target: 'evolucao' as const },
            { label: 'Configurações', icon: Settings, target: 'settings' as const },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.target}
                onClick={() => {
                  setKaiMenuOpen(false);
                  if (item.target === 'tasks') setTasksOpen(true);
                  if (item.target === 'laboratorio') setLabOpen(true);
                  if (item.target === 'programacoes') setProgramacoesOpen(true);
                  if (item.target === 'evolucao') setEvolutionOpen(true);
                  if (item.target === 'settings') {
                    pushWhisper('Abra o ícone da sua conta no topo para configurar o perfil.');
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-200 hover:bg-zinc-800/80 hover:text-cyan-300 transition text-sm font-medium"
              >
                <Icon size={16} className="text-cyan-400" /> {item.label}
              </button>
            );
          })}
        </div>
      )}

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
        className="fixed z-[88] select-none"
        style={{ left: pos.x, top: pos.y, touchAction: 'none', display: modalOpen ? 'none' : undefined }}
      >
        <div
          className={`k-ai-circle relative w-[160px] h-[160px] rounded-full flex items-center justify-center cursor-pointer overflow-hidden transition-transform ${
            dragging ? 'scale-110' : 'hover:scale-105'
          }`}
          style={{
            background: 'transparent',
            boxShadow: '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2), 0 0 60px rgba(6,182,212,0.1)',
            animation: pulsing
              ? 'kaiDoublePulse 0.7s ease-in-out'
              : dragging
                ? 'none'
                : 'kaiPulse 2s ease-in-out infinite',
          }}
        >
          <video
            src="/kai/kai-small.mp4"
            autoPlay
            loop
            playsInline
            controls={false}
            ref={(el) => {
              if (el) {
                el.muted = true;
                el.volume = 1.0;
              }
            }}
            onClick={(e) => {
              const v = e.currentTarget;
              v.muted = false;
              v.volume = 1.0;
              void v.play();
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', background: 'transparent', borderRadius: '50%', display: 'block', transform: 'scale(1.15)' }}
          />
          {pendingProposalCount > 0 && (
            <div
              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 border-2 border-black flex items-center justify-center animate-pulse z-10"
              onClick={(e) => {
                e.stopPropagation();
                setEvolutionOpen(true);
              }}
              title="K-AI tem uma proposta de evolução aguardando"
            >
              <Brain size={11} className="text-black" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
