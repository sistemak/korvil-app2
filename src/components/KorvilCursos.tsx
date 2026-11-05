/* KORVIL Cursos — marketplace de cursos + checkout PIX + painel do curso.
   Mesmo CSS dark glass do KorvilLoja. Mobile-first. */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X, Search, Star, Clock, ChevronRight, ChevronDown, BookOpen,
  Check, Copy, ShieldCheck, Building2, UserCircle, GraduationCap,
  Award, Briefcase, Target, Rocket, Heart, Wrench, Calendar,
  Menu, ArrowLeft, PlayCircle, Lock, TrendingUp,
} from 'lucide-react';
import { supabase, getSessionUser, signIn, signUpAccount, signOut } from '@/lib/korvilAuth';
import { generatePixCode, copyToClipboard, PIX_KEY } from '@/lib/pixCode';
import { getBankUsage, incrementBankUsage, getSortedBanks } from '@/lib/lojaMarketplace';

interface Curso {
  id: string;
  titulo: string;
  area: string;
  descricao: string;
  preco: number;
  duracao: string;
  nivel: string;
  emoji: string;
  destaque: boolean;
}

interface Area {
  id: string;
  label: string;
  icon: string;
}

const AREAS: Area[] = [
  { id: 'all', label: 'Todos', icon: 'BookOpen' },
  { id: 'treinamento-personalizado', label: 'Treinamento Personalizado', icon: 'Target' },
  { id: 'servicos-profissionais', label: 'Servicos Profissionais', icon: 'Briefcase' },
  { id: 'form-pro-manut', label: 'Form Pro Manut', icon: 'Wrench' },
  { id: 'saude', label: 'Saude', icon: 'Heart' },
  { id: 'empreendedorismo', label: 'Empreendedorismo', icon: 'Rocket' },
  { id: 'beleza', label: 'Beleza', icon: 'Award' },
];

const CURSOS: Curso[] = [
  // Treinamento Personalizado
  { id: 'tp-001', titulo: 'Mentoria de Carreira Individual', area: 'treinamento-personalizado', descricao: 'Mentoria one-to-one com acompanhamento personalizado. Definimos seus objetivos, mapeamos competencias e criamos um plano de desenvolvimento sob medida. Inclui 12 sessoes mensais, materiais exclusivos e acesso direto ao mentor.', preco: 297.00, duracao: '12 meses', nivel: 'Todos os niveis', emoji: '🎯', destaque: true },
  { id: 'tp-002', titulo: 'Coaching de Lideranca Executiva', area: 'treinamento-personalizado', descricao: 'Desenvolva competencias de lideranca para gerir equipes de alta performance. Aprenda a delegar, dar feedback, motivar e conduzir reuniões produtivas. Paragerentes, coordenadores e futuros lideres.', preco: 397.00, duracao: '6 meses', nivel: 'Intermediario', emoji: '🎯', destaque: false },
  { id: 'tp-003', titulo: 'Planejamento de Vida e Metas', area: 'treinamento-personalizado', descricao: 'Aprenda a definir metas SMART, criar habitos sustentaveis e manter foco. Metodo baseado em OKRs pessoais e GTD. Transforme intencoes em resultados concretos.', preco: 197.00, duracao: '3 meses', nivel: 'Iniciante', emoji: '🎯', destaque: false },

  // Servicos Profissionais
  { id: 'sp-001', titulo: 'Eletricista Predial Completo', area: 'servicos-profissionais', descricao: 'Formacao completa em instalacoes eletricas prediais. Aprenda projetos, executacao, manutença e normas NR-10. Teoria + pratica com simuladores. Saida profissional garantida.', preco: 497.00, duracao: '8 meses', nivel: 'Iniciante', emoji: '🔧', destaque: true },
  { id: 'sp-002', titulo: 'Pintura Predial e Decorativa', area: 'servicos-profissionais', descricao: 'Curso completo de pintura: preparo de superficie, tecnicas de rolo, pistola e pincel, efeitos decorativos, texturas e orcamento. Inclui apostila e certificado.', preco: 297.00, duracao: '4 meses', nivel: 'Iniciante', emoji: '🔧', destaque: false },
  { id: 'sp-003', titulo: 'Encanador e Hidraulica Predial', area: 'servicos-profissionais', descricao: 'Hidraulica predial do basico ao avancado: projetos, instalacao, reparos, deteccao de vazamentos e manutencao preventiva. Normas tecnicas e boas praticas.', preco: 397.00, duracao: '6 meses', nivel: 'Iniciante', emoji: '🔧', destaque: false },

  // Form Pro Manut
  { id: 'fp-001', titulo: 'Manutencao Industrial Mecanica', area: 'form-pro-manut', descricao: 'Formacao profissional em manutencao mecanica industrial. Lubrificacao, alinhamento, troca de rolamentos, planos de manutencao preventiva e preditiva. NR-12 inclusa.', preco: 597.00, duracao: '10 meses', nivel: 'Intermediario', emoji: '⚙️', destaque: true },
  { id: 'fp-002', titulo: 'Refrigeracao e Ar Condicionado', area: 'form-pro-manut', descricao: 'Instalacao, manutencao e reparo de sistemas de refrigeracao. Split, janela, central e comercial. Soldagem, vacuo, carga de gas e diagnostico de defeitos.', preco: 497.00, duracao: '8 meses', nivel: 'Iniciante', emoji: '⚙️', destaque: false },
  { id: 'fp-003', titulo: 'Automacao Predial e IoT', area: 'form-pro-manut', descricao: 'Integracao de sistemas prediais com IoT. Sensores, atuadores, CLP, supervisao e controle remoto. Plataformas de automacao residencial e comercial.', preco: 697.00, duracao: '12 meses', nivel: 'Avancado', emoji: '⚙️', destaque: false },

  // Saude
  { id: 'sa-001', titulo: 'Terapia Holistica Integrativa', area: 'saude', descricao: 'Formacao em terapias holisticas: Reiki, cristais, florais de Bach, aromaterapia e cromoterapia. Abordagem integrativa para bem-estar fisico, mental e espiritual.', preco: 397.00, duracao: '8 meses', nivel: 'Iniciante', emoji: '🌿', destaque: true },
  { id: 'sa-002', titulo: 'KTH - Korvil Terapia Holistica', area: 'saude', descricao: 'Certificacao exclusiva KTH. Programa avancado com 4 fases: fundamentos, tecnicas corporais, terapia energetica e casos praticos. Supervisao clinica inclusa.', preco: 897.00, duracao: '12 meses', nivel: 'Avancado', emoji: '🌿', destaque: true },
  { id: 'sa-003', titulo: 'Massagem Terapeutica', area: 'saude', descricao: 'Tecnicas de massagem terapeutica: sueca, desportiva, linhada e trigger points. Anatomia palpatoria, etica profissional e montagem de consultorio.', preco: 447.00, duracao: '6 meses', nivel: 'Iniciante', emoji: '🌿', destaque: false },

  // Empreendedorismo
  { id: 'em-001', titulo: 'Do Negocio Proprio a Escala', area: 'empreendedorismo', descricao: 'Do primeiro produto a escalabilidade. Modelo de negocio, validacao, MVP, canal de vendas, equipe e crescimento. Inclui mentoria de grupo mensal.', preco: 497.00, duracao: '10 meses', nivel: 'Intermediario', emoji: '🚀', destaque: true },
  { id: 'em-002', titulo: 'Marketing Digital para Negocios', area: 'empreendedorismo', descricao: 'Instagram, WhatsApp Business, Google Ads e Email Marketing do zero. Criacao de conteudo, copywriting, funil de vendas e metricas que importam.', preco: 297.00, duracao: '6 meses', nivel: 'Iniciante', emoji: '🚀', destaque: false },
  { id: 'em-003', titulo: 'Gestao Financeira para MEIs', area: 'empreendedorismo', descricao: 'Controle financeiro, precificacao, impostos, fluxo de caixa e DRE simplificado para microempreendedores. Planilhas e ferramentas inclusas.', preco: 197.00, duracao: '4 meses', nivel: 'Iniciante', emoji: '🚀', destaque: false },

  // Beleza
  { id: 'be-001', titulo: 'Cabeleireiro Unissex Profissional', area: 'beleza', descricao: 'Corte masculino e feminino, coloracao, mechas, progressiva, hidratacao e finalizacoes. Gestao de salao e atendimento. Saida profissional com diploma.', preco: 597.00, duracao: '10 meses', nivel: 'Iniciante', emoji: '💇', destaque: true },
  { id: 'be-002', titulo: 'Maquiagem Profissional e Social', area: 'beleza', descricao: 'Maquiagem social, noivas, festas e editorial. Tecnicas de contorno, iluminacao, pincéis e produtos. Portfolio e certificacao inclusos.', preco: 347.00, duracao: '6 meses', nivel: 'Iniciante', emoji: '💇', destaque: false },
  { id: 'be-003', titulo: 'Manicure e Pedicure Completo', area: 'beleza', descricao: 'Curso completo: basico, decoracao em gel, Esmaltacao permanente, spa dos pes e unhas de fibra. Montagem de agenda e precos.', preco: 247.00, duracao: '4 meses', nivel: 'Iniciante', emoji: '💇', destaque: false },
];

const BANKS = [
  { name: 'Nubank', deeplink: 'nubank://', fallback: 'https://app.nubank.com.br' },
  { name: 'Itaú', deeplink: 'itau://', fallback: 'https://www.itau.com.br' },
  { name: 'Bradesco', deeplink: 'bradesco://', fallback: 'https://www.bradesco.com.br' },
  { name: 'Santander', deeplink: 'santander://', fallback: 'https://www.santander.com.br' },
  { name: 'Banco do Brasil', deeplink: 'bbp://', fallback: 'https://www.bb.com.br' },
  { name: 'Caixa', deeplink: 'caixa://', fallback: 'https://www.caixa.gov.br' },
  { name: 'Inter', deeplink: 'inter://', fallback: 'https://www.bancointer.com.br' },
  { name: 'C6 Bank', deeplink: 'c6bank://', fallback: 'https://www.c6bank.com.br' },
  { name: 'Neon', deeplink: 'neon://', fallback: 'https://www.bneon.com.br' },
  { name: 'PagBank', deeplink: 'pagbank://', fallback: 'https://pagbank.com.br' },
  { name: 'Mercado Pago', deeplink: 'mercadopago://', fallback: 'https://www.mercadopago.com.br' },
  { name: 'PicPay', deeplink: 'picpay://', fallback: 'https://www.picpay.com' },
];

const TIMELINE = [
  {
    fase: 'Fase 1', periodo: 'Jan - Fev', modulos: ['Modulo 1: Introducao e Fundamentos', 'Modulo 2: Conceitos Basicos e Primeiros Passos'],
  },
  {
    fase: 'Fase 2', periodo: 'Mar - Mai', modulos: ['Modulo 3: Aprofundamento Teorico', 'Modulo 4: Practica Intermediaria', 'Modulo 5: Estudo de Casos'],
  },
  {
    fase: 'Fase 3', periodo: 'Jun - Ago', modulos: ['Modulo 6: Tecnicas Avancadas', 'Modulo 7: Aplicacao Practica', 'Modulo 8: Projetos Reais'],
  },
  {
    fase: 'Fase 4', periodo: 'Set - Nov', modulos: ['Modulo 9: Especializacao', 'Modulo 10: Casos Complexos', 'Modulo 11: Preparacao para Certificacao'],
  },
  {
    fase: 'Conclusao', periodo: 'Dez', modulos: ['Certificados', 'Mercado de Trabalho e Carreira'],
  },
];

function fmtPrice(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

let audioCtx: AudioContext | null = null;
function sfxClick() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch { /* */ }
}

type View = 'marketplace' | 'detail' | 'panel';

export default function KorvilCursos({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<View>('marketplace');
  const [search, setSearch] = useState('');
  const [activeArea, setActiveArea] = useState('all');
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<{ email?: string; id?: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authProfile, setAuthProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
  const [matriculas, setMatriculas] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const u = await getSessionUser();
      setAuthUser(u);
      if (u) {
        const { data: prof } = await supabase.from('korvil_users').select('full_name, avatar_url').eq('id', u.id).maybeSingle();
        if (prof) setAuthProfile(prof);
        const { data: mats } = await supabase.from('korvil_cursos_matriculas').select('curso_id').eq('user_id', u.id);
        if (mats) setMatriculas(mats.map((m: { curso_id: string }) => m.curso_id));
      }
    })();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const filteredCursos = useMemo(() => {
    let list = CURSOS;
    if (activeArea !== 'all') list = list.filter((c) => c.area === activeArea);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.titulo.toLowerCase().includes(q) || c.descricao.toLowerCase().includes(q));
    }
    return list;
  }, [activeArea, search]);

  const openDetail = (c: Curso) => {
    sfxClick();
    setSelectedCurso(c);
    setView('detail');
  };

  const handleMatriculaConfirm = async (pixCode: string, bankUsed: string | undefined) => {
    if (!selectedCurso || !authUser) return;
    await supabase.from('korvil_cursos_matriculas').insert({
      user_id: authUser.id,
      curso_id: selectedCurso.id,
      curso_titulo: selectedCurso.titulo,
      area: selectedCurso.area,
      preco: selectedCurso.preco,
      pix_code: pixCode,
      bank_used: bankUsed,
      status: 'matriculado',
    });
    setMatriculas((prev) => [...prev, selectedCurso.id]);
    if (bankUsed) incrementBankUsage(bankUsed);
    setCheckoutOpen(false);
    sfxClick();
    showToast(`Matricula confirmada: ${selectedCurso.titulo}`);
    setView('panel');
  };

  // --- Checkout overlay (shared across views) ---
  const checkoutOverlay = checkoutOpen && selectedCurso && (
    <CursosCheckout
      curso={selectedCurso}
      onClose={() => setCheckoutOpen(false)}
      onConfirm={handleMatriculaConfirm}
    />
  );

  // --- Auth overlay ---
  const authOverlay = authModalOpen && (
    <AuthModal
      user={authUser}
      profile={authProfile}
      mode={authMode}
      setMode={setAuthMode}
      email={authEmail}
      setEmail={setAuthEmail}
      pass={authPass}
      setPass={setAuthPass}
      error={authError}
      loading={authLoading}
      onClose={() => setAuthModalOpen(false)}
      onSignIn={async () => {
        setAuthLoading(true); setAuthError(null);
        try {
          if (authMode === 'login') {
            const r = await signIn(authEmail, authPass);
            if (r.error) throw new Error(r.error.message);
          } else {
            const r = await signUpAccount(authEmail, authPass);
            if (r.error) throw new Error(r.error.message);
          }
          const u = await getSessionUser();
          setAuthUser(u);
          if (u) {
            const { data } = await supabase.from('korvil_users').select('full_name, avatar_url').eq('id', u.id).maybeSingle();
            if (data) setAuthProfile(data);
            const { data: mats } = await supabase.from('korvil_cursos_matriculas').select('curso_id').eq('user_id', u.id);
            if (mats) setMatriculas(mats.map((m: { curso_id: string }) => m.curso_id));
          }
          setAuthModalOpen(false); sfxClick();
        } catch (e) { setAuthError(e instanceof Error ? e.message : 'Erro'); }
        finally { setAuthLoading(false); }
      }}
      onSignOut={async () => { await signOut(); setAuthUser(null); setAuthProfile(null); setMatriculas([]); setAuthModalOpen(false); sfxClick(); }}
    />
  );

  const toastOverlay = toast && (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[10003] bg-violet-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xl">{toast}</div>
  );

  // === MARKETPLACE VIEW ===
  if (view === 'marketplace') {
    return (
      <div className="fixed inset-0 z-[9998] bg-black flex flex-col">
        <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } } .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent); background-size: 200% 100%; animation: shimmer 1.5s infinite; }`}</style>
        <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 0%, #a855f7 0%, transparent 40%), radial-gradient(circle at 75% 100%, #06b6d4 0%, transparent 40%)' }} />

        {/* Header */}
        <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onClose} className="p-2 hover:text-violet-400 transition"><X size={20} className="text-white" /></button>
            <div className="flex-1">
              <h1 className="text-white font-black text-lg flex items-center gap-2"><GraduationCap size={20} className="text-violet-400" /> Cursos</h1>
              <p className="text-zinc-500 text-[10px]">Plataforma de cursos completos Korvil</p>
            </div>
            <button onClick={() => setAuthModalOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-violet-500/40 transition">
              {authUser ? (authProfile?.avatar_url ? <img src={authProfile.avatar_url} alt="Perfil" className="w-5 h-5 rounded-full object-cover" /> : <UserCircle size={18} className="text-violet-400" />) : <UserCircle size={18} className="text-zinc-400" />}
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cursos..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none" />
          </div>
        </div>

        {/* Area filter scroll */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {AREAS.map((a) => (
            <button key={a.id} onClick={() => { sfxClick(); setActiveArea(a.id); }} className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${activeArea === a.id ? 'bg-violet-500/15 text-violet-300 border-violet-500/40' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>
              {a.label}
            </button>
          ))}
        </div>

        {/* Course cards */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCursos.map((c) => {
              const matriculado = matriculas.includes(c.id);
              return (
                <button key={c.id} onClick={() => openDetail(c)} className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition flex flex-col text-left">
                  <div className="relative h-28 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 flex items-center justify-center">
                    <span className="text-4xl">{c.emoji}</span>
                    {c.destaque && <span className="absolute top-2 left-2 bg-violet-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Destaque</span>}
                    {matriculado && <span className="absolute top-2 right-2 bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Check size={10} /> Matriculado</span>}
                  </div>
                  <div className="p-3">
                    <h3 className="text-white font-bold text-sm mb-1">{c.titulo}</h3>
                    <p className="text-zinc-500 text-[10px] line-clamp-2 mb-2">{c.descricao}</p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 mb-2">
                      <span className="flex items-center gap-1"><Clock size={10} /> {c.duracao}</span>
                      <span className="flex items-center gap-1"><BookOpen size={10} /> {c.nivel}</span>
                    </div>
                    <p className="font-bold text-sm text-violet-300">{fmtPrice(c.preco)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {checkoutOverlay}
        {authOverlay}
        {toastOverlay}
      </div>
    );
  }

  // === DETAIL VIEW ===
  if (view === 'detail' && selectedCurso) {
    const matriculado = matriculas.includes(selectedCurso.id);
    return (
      <div className="fixed inset-0 z-[9998] bg-black flex flex-col">
        <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 0%, #a855f7 0%, transparent 40%)' }} />

        {/* Header */}
        <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => { setView('marketplace'); setSelectedCurso(null); }} className="p-2 hover:text-violet-400 transition"><ArrowLeft size={20} className="text-white" /></button>
          <div className="flex-1"><h1 className="text-white font-bold text-sm line-clamp-1">{selectedCurso.titulo}</h1></div>
          <button onClick={() => setAuthModalOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
            {authUser ? (authProfile?.avatar_url ? <img src={authProfile.avatar_url} alt="Perfil" className="w-5 h-5 rounded-full object-cover" /> : <UserCircle size={18} className="text-violet-400" />) : <UserCircle size={18} className="text-zinc-400" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {/* Hero */}
          <div className="relative h-40 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/20 rounded-2xl flex items-center justify-center mb-4 mt-4">
            <span className="text-6xl">{selectedCurso.emoji}</span>
            {selectedCurso.destaque && <span className="absolute top-3 left-3 bg-violet-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Destaque</span>}
          </div>

          <h2 className="text-white font-black text-xl mb-2">{selectedCurso.titulo}</h2>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mb-4">
            <span className="flex items-center gap-1"><Clock size={12} /> {selectedCurso.duracao}</span>
            <span className="flex items-center gap-1"><BookOpen size={12} /> {selectedCurso.nivel}</span>
            <span className="flex items-center gap-1"><Star size={12} className="fill-violet-500 text-violet-500" /> 4.8</span>
          </div>

          {/* Descricao */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 mb-4">
            <h3 className="text-white font-bold text-sm mb-2">Sobre o curso</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{selectedCurso.descricao}</p>
          </div>

          {/* Estrutura */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 mb-4">
            <h3 className="text-white font-bold text-sm mb-3">Estrutura do curso</h3>
            <div className="space-y-2">
              {TIMELINE.map((tl) => (
                <div key={tl.fase} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-white text-xs font-semibold">{tl.fase} — {tl.periodo}</p>
                    <p className="text-zinc-500 text-[10px]">{tl.modulos.length} modulos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preco + botao */}
          <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/10 border border-violet-500/30 rounded-2xl p-4 mb-4">
            <p className="text-zinc-400 text-xs mb-1">Investimento unico</p>
            <p className="text-white font-black text-2xl mb-3">{fmtPrice(selectedCurso.preco)}</p>
            {matriculado ? (
              <button onClick={() => setView('panel')} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-3.5 rounded-xl transition flex items-center justify-center gap-2">
                <PlayCircle size={18} /> Acessar Curso
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!authUser) { setAuthModalOpen(true); showToast('Entre para se matricular'); return; }
                  sfxClick(); setCheckoutOpen(true);
                }}
                className="w-full bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm py-3.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                <GraduationCap size={18} /> COMECAR CURSO
              </button>
            )}
          </div>
        </div>

        {checkoutOverlay}
        {authOverlay}
        {toastOverlay}
      </div>
    );
  }

  // === PANEL VIEW ===
  if (view === 'panel' && selectedCurso) {
    return (
      <CursoPanel
        curso={selectedCurso}
        onBack={() => { setView('detail'); }}
        onExit={onClose}
        authUser={authUser}
        authProfile={authProfile}
        onOpenAuth={() => setAuthModalOpen(true)}
      >
        {checkoutOverlay}
        {authOverlay}
        {toastOverlay}
      </CursoPanel>
    );
  }

  return null;
}

/* ===== Curso Panel ===== */
function CursoPanel({ curso, onBack, onExit, authUser, authProfile, onOpenAuth, children }: {
  curso: Curso;
  onBack: () => void;
  onExit: () => void;
  authUser: { email?: string; id?: string } | null;
  authProfile: { full_name?: string; avatar_url?: string } | null;
  onOpenAuth: () => void;
  children?: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedFase, setExpandedFase] = useState<string | null>(null);
  const [activeContent, setActiveContent] = useState<string | null>('orientacoes');

  const menuItems = [
    { id: 'orientacoes', label: 'Orientacoes do curso', icon: BookOpen },
    { id: 'timeline', label: 'Linha do tempo', icon: Calendar },
    { id: 'certificados', label: 'Certificados', icon: Award },
    { id: 'mercado', label: 'Mercado de Trabalho', icon: Briefcase },
  ];

  return (
    <div className="fixed inset-0 z-[9998] bg-black flex flex-col">
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 0%, #a855f7 0%, transparent 40%)' }} />

      {/* Top bar with menu button */}
      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setMenuOpen(true)} className="p-2 hover:text-violet-400 transition">
          <Menu size={20} className="text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-sm line-clamp-1">{curso.titulo}</h1>
          <p className="text-zinc-500 text-[10px]">{curso.emoji} {curso.area}</p>
        </div>
        <button onClick={onOpenAuth} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
          {authUser ? (authProfile?.avatar_url ? <img src={authProfile.avatar_url} alt="Perfil" className="w-5 h-5 rounded-full object-cover" /> : <UserCircle size={18} className="text-violet-400" />) : <UserCircle size={18} className="text-zinc-400" />}
        </button>
        <button onClick={onExit} className="p-2 hover:text-red-400 transition"><X size={20} className="text-white" /></button>
      </div>

      {/* Side menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur" />
          <div className="relative w-72 max-w-[80vw] h-full bg-zinc-950 border-r border-zinc-800 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-sm">{curso.titulo}</h3>
                <p className="text-violet-400 text-[10px]">Painel do aluno</p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-1.5"><X size={18} className="text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {menuItems.map((mi) => (
                <button
                  key={mi.id}
                  onClick={() => { setActiveContent(mi.id); setMenuOpen(false); sfxClick(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${activeContent === mi.id ? 'bg-violet-500/15 text-violet-300 border border-violet-500/40' : 'text-zinc-400 hover:bg-zinc-900 border border-transparent'}`}
                >
                  <mi.icon size={16} /> {mi.label}
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-zinc-800">
              <button onClick={onBack} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-900 transition">
                <ArrowLeft size={16} /> Voltar para detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4">
        {activeContent === 'orientacoes' && (
          <div className="space-y-3">
            <h2 className="text-white font-bold text-lg mb-2">Orientacoes do curso</h2>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-zinc-300 text-sm">O curso esta dividido em 4 fases mais a conclusao, totalizando 11 modulos + certificacao.</p>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-zinc-300 text-sm">Cada modulo contem videoaulas, material de apoio e atividades praticas.</p>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-zinc-300 text-sm">O acesso aos modulos e liberado conforme o cronograma das fases (jan a dez).</p>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-zinc-300 text-sm">Ao concluir todos os modulos, voce recebera seu certificado digital.</p>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-zinc-300 text-sm">Em caso de duvidas, utilize o canal de suporte pelo K-AI dentro do app.</p>
              </div>
            </div>
            <button onClick={() => setActiveContent('timeline')} className="w-full bg-violet-500/15 border border-violet-500/40 text-violet-300 font-semibold text-sm py-3 rounded-xl transition hover:bg-violet-500/25">
              Ver linha do tempo
            </button>
          </div>
        )}

        {activeContent === 'timeline' && (
          <div className="space-y-3">
            <h2 className="text-white font-bold text-lg mb-2">Linha do tempo</h2>
            <p className="text-zinc-500 text-xs mb-3">Clique em uma fase para expandir os modulos</p>
            {TIMELINE.map((tl) => (
              <div key={tl.fase} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => { sfxClick(); setExpandedFase(expandedFase === tl.fase ? null : tl.fase); }}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">{tl.fase}</p>
                    <p className="text-zinc-500 text-[10px]">{tl.periodo} · {tl.modulos.length} modulos</p>
                  </div>
                  <ChevronDown size={18} className={`text-zinc-500 transition ${expandedFase === tl.fase ? 'rotate-180' : ''}`} />
                </button>
                {expandedFase === tl.fase && (
                  <div className="border-t border-zinc-800 p-3 space-y-2">
                    {tl.modulos.map((mod, idx) => {
                      const isConclusao = tl.fase === 'Conclusao';
                      return (
                        <div key={idx} className="flex items-center gap-3 bg-zinc-800/40 rounded-xl p-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isConclusao ? 'bg-emerald-500/20' : 'bg-violet-500/20'}`}>
                            {isConclusao ? <Award size={16} className="text-emerald-400" /> : <PlayCircle size={16} className="text-violet-400" />}
                          </div>
                          <span className="text-zinc-300 text-xs">{mod}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeContent === 'certificados' && (
          <div className="space-y-3">
            <h2 className="text-white font-bold text-lg mb-2">Certificados</h2>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-center">
              <Award size={48} className="text-violet-400 mx-auto mb-3" />
              <p className="text-white font-bold text-sm mb-1">Certificado de Conclusao</p>
              <p className="text-zinc-500 text-xs mb-4">Disponivel apos concluir todos os 11 modulos</p>
              <div className="bg-zinc-800/40 rounded-xl p-3 inline-block">
                <p className="text-[10px] text-zinc-600">Progresso</p>
                <p className="text-white font-bold text-lg">0 / 11</p>
              </div>
            </div>
          </div>
        )}

        {activeContent === 'mercado' && (
          <div className="space-y-3">
            <h2 className="text-white font-bold text-lg mb-2">Mercado de Trabalho</h2>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-2"><Briefcase size={16} className="text-violet-400 mt-0.5 shrink-0" /><p className="text-zinc-300 text-sm">O mercado para profissionais da area de {curso.area} cresce a cada ano com alta demanda.</p></div>
              <div className="flex items-start gap-2"><TrendingUp size={16} className="text-violet-400 mt-0.5 shrink-0" /><p className="text-zinc-300 text-sm">Salario medio inicial: R$ 2.500 a R$ 4.500 dependendo da regiao e experiencia.</p></div>
              <div className="flex items-start gap-2"><Rocket size={16} className="text-violet-400 mt-0.5 shrink-0" /><p className="text-zinc-300 text-sm">Possibilidade de empreender: 60% dos formados abrem o proprio negocio em ate 2 anos.</p></div>
              <div className="flex items-start gap-2"><Check size={16} className="text-emerald-400 mt-0.5 shrink-0" /><p className="text-zinc-300 text-sm">Certificacao Korvil reconhecida por parceiros e empresas conveniadas.</p></div>
            </div>
          </div>
        )}
      </div>

      {children}
    </div>
  );
}

/* ===== Checkout ===== */
function CursosCheckout({ curso, onClose, onConfirm }: {
  curso: Curso;
  onClose: () => void;
  onConfirm: (pixCode: string, bankUsed: string | undefined) => Promise<void>;
}) {
  const [paid, setPaid] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankSearch, setBankSearch] = useState('');

  const pixCode = generatePixCode(curso.preco);

  const sortedBanks = useMemo(() => getSortedBanks(BANKS), []);
  const usage = getBankUsage();
  const mostUsedBanks = sortedBanks.filter((b) => (usage[b.name] ?? 0) > 0);
  const filteredBanks = useMemo(() => {
    const q = bankSearch.toLowerCase().trim();
    if (!q) return sortedBanks;
    return sortedBanks.filter((b) => b.name.toLowerCase().includes(q));
  }, [bankSearch, sortedBanks]);

  const openBankApp = (bank: typeof BANKS[0]) => {
    setSelectedBank(bank.name);
    sfxClick();
    void copyToClipboard(pixCode).then(() => { setPixCopied(true); setTimeout(() => setPixCopied(false), 2000); });
    const start = Date.now();
    window.location.href = bank.deeplink;
    setTimeout(() => { if (Date.now() - start < 1500) window.open(bank.fallback, '_blank'); }, 1500);
  };

  useEffect(() => {
    if (!waiting) return;
    const checkFocus = () => {
      if (!document.hidden) {
        setWaiting(false); setPaid(true); sfxClick();
        setTimeout(() => { void onConfirm(pixCode, selectedBank ?? undefined); }, 1500);
      }
    };
    document.addEventListener('visibilitychange', checkFocus);
    window.addEventListener('focus', checkFocus);
    return () => { document.removeEventListener('visibilitychange', checkFocus); window.removeEventListener('focus', checkFocus); };
  }, [waiting, pixCode, selectedBank, onConfirm]);

  const handleConfirm = () => { setWaiting(true); sfxClick(); };
  const handleAlreadyPaid = () => {
    setWaiting(false); setPaid(true); sfxClick();
    setTimeout(() => { void onConfirm(pixCode, selectedBank ?? undefined); }, 1500);
  };

  if (paid) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 text-center backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-emerald-400" /></div>
          <h3 className="font-bold text-lg text-white mb-1">Matricula confirmada!</h3>
          <p className="text-zinc-400 text-sm">{curso.titulo}</p>
          <p className="text-zinc-500 text-xs mt-2">PIX para {PIX_KEY}</p>
        </div>
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 text-center backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse"><Clock size={32} className="text-violet-400" /></div>
          <h3 className="font-bold text-lg text-white mb-1">Aguardando pagamento PIX</h3>
          <p className="text-zinc-400 text-sm mb-1">Pague {fmtPrice(curso.preco)} via PIX</p>
          <p className="text-zinc-500 text-xs mb-4">Chave: {PIX_KEY} (Neon)</p>
          <button onClick={handleAlreadyPaid} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2"><Check size={18} /> Ja paguei, verificar</button>
          <button onClick={() => setWaiting(false)} className="w-full mt-2 text-zinc-400 text-xs py-2 hover:text-white transition">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-white">Pagar Matricula</h3>
          <button onClick={onClose} className="p-1.5"><X size={18} className="text-white" /></button>
        </div>

        <div className="bg-zinc-800/40 rounded-xl p-3 mb-4 flex items-center gap-3">
          <span className="text-3xl">{curso.emoji}</span>
          <div>
            <p className="text-white font-bold text-sm">{curso.titulo}</p>
            <p className="text-violet-300 font-bold text-lg">{fmtPrice(curso.preco)}</p>
          </div>
        </div>

        {/* PIX */}
        <div className="mb-4 bg-black border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-400 mb-2">Pague via Pix para:</p>
          <p className="text-sm font-bold text-white mb-1">{PIX_KEY}</p>
          <p className="text-[10px] text-zinc-500 mb-3">Banco Neon · {fmtPrice(curso.preco)}</p>
          <div className="flex items-center gap-2 mb-3">
            <input readOnly value={pixCode} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-[10px] text-zinc-400" />
            <button onClick={() => { void copyToClipboard(pixCode).then(() => { setPixCopied(true); sfxClick(); setTimeout(() => setPixCopied(false), 2000); }); }} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"><Copy size={14} className="text-zinc-300" /></button>
          </div>
          {pixCopied && <p className="text-[10px] text-emerald-400 mb-2">Codigo PIX copiado!</p>}
          <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center p-2">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZiIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZmIi8+PC9zdmc+')] bg-contain bg-no-repeat bg-center" />
          </div>
          <p className="text-center text-[10px] text-zinc-500 mt-2">QR Code Pix copia e cola</p>
        </div>

        {/* Bancos */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1"><Building2 size={12} /> Pagar pelo banco</p>
          <input value={bankSearch} onChange={(e) => setBankSearch(e.target.value)} placeholder="Digite seu banco (ex: Nubank, Itau...)" className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none mb-2" />
          {mostUsedBanks.length > 0 && !bankSearch && (
            <div className="mb-2">
              <p className="text-[10px] text-violet-400 font-semibold mb-1">Mais usados</p>
              <div className="grid grid-cols-4 gap-1.5">
                {mostUsedBanks.slice(0, 4).map((b) => (
                  <button key={b.name} onClick={() => openBankApp(b)} className={`px-1 py-2 rounded-lg text-[9px] font-semibold transition border ${selectedBank === b.name ? 'bg-violet-500/15 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>{b.name}</button>
                ))}
              </div>
            </div>
          )}
          <p className="text-[10px] text-zinc-500 font-semibold mb-1">Todos os bancos</p>
          <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
            {filteredBanks.map((b) => (
              <button key={b.name} onClick={() => openBankApp(b)} className={`px-1 py-2 rounded-lg text-[9px] font-semibold transition border ${selectedBank === b.name ? 'bg-violet-500/15 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>{b.name}</button>
            ))}
          </div>
        </div>

        <button onClick={handleConfirm} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2">
          <Check size={18} /> PAGAR MATRICULA
        </button>
        <p className="text-center text-zinc-600 text-[10px] mt-3 flex items-center justify-center gap-1"><ShieldCheck size={10} /> Pagamento seguro KORVIL Cursos</p>
      </div>
    </div>
  );
}

/* ===== Auth Modal (shared pattern) ===== */
function AuthModal({ user, profile, mode, setMode, email, setEmail, pass, setPass, error, loading, onClose, onSignIn, onSignOut }: {
  user: { email?: string; id?: string } | null;
  profile: { full_name?: string; avatar_url?: string } | null;
  mode: 'login' | 'signup';
  setMode: (m: 'login' | 'signup') => void;
  email: string; setEmail: (v: string) => void;
  pass: string; setPass: (v: string) => void;
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
        {user ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-3">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" /> : <UserCircle size={28} className="text-violet-400" />}
            </div>
            <h3 className="font-bold text-lg text-white mb-1">{profile?.full_name ?? user.email}</h3>
            <p className="text-xs text-zinc-500 mb-4">{user.email}</p>
            <button onClick={onSignOut} className="w-full text-red-400 font-semibold text-sm py-2.5 hover:text-red-300 transition">Sair</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-lg text-white mb-4 text-center">{mode === 'login' ? 'Entrar na Korvil' : 'Criar conta'}</h3>
            <div className="space-y-3">
              <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none" />
              <input type="password" placeholder="Senha" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none" />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button onClick={onSignIn} disabled={loading || !email || !pass} className="w-full bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm py-3 rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-2">
                {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
              <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full text-zinc-400 text-xs hover:text-white transition">{mode === 'login' ? 'Nao tem conta? Criar agora' : 'Ja tem conta? Entrar'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
