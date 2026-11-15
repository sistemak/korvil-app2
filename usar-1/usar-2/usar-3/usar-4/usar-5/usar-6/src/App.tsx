import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import KAIButton from '@/components/KAIButton';
import { SectionView, CentralDashboard } from '@/components/SectionView';
import PWAUpdater from '@/components/PWAUpdater';
import KorvilLoja from '@/components/KorvilLoja';
import ProfileMenu from '@/components/ProfileMenu';
import LoginScreen from '@/components/LoginScreen';
import { getMyProfile, getSessionUser, signOut, type KorvilProfile } from '@/lib/korvilAuth';
import { markAsCreator } from '@/lib/creatorMode';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('central');
  const [loginOpen, setLoginOpen] = useState(false);
  const [lojaOpen, setLojaOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [profile, setProfile] = useState<KorvilProfile | null>(null);

  useEffect(() => {
    // Link exclusivo do criador: quem abrir o app por /criador fica marcado para sempre.
    if (window.location.pathname === '/criador') {
      markAsCreator();
      window.history.replaceState({}, '', '/');
    }
    refreshSession();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        onMenuClick={() => setSidebarOpen((o) => !o)}
        profileSlot={
          <ProfileMenu
            onOpenLogin={() => setLoginOpen(true)}
          />
        }
      />

      <Sidebar
        activeId={activeSection}
        onSelect={setActiveSection}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="pt-14 lg:pl-[90px] min-h-screen">
        {activeSection === 'central' ? (
          <CentralDashboard onNavigate={setActiveSection} onOpenLoja={() => setLojaOpen(true)} />
        ) : (
          <SectionView sectionId={activeSection} onBack={() => setActiveSection('central')} />
        )}
      </main>

      <KAIButton />
      <PWAUpdater />

      {lojaOpen && <KorvilLoja onClose={() => setLojaOpen(false)} />}

      {loginOpen && (
        <LoginScreen
          onClose={() => setLoginOpen(false)}
          onLoggedIn={async () => {
            await refreshSession();
            setLoginOpen(false);
            setActiveSection('central');
          }}
        />
      )}
    </div>
  );

  async function refreshSession() {
    const u = await getSessionUser();
    setUser(u);
    if (u) {
      setProfile(await getMyProfile());
    } else {
      setProfile(null);
    }
  }
}
