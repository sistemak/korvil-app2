/* Menu lateral do K-AI: Tarefas, Configurações e atalhos externos. */

import { useState } from 'react';
import { X, Sparkles, Zap, Github, ListTodo, FlaskConical, CalendarClock, Settings, ChevronDown, Clapperboard } from 'lucide-react';

export type KaiTarget = 'tasks' | 'laboratorio' | 'programacoes' | 'settings' | 'bolt' | 'github' | 'keditor';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (target: KaiTarget) => void;
}

export default function KAIRightMenu({ open, onClose, onSelect }: Props) {
  const [kaiExpanded, setKaiExpanded] = useState(false);
  const [programsExpanded, setProgramsExpanded] = useState(false);

  const submenu = [
    { label: 'Tarefas', icon: ListTodo, target: 'tasks' as const },
    { label: 'Laboratório', icon: FlaskConical, target: 'laboratorio' as const },
    { label: 'Programações', icon: CalendarClock, target: 'programacoes' as const },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[94] transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-64 bg-[#0a0a0a] border-l border-zinc-800 z-[95] shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800">
          <span className="text-cyan-300 font-bold text-sm flex items-center gap-2">
            <Sparkles size={14} /> Menu
          </span>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 space-y-2">
          <div>
            <button
              onClick={() => setKaiExpanded((e) => !e)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold"
            >
              <Sparkles size={16} className="text-cyan-400" /> K-AI
              <ChevronDown
                size={16}
                className={`ml-auto text-zinc-500 transition-transform duration-200 ${kaiExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            {kaiExpanded && (
              <div className="mt-1.5 ml-3 pl-3 border-l border-zinc-800 space-y-1.5 animate-[whisperIn_0.2s_ease-out]">
                {submenu.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.target}
                      onClick={() => onSelect(item.target)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/50 transition text-[13px] font-medium"
                    >
                      <Icon size={14} /> {item.label}
                    </button>
                  );
                })}
                {/* PROGRAMAS dentro do K-AI, acima de Configurações */}
                <div>
                  <button
                    onClick={() => setProgramsExpanded((e) => !e)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/50 transition text-[13px] font-medium"
                  >
                    <Clapperboard size={14} /> PROGRAMAS
                    <ChevronDown
                      size={14}
                      className={`ml-auto text-zinc-500 transition-transform duration-200 ${programsExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {programsExpanded && (
                    <div className="mt-1 ml-3 pl-3 border-l border-zinc-800/60 space-y-1">
                      <button
                        onClick={() => onSelect('keditor')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-cyan-300 hover:bg-zinc-800/50 transition text-[12px] font-medium"
                      >
                        <Clapperboard size={12} /> K-EDITOR
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onSelect('settings')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/50 transition text-[13px] font-medium"
                >
                  <Settings size={14} /> Configurações
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => onSelect('bolt')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold"
          >
            <Zap size={16} /> Bolt
          </button>
          <button
            onClick={() => onSelect('github')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold"
          >
            <Github size={16} /> GitHub
          </button>
        </nav>

        <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-zinc-600">
          Acesso exclusivo: <span className="text-cyan-400">sistemak</span>
        </div>
      </aside>
    </>
  );
}
