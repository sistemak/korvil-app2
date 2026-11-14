import { useState, useEffect } from 'react';
import { SECTIONS, KORVIL_LOGO, VERSION } from '@/lib/korvilData';

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Sidebar({ activeId, onSelect, open, onClose }: SidebarProps) {
  const [currentDate, setCurrentDate] = useState('');
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hint, setHint] = useState('');

  useEffect(() => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    setCurrentDate(`${d}/${m}`);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    const installedHandler = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) {
      setHint('Abra este app pelo Chrome no celular para instalar');
      setTimeout(() => setHint(''), 3000);
      return;
    }
    setHint('');
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') setInstallEvent(null);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-14 bottom-0 w-[90px] bg-[#0a0a0a] border-r border-zinc-800/80 z-40 flex flex-col items-center py-3 gap-1 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <button
          onClick={() => { onSelect('central'); onClose(); }}
          className={`flex flex-col items-center gap-1 w-[78px] py-2 rounded-xl transition-all ${
            activeId === 'central' ? 'bg-white/10 ring-1 ring-violet-500/50' : 'hover:bg-white/5'
          }`}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-black ring-1 ring-zinc-700">
            <img
              src={KORVIL_LOGO}
              alt="KORVIL"
              className="w-full h-full object-contain p-1"
              onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')}
            />
          </div>
          <span className="text-[9px] text-zinc-300 font-semibold text-center leading-tight">CENTRAL</span>
        </button>

        <div className="w-8 h-px bg-zinc-800 my-1" />

        {SECTIONS.map((s) => {
          const active = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { onSelect(s.id); onClose(); }}
              className={`flex flex-col items-center gap-1 w-[78px] py-2 rounded-xl transition-all ${
                active ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
              style={active ? { boxShadow: `0 0 12px ${s.color}66` } : undefined}
            >
              <div
                className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-black ${
                  active ? 'ring-2' : 'ring-1 ring-zinc-700'
                }`}
                style={active ? { boxShadow: `0 0 16px ${s.color}`, borderColor: s.color } : undefined}
              >
                <img
                  src={s.logo}
                  alt={s.name}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) parent.style.backgroundColor = s.color;
                  }}
                />
              </div>
              <span
                className="text-[9px] font-semibold text-center leading-tight"
                style={{ color: active ? s.color : '#a1a1aa' }}
              >
                {s.name}
              </span>
            </button>
          );
        })}

        <div id="version-box" style={{ marginTop: 'auto', marginBottom: 12, textAlign: 'center', width: '100%' }}>
          <div id="ver" style={{ fontSize: 10, color: '#aaa', fontWeight: 'bold' }}>{VERSION}</div>
          <div id="data" style={{ fontSize: 10, color: '#666' }}>{currentDate}</div>
          {!installed && (
            <button
              id="btnInstall"
              onClick={handleInstall}
              style={{
                marginTop: 8,
                width: 80,
                background: '#00e5ff',
                color: '#000',
                border: 0,
                borderRadius: 12,
                padding: '6px 0',
                fontSize: 10,
                fontWeight: 'bold',
                display: 'block',
                cursor: 'pointer',
              }}
            >
              INSTALAR APP
            </button>
          )}
          {installed && (
            <div style={{ marginTop: 8, fontSize: 9, color: '#00e5ff', fontWeight: 'bold' }}>APP INSTALADO</div>
          )}
          {hint && (
            <div style={{ marginTop: 6, fontSize: 8, color: '#f59e0b', textAlign: 'center', lineHeight: 1.4 }}>{hint}</div>
          )}
        </div>
      </aside>
    </>
  );
}
