import type { ReactNode } from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  profileSlot: ReactNode;
}

export default function Header({ onMenuClick, profileSlot }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-black border-b border-zinc-800/80 z-50 flex items-center justify-between px-3 sm:px-4">
      <button
        onClick={onMenuClick}
        className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors"
        aria-label="Menu"
      >
        <Menu size={22} />
      </button>

      <div className="flex items-center gap-2.5 absolute left-1/2 -translate-x-1/2">
        <img
          src="/icons/icon-192.png?v=20261019"
          alt="KORVIL"
          className="w-8 h-8 object-contain bg-black"
        />      </div>

      <div className="flex items-center">{profileSlot}</div>
    </header>
  );
}
