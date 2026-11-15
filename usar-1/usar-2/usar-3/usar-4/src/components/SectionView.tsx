import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import {
  Sparkles, HandHeart, Bone, Smile, Scissors, Flower2, BookOpen, GraduationCap,
  Wallet, TrendingUp, Sheet, Dumbbell, Watch, Shirt, Pill, Apple, Shield,
  HardHat, Scale, Calculator, Globe, Code, Server, Calendar, Award, Rocket,
  Handshake, ShoppingBag, Wrench, Truck, Target, Briefcase, ChevronRight, ArrowLeft,
} from 'lucide-react';
import { SECTIONS, CENTRAL_KORVIL, type KorvilSection, type SubItem } from '@/lib/korvilData';

const TransformacaoScreen = lazy(() => import('@/components/TransformacaoScreen'));

const ICONS: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  Sparkles, HandHeart, Bone, Smile, Scissors, Flower2, BookOpen, GraduationCap,
  Wallet, TrendingUp, Sheet, Dumbbell, Watch, Shirt, Pill, Apple, Shield,
  HardHat, Scale, Calculator, Globe, Code, Server, Calendar, Award, Rocket,
  Handshake, ShoppingBag, Wrench, Truck, Target, Briefcase,
};

function ItemCard({ item, color, onClick }: { item: SubItem; color: string; onClick?: () => void }) {
  const Icon = ICONS[item.icon] ?? Sparkles;
  return (
    <button
      onClick={onClick}
      className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-left hover:border-zinc-600 transition-all hover:bg-zinc-800/60 flex items-start gap-3 w-full"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-semibold text-sm">{item.name}</h4>
        <p className="text-zinc-400 text-xs mt-0.5">{item.description}</p>
      </div>
      <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition shrink-0 mt-1" />
    </button>
  );
}

function SectionHeader({ section, onBack }: { section: KorvilSection; onBack: () => void }) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm mb-4 transition"
      >
        <ArrowLeft size={16} /> Central
      </button>
      <div className="relative rounded-3xl overflow-hidden mb-6 h-44 sm:h-56">
        <img src={section.banner} alt={section.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <img
            src={section.logo}
            alt={section.name}
            className="w-14 h-14 rounded-full border-2 object-contain p-1 bg-black"
            style={{ borderColor: section.color, boxShadow: `0 0 16px ${section.color}88` }}
            onError={(e) => ((e.target as HTMLImageElement).src = '/logokai.png')}
          />
          <div>
            <h2 className="text-white font-bold text-xl sm:text-2xl">{section.name}</h2>
            <p className="text-zinc-300 text-sm">{section.tagline}</p>
          </div>
        </div>
      </div>
      <p className="text-zinc-400 text-sm mb-6 max-w-2xl">{section.description}</p>
    </>
  );
}

export function SectionView({ sectionId, onBack }: { sectionId: string; onBack: () => void }) {
  const section = SECTIONS.find((s) => s.id === sectionId);
  const [projetoAberto, setProjetoAberto] = useState(false);
  if (!section) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <SectionHeader section={section} onBack={onBack} />
      {section.categories.map((cat) => (
        <div key={cat.title} className="mb-8">
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full" style={{ backgroundColor: section.color }} />
            {cat.title}
          </h3>
          <AutoCarousel>
            {cat.items.map((item) => (
              <div key={item.name} className="snap-start shrink-0 w-[280px] sm:w-[340px]">
                <ItemCard
                  item={item}
                  color={section.color}
                  onClick={
                    sectionId === 'ktp' && item.name === 'Projeto TRANSFORMAÇÃO'
                      ? () => setProjetoAberto(true)
                      : undefined
                  }
                />
              </div>
            ))}
          </AutoCarousel>
        </div>
      ))}

      {projetoAberto && (
        <Suspense fallback={null}>
          <TransformacaoScreen
            onClose={() => setProjetoAberto(false)}
            onAcessar={() => {}}
          />
        </Suspense>
      )}
    </div>
  );
}

/* Carrossel horizontal com rolagem automática a cada 5 segundos.
   Quando o usuário mexe manualmente (arrasta, scroll ou touch),
   a rolagem automática pausa por 7 segundos e depois volta sozinha. */
function AutoCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef = useRef(false);
  const directionRef = useRef<1 | -1>(1);

  const startAuto = () => {
    stopAuto();
    autoRef.current = setInterval(() => {
      if (pausedRef.current) return;
      const el = scrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;

      let next = el.scrollLeft + directionRef.current * el.clientWidth * 0.8;
      if (next >= maxScroll) {
        next = maxScroll;
        directionRef.current = -1;
      } else if (next <= 0) {
        next = 0;
        directionRef.current = 1;
      }
      el.scrollTo({ left: next, behavior: 'smooth' });
    }, 5000);
  };

  const stopAuto = () => {
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
    }
  };

  const pauseAuto = () => {
    pausedRef.current = true;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 7000);
  };

  useEffect(() => {
    startAuto();
    return () => {
      stopAuto();
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-1 px-1"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#444 transparent' }}
      onScroll={pauseAuto}
      onWheel={pauseAuto}
      onTouchStart={pauseAuto}
      onTouchMove={pauseAuto}
      onPointerDown={pauseAuto}
    >
      {children}
    </div>
  );
}

export function CentralDashboard({ onNavigate, onOpenLoja, onOpenOmfome, onOpenCursos }: { onNavigate: (id: string) => void; onOpenLoja?: () => void; onOpenOmfome?: () => void; onOpenCursos?: () => void }) {
  const extensaoLogos: Record<string, string> = {
    'K.L / KORVIL Loja': '/assets/korvil-loja.svg',
    'K-OMFOME Delivery': '/assets/korvil-omfome.svg',
  };
  const extensaoClick: Record<string, (() => void) | undefined> = {
    'K.L / KORVIL Loja': onOpenLoja,
    'K-OMFOME Delivery': onOpenOmfome,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <h3 className="text-white font-bold text-lg mb-3">CENTRAL KORVIL</h3>

      <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-violet-500" />
        SERVIÇOS
      </h3>
      <AutoCarousel>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onNavigate(s.id)}
            className="group snap-start shrink-0 w-[160px] sm:w-[180px] bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-zinc-600 transition-all"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-zinc-100 ring-1 ring-zinc-700 group-hover:ring-2 transition" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
              <img
                src={s.logo}
                alt={s.name}
                className="w-full h-full object-cover"
                onError={(e) => ((e.target as HTMLImageElement).src = '/logokai.png')}
              />
            </div>
            <span className="text-white text-xs font-semibold">{s.name}</span>
            <span className="text-zinc-500 text-[10px] text-center leading-tight">{s.tagline}</span>
          </button>
        ))}
      </AutoCarousel>

      {/* Central content */}
      {CENTRAL_KORVIL.categories.map((cat) => (
        <div key={cat.title} className="mb-8 mt-8">
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-violet-500" />
            {cat.title}
          </h3>
          {cat.title === 'Extensões' ? (
            <AutoCarousel>
              {cat.items.map((item) => {
                const logo = extensaoLogos[item.name] ?? '/logokai.png';
                const onClick = extensaoClick[item.name];
                return (
                  <button
                    key={item.name}
                    onClick={onClick}
                    className="group snap-start shrink-0 w-[280px] sm:w-[340px] bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-left hover:border-zinc-600 transition-all hover:bg-zinc-800/60 flex items-center gap-3"
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 ring-1 ring-violet-500/40 group-hover:ring-2 group-hover:ring-violet-400 transition" style={{ boxShadow: '0 2px 12px rgba(168,85,247,0.3)' }}>
                      <img src={logo} alt={item.name} className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).src = '/logokai.png')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                      <p className="text-zinc-400 text-xs mt-0.5">{item.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition shrink-0 mt-1" />
                  </button>
                );
              })}
            </AutoCarousel>
          ) : (
            <AutoCarousel>
              {cat.items.map((item) => (
                <div key={item.name} className="snap-start shrink-0 w-[280px] sm:w-[340px]">
                  <ItemCard
                    item={item}
                    color={CENTRAL_KORVIL.color}
                    onClick={
                      item.name === 'Cursos' && onOpenCursos ? onOpenCursos
                      : item.name === 'K.L / KORVIL Loja' && onOpenLoja ? onOpenLoja
                      : item.name === 'K-OMFOME Delivery' && onOpenOmfome ? onOpenOmfome
                      : undefined
                    }
                  />
                </div>
              ))}
            </AutoCarousel>
          )}
        </div>
      ))}
    </div>
  );
}
