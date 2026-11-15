/* Menu lateral do K-AI: Tarefas, Configurações e atalhos externos. */

import { Menu, X, Sparkles, Zap, Github, ListTodo, FlaskConical, CalendarClock, Settings } from 'lucide-react';

export type KaiTarget = 'tasks' | 'laboratorio' | 'programacoes' | 'settings' | 'bolt' | 'github';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (target: KaiTarget) => void;
}

export default function KAIRightMenu({ open, onClose, onSelect }: Props) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[64] transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-64 bg-[#0a0a0a] border-l border-zinc-800 z-[65] shadow-2xl transition-transform duration-300 ease-out ${
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
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold cursor-default"
          >
            <Sparkles size={16} className="text-cyan-400" /> K-AI
          </button>
          <button
            onClick={() => onSelect('tasks')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold"
          >
            <ListTodo size={16} /> Tarefas
          </button>
          <button
            onClick={() => onSelect('laboratorio')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold"
          >
            <FlaskConical size={16} /> Laboratório
          </button>
          <button
            onClick={() => onSelect('programacoes')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold"
          >
            <CalendarClock size={16} /> Programações
          </button>
          <button
            onClick={() => onSelect('settings')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold"
          >
            <Settings size={16} /> Configurações
          </button>
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
