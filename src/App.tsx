import { useState, useEffect } from 'react';
import { initApp } from '@/lib/central';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import KAIButton from '@/components/KAIButton';
import { SectionView, CentralDashboard } from '@/components/SectionView';
import PWAUpdater from '@/components/PWAUpdater';
import KorvilLoja from '@/components/KorvilLoja';
import KorvilOmfome from '@/components/KorvilOmfome';
import KorvilCursos from '@/components/KorvilCursos';
import ProfileMenu from '@/components/ProfileMenu';
import LoginScreen from '@/components/LoginScreen';
import SOKMain from '@/components/SOKMain';
import { getMyProfile, getSessionUser, signOut, type KorvilProfile } from '@/lib/korvilAuth';
import { markAsCreator } from '@/lib/creatorMode';
import { supabase } from '@/lib/korvilAuth';
import { Zap } from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(() => new URLSearchParams(window.location.search).get('secao') ?? 'central');
  const [loginOpen, setLoginOpen] = useState(false);
  const [lojaOpen, setLojaOpen] = useState(false);
  const [omfomeOpen, setOmfomeOpen] = useState(false);
  const [cursosOpen, setCursosOpen] = useState(false);
  const [sokOpen, setSokOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [profile, setProfile] = useState<KorvilProfile | null>(null);
  const [testeStatus, setTesteStatus] = useState<'idle' | 'enviando' | 'ok' | 'erro'>('idle');
  const [testeMsg, setTesteMsg] = useState('');

  const testarWhatsApp = async () => {
    setTesteStatus('enviando');
    setTesteMsg('');
    try {
      const { data, error } = await supabase.functions.invoke('send-transformacao-whatsapp', {
        body: { teste: true },
      });
      if (error) {
        setTesteStatus('erro');
        setTesteMsg(error.message);
        return;
      }
      if (data?.enviado) {
        setTesteStatus('ok');
        setTesteMsg('Mensagem de teste enviada para 55 13 99769-0898');
      } else {
        setTesteStatus('erro');
        setTesteMsg(data?.error || 'Token não configurado. Salvo em outbox.');
      }
    } catch (e) {
      setTesteStatus('erro');
      setTesteMsg(e instanceof Error ? e.message : 'Erro inesperado');
    }
  };

  useEffect(() => {
    // Link exclusivo do criador: quem abrir o app por /criador fica marcado para sempre.
    if (window.location.pathname === '/criador') {
      markAsCreator();
      window.history.replaceState({}, '', '/');
    }
    refreshSession();
    void initApp();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header
        onMenuClick={() => setSidebarOpen((o) => !o)}
        profileSlot={
          <ProfileMenu
            onOpenLogin={() => setLoginOpen(true)}
            onOpenSOK={() => setSokOpen(true)}
          />
        }
      />

      <Sidebar
        activeId={activeSection}
        onSelect={setActiveSection}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="pt-16 lg:pl-[100px] min-h-screen">
        {activeSection === 'central' ? (
          <CentralDashboard onNavigate={setActiveSection} onOpenLoja={() => setLojaOpen(true)} onOpenOmfome={() => setOmfomeOpen(true)} onOpenCursos={() => setCursosOpen(true)} />
        ) : (
          <SectionView sectionId={activeSection} onBack={() => setActiveSection('central')} />
        )}

        {/* BOTÃO DE TESTE WHATSAPP */}
        <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
          <button
            onClick={testarWhatsApp}
            disabled={testeStatus === 'enviando'}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-sm px-4 py-2.5 rounded-full shadow-lg transition"
          >
            <Zap size={16} />
            {testeStatus === 'enviando' ? 'Enviando...' : 'Testar WhatsApp'}
          </button>
          {testeStatus === 'ok' && (
            <span className="text-emerald-300 text-xs bg-black/70 px-3 py-1.5 rounded-lg border border-emerald-500/30 max-w-[260px]">
              {testeMsg}
            </span>
          )}
          {testeStatus === 'erro' && (
            <span className="text-red-300 text-xs bg-black/70 px-3 py-1.5 rounded-lg border border-red-500/30 max-w-[260px]">
              {testeMsg}
            </span>
          )}
        </div>
      </main>

      <KAIButton
        onNavigateSection={(id) => setActiveSection(id)}
        onOpenLoja={() => setLojaOpen(true)}
      />
      <PWAUpdater />

      {lojaOpen && <KorvilLoja onClose={() => setLojaOpen(false)} />}

      {omfomeOpen && <KorvilOmfome onClose={() => setOmfomeOpen(false)} />}

      {cursosOpen && <KorvilCursos onClose={() => setCursosOpen(false)} />}

      {sokOpen && <SOKMain onClose={() => setSokOpen(false)} />}

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
