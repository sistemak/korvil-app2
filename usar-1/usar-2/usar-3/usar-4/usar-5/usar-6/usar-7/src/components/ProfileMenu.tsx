import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import {
  supabase,
  getMyProfile,
  getSessionUser,
  signOut,
  type KorvilProfile,
} from '@/lib/korvilAuth';
import ProfileScreen from '@/components/ProfileScreen';

interface ProfileMenuProps {
  onOpenLogin: () => void;
}

export default function ProfileMenu({ onOpenLogin }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [profile, setProfile] = useState<KorvilProfile | null>(null);
  const [showProfileScreen, setShowProfileScreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = async () => {
      const u = await getSessionUser();
      setUser(u);
      if (u) setProfile(await getMyProfile());
      else setProfile(null);
    };
    refresh();
    const { data } = supabase.auth.onAuthStateChange(() => {
      (async () => {
        await refresh();
      })();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 flex items-center justify-center rounded-full transition-colors overflow-hidden border border-cyan-500/40 bg-zinc-900"
        aria-label="Perfil"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Sua foto" className="w-full h-full object-cover" />
        ) : user ? (
          <span className="w-full h-full flex items-center justify-center bg-cyan-500 text-black font-bold">
            {(profile?.full_name ?? user.email ?? '?').charAt(0).toUpperCase()}
          </span>
        ) : (
          <UserIcon size={20} className="text-cyan-300" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 bg-zinc-950 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/10 overflow-hidden z-[60]">
          {user ? (
            <div className="px-4 py-3 border-b border-zinc-800">
              {profile?.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt="Foto do perfil"
                  className="w-12 h-12 rounded-full object-cover border border-cyan-500/40 mb-2"
                />
              )}
              <p className="text-sm font-medium text-cyan-300 truncate">
                {profile?.full_name ?? 'Usuário'}
              </p>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>
          ) : (
            <div className="px-4 py-3 border-b border-zinc-800">
              <p className="text-sm text-zinc-300">Você não está logado</p>
            </div>
          )}

          {!user && (
            <button
              onClick={() => {
                setOpen(false);
                onOpenLogin();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-cyan-300 hover:bg-cyan-500/10 transition-colors"
            >
              <LogIn size={16} />
              Login
            </button>
          )}

          {user && profile && (
            <button
              onClick={() => {
                setOpen(false);
                setShowProfileScreen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-cyan-300 hover:bg-cyan-500/10 transition-colors"
            >
              <UserIcon size={16} />
              Meu perfil
            </button>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          )}

          <button
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ChevronDown size={14} />
            Fechar
          </button>
        </div>
      )}

      {showProfileScreen && profile && (
        <ProfileScreen
          profile={profile}
          onClose={() => setShowProfileScreen(false)}
          onSaved={(p) => setProfile(p)}
        />
      )}
    </div>
  );
}
