import { useRef, useState, useLayoutEffect } from 'react';
import {
  Plus, X, Mic, ArrowUp, ChevronUp, ChevronDown, Lightbulb,
  Paperclip, Wand2, Library, HelpCircle, ArrowLeft,
} from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
}

const MODELS = ['GLM 5.3 Flash', 'Claude 4.5 Sonnet', 'GPT-5'];

const PROMPT_LIBRARY = [
  'Cria uma loja KORVIL completa com produtos e checkout',
  'Adiciona um botão de contato dentro do K-AI',
  'Cria página de cursos com lista e inscrição',
  'Adiciona seção de depoimentos na Central',
  'Cria formulário de contato para o Sistema K',
];

const CONNECTORS = ['GitHub', 'Supabase', 'Stripe', 'Figma'];

const SKILLS = [
  { name: 'KORVIL Loja', prompt: 'Cria/atualiza a KORVIL Loja com marketplace e produtos' },
  { name: 'Cursos', prompt: 'Cria/atualiza a plataforma de cursos da Central Korvil' },
  { name: 'Sistema K', prompt: 'Cria/atualiza a página de serviços do Sistema K' },
];

type MenuView = 'closed' | 'main' | 'connectors' | 'skills';

export default function BoltInputBox({ onSend }: Props) {
  const [value, setValue] = useState('');
  const [menuView, setMenuView] = useState<MenuView>('closed');
  const [modal, setModal] = useState<'none' | 'figma' | 'library' | 'help'>('none');
  const [figmaUrl, setFigmaUrl] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [modelIdx, setModelIdx] = useState(0);
  const [planMode, setPlanMode] = useState(false);
  const [listening, setListening] = useState(false);
  const listeningRef = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  // O chat tem recorte de borda (overflow hidden); o menu precisa abrir fora dele,
  // fixado na tela, senão aparece cortado.
  const [anchor, setAnchor] = useState<{ left: number; right: number; bottom: number } | null>(null);

  useLayoutEffect(() => {
    if (menuView === 'closed' && modal === 'none') {
      setAnchor(null);
      return;
    }
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setAnchor({
      left: rect.left + 10,
      right: window.innerWidth - rect.right + 10,
      bottom: window.innerHeight - rect.top + 8,
    });
  }, [menuView, modal]);

  const popupStyle = anchor
    ? { position: 'fixed' as const, left: anchor.left, right: anchor.right, bottom: anchor.bottom }
    : undefined;

  const send = () => {
    const text = value.trim();
    if (!text) return;
    const suffix = attachments.length > 0 ? ` [anexos: ${attachments.join(', ')}]` : '';
    onSend(planMode ? `[Plano] ${text}${suffix}` : `${text}${suffix}`);
    setValue('');
    setAttachments([]);
    setPlanMode(false);
    setMenuView('closed');
    setModal('none');
  };

  const enhance = () => {
    const v = value.trim();
    if (!v) return;
    setValue(
      v.charAt(0).toUpperCase() + v.slice(1).replace(/[.!?]*$/, '') +
        '. Detalhe o layout, os textos e o comportamento no celular.'
    );
    setMenuView('closed');
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleMic = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => never;
      webkitSpeechRecognition?: new () => never;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setValue((v) => `${v}${v ? ' ' : ''}[microfone não suportado neste navegador]`);
      return;
    }
    if (listening) {
      listeningRef.current = false;
      recRef.current?.stop();
      setListening(false);
      return;
    }
    listeningRef.current = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new (SR as any)();
    rec.lang = 'pt-BR';
    rec.continuous = true;
    rec.interimResults = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += ` ${e.results[i][0].transcript}`;
      }
      if (final.trim()) setValue((v) => `${v}${v ? ' ' : ''}${final.trim()}`);
    };
    rec.onend = () => {
      // Escuta contínua: reinicia enquanto o modo mic estiver ativo.
      if (listeningRef.current) {
        try { rec.start(); } catch { setListening(false); }
      } else {
        setListening(false);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
        listeningRef.current = false;
        setListening(false);
        setValue((v) => `${v}${v ? ' ' : ''}[permissão de microfone negada]`);
      }
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  const menuItem = (
    icon: React.ReactNode,
    label: string,
    action: () => void,
    trailing?: React.ReactNode
  ) => (
    <button
      key={label}
      onClick={action}
      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-zinc-200 hover:bg-zinc-800 transition text-xs text-left"
    >
      {icon}
      <span className="flex-1">{label}</span>
      {trailing}
    </button>
  );

  return (
    <div className="p-2.5 border-t border-zinc-800 bg-zinc-950 relative">
      {/* menu do + (fixado na tela para não ser cortado pelo chat) */}
      {menuView !== 'closed' && (
        <div style={popupStyle} className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-[70]">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800">
            {menuView !== 'main' && (
              <button onClick={() => setMenuView('main')} className="text-zinc-400 hover:text-white">
                <ArrowLeft size={13} />
              </button>
            )}
            <span className="text-zinc-300 text-[11px] font-semibold flex-1">
              {menuView === 'main' ? 'Adicionar' : menuView === 'connectors' ? 'Connectors' : 'Skills'}
            </span>
            <button onClick={() => setMenuView('closed')} className="text-zinc-500 hover:text-white">
              <X size={13} />
            </button>
          </div>
          <div className="p-1.5">
            {menuView === 'main' && (
              <>
                {menuItem(<Paperclip size={13} className="text-zinc-400" />, 'Attach file', () => fileRef.current?.click())}
                {menuItem(<span className="text-zinc-400 text-[11px] font-bold">F</span>, 'Import from Figma', () => { setModal('figma'); setMenuView('closed'); })}
                {menuItem(<Library size={13} className="text-zinc-400" />, 'Open Prompt Library', () => { setModal('library'); setMenuView('closed'); })}
                {menuItem(<Wand2 size={13} className="text-zinc-400" />, 'Enhance prompt', enhance)}
                {menuItem(<HelpCircle size={13} className="text-zinc-400" />, 'Search Help Center', () => { setModal('help'); setMenuView('closed'); })}
                {menuItem(<Plus size={13} className="text-zinc-400" />, 'Connectors', () => setMenuView('connectors'), <span className="text-zinc-500 text-[10px]">›</span>)}
                {menuItem(<Plus size={13} className="text-zinc-400" />, 'Skills', () => setMenuView('skills'), <span className="text-zinc-500 text-[10px]">›</span>)}
              </>
            )}
            {menuView === 'connectors' &&
              CONNECTORS.map((c) =>
                menuItem(<span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />, c, () => {
                  setValue((v) => `${v}${v ? ' ' : ''}[conector: ${c}]`);
                  setMenuView('closed');
                })
              )}
            {menuView === 'skills' &&
              SKILLS.map((s) =>
                menuItem(<Wand2 size={13} className="text-cyan-400" />, s.name, () => {
                  setValue(s.prompt);
                  setMenuView('closed');
                })
              )}
          </div>
        </div>
      )}

      {/* modais */}
      {modal === 'figma' && (
        <div style={popupStyle} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 z-[70]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-zinc-200 text-xs font-semibold">Import from Figma</span>
            <button onClick={() => setModal('none')} className="text-zinc-500 hover:text-white"><X size={13} /></button>
          </div>
          <input
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            placeholder="Cole o link do arquivo Figma"
            className="w-full bg-zinc-800 text-zinc-100 text-xs rounded-lg px-2.5 py-2 outline-none border border-zinc-700 focus:border-cyan-500"
          />
          <button
            onClick={() => {
              if (figmaUrl.trim()) setValue((v) => `${v}${v ? ' ' : ''}[figma: ${figmaUrl.trim()}]`);
              setFigmaUrl('');
              setModal('none');
            }}
            className="mt-2 w-full bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-lg py-2 transition"
          >
            Importar link
          </button>
        </div>
      )}

      {modal === 'library' && (
        <div style={popupStyle} className="bg-zinc-900 border border-zinc-700 rounded-xl z-[70] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
            <span className="text-zinc-200 text-xs font-semibold">Prompt Library</span>
            <button onClick={() => setModal('none')} className="text-zinc-500 hover:text-white"><X size={13} /></button>
          </div>
          <div className="p-1.5 max-h-40 overflow-y-auto">
            {PROMPT_LIBRARY.map((p) => (
              <button
                key={p}
                onClick={() => { setValue(p); setModal('none'); }}
                className="w-full text-left px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-800 text-xs transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {modal === 'help' && (
        <div style={popupStyle} className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 z-[70]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-zinc-200 text-xs font-semibold">Help Center</span>
            <button onClick={() => setModal('none')} className="text-zinc-500 hover:text-white"><X size={13} /></button>
          </div>
          <a
            href="https://help.bolt.new"
            target="_blank"
            rel="noreferrer"
            className="block text-cyan-300 text-xs hover:underline"
          >
            Abrir a Central de Ajuda do Bolt →
          </a>
        </div>
      )}

      {/* anexos */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {attachments.map((a, i) => (
            <span key={i} className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-[10px] rounded-full px-2 py-1">
              <Paperclip size={9} /> {a}
              <button
                onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                className="text-zinc-500 hover:text-white"
              >
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const names = Array.from(e.target.files ?? []).map((f) => f.name);
          if (names.length > 0) setAttachments((prev) => [...prev, ...names]);
          e.target.value = '';
        }}
      />

      {/* caixa estilo Bolt */}
      <div ref={boxRef} className="bg-[#1a1a1a] border border-zinc-700 rounded-2xl px-3 pt-2.5 pb-2 focus-within:border-zinc-500 transition">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="What do you want to build today? (or /command)"
          className="w-full bg-transparent text-zinc-100 text-sm outline-none placeholder:text-zinc-500"
        />
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuView(menuView === 'closed' ? 'main' : 'closed')}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                menuView !== 'closed' ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
              aria-label="Adicionar"
            >
              <Plus size={14} />
            </button>
            {value && (
              <button
                onClick={() => { setValue(''); setAttachments([]); }}
                className="text-zinc-500 hover:text-white transition"
                aria-label="Limpar"
              >
                <X size={14} />
              </button>
            )}
            <div className="flex items-center gap-0.5 bg-zinc-800 rounded-full px-1.5 py-0.5">
              <button
                onClick={() => setModelIdx((i) => (i + MODELS.length - 1) % MODELS.length)}
                className="text-zinc-400 hover:text-white"
                aria-label="Modelo anterior"
              >
                <ChevronUp size={11} />
              </button>
              <span className="text-zinc-300 text-[10px] font-medium px-1 whitespace-nowrap">{MODELS[modelIdx]}</span>
              <button
                onClick={() => setModelIdx((i) => (i + 1) % MODELS.length)}
                className="text-zinc-400 hover:text-white"
                aria-label="Próximo modelo"
              >
                <ChevronDown size={11} />
              </button>
            </div>
          </div>

          <button
            onClick={() => setPlanMode((p) => !p)}
            className={`flex items-center gap-1 text-[11px] font-semibold transition ${
              planMode ? 'text-cyan-300' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lightbulb size={12} /> Plan
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMic}
              className={`transition ${listening ? 'text-red-400 animate-pulse' : 'text-zinc-400 hover:text-white'}`}
              aria-label="Microfone"
            >
              <Mic size={15} />
            </button>
            <button
              onClick={send}
              disabled={!value.trim()}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition"
              aria-label="Enviar"
            >
              <ArrowUp size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
