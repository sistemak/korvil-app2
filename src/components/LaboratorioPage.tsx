/* Laboratório KORVIL: página inteira fullscreen com fundo tecnológico.
   Menu hamburger no canto esquerdo superior abre o drawer com os experimentos.
   X branco redondo no canto direito superior volta para o K-AI. */

import { useState } from 'react';
import { Beaker, FlaskConical, Hand, Menu, Microscope, X } from 'lucide-react';
import CGMPage from '@/components/CGMPage';

type Exp = 'cgm' | null;

export default function LaboratorioPage({ onExit }: { onExit: () => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exp, setExp] = useState<Exp>(null);

  return (
    <div className="fixed inset-0 z-[9999] bg-black overflow-hidden">
      {/* Fundo tecnológico */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(0,217,255,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(0,100,255,0.10) 0%, transparent 45%), repeating-linear-gradient(0deg, rgba(0,217,255,0.04) 0 1px, transparent 1px 48px), repeating-linear-gradient(90deg, rgba(0,217,255,0.04) 0 1px, transparent 1px 48px)',
        }}
      />

      {/* Barra superior */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-11 h-11 rounded-full bg-white/10 border border-cyan-400/40 backdrop-blur text-white flex items-center justify-center hover:bg-cyan-500/20 transition"
          aria-label="Abrir menu do laboratório"
        >
          <Menu size={20} />
        </button>
        <span className="text-cyan-300 font-bold tracking-[0.3em] text-sm select-none">
          LABORATÓRIO
        </span>
        <button
          onClick={onExit}
          className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center hover:bg-cyan-200 transition shadow-lg"
          aria-label="Sair do laboratório"
        >
          <X size={20} />
        </button>
      </div>

      {/* Conteúdo central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <Beaker size={56} className="text-cyan-400" />
        <div>
          <h1 className="text-white font-black text-2xl tracking-tight">Laboratório KORVIL</h1>
          <p className="text-zinc-400 text-sm mt-1.5 max-w-xs">
            Experimentos de tecnologia de ponta. Abra o menu para escolher.
          </p>
        </div>
        <button
          onClick={() => setExp('cgm')}
          className="flex items-center gap-2.5 bg-cyan-500/15 border border-cyan-400/50 text-cyan-200 font-bold text-sm rounded-xl px-6 py-3 hover:bg-cyan-500/25 transition"
        >
          <Hand size={16} /> Abrir CGM
        </button>
      </div>

      {/* Drawer lateral esquerdo */}
      {drawerOpen && (
        <div className="absolute inset-0 z-30" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside
            className="absolute top-0 left-0 bottom-0 w-64 bg-[#050b10]/95 border-r border-cyan-500/30 backdrop-blur flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-cyan-500/20">
              <span className="text-cyan-300 font-bold text-sm flex items-center gap-2">
                <FlaskConical size={14} /> EXPERIMENTOS
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-zinc-400 hover:text-white transition"
                aria-label="Fechar menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="p-3 space-y-2">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  setExp('cgm');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/70 border border-cyan-500/30 text-zinc-100 hover:bg-cyan-500/10 transition text-sm font-semibold"
              >
                <Hand size={16} className="text-cyan-400" />
                CGM (Comando de gestos de mão)
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-600 text-sm font-semibold cursor-not-allowed"
              >
                <Microscope size={16} /> Em breve...
              </button>
            </nav>
            <div className="mt-auto p-4 text-center text-[10px] text-zinc-600">
              Laboratório experimental KORVIL
            </div>
          </aside>
        </div>
      )}

      {/* CGM fullscreen dentro do laboratório */}
      {exp === 'cgm' && <CGMPage onExit={() => setExp(null)} />}
    </div>
  );
}
