import { useState } from 'react';
import {
  Sparkles, HandHeart, Bone, Smile, Scissors, Flower2, BookOpen, GraduationCap,
  Wallet, TrendingUp, Sheet, Dumbbell, Watch, Shirt, Pill, Apple, Shield,
  HardHat, Scale, Calculator, Globe, Code, Server, Calendar, Award, Rocket,
  Handshake, ShoppingBag, Wrench, Truck, Target, Briefcase, ChevronRight, ArrowLeft,
} from 'lucide-react';
import { SECTIONS, CENTRAL_KORVIL, type KorvilSection, type SubItem } from '@/lib/korvilData';
import TransformacaoScreen from '@/components/TransformacaoScreen';
import KorvilStats from '@/components/KorvilStats';

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
            onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cat.items.map((item) => (
              <ItemCard
                key={item.name}
                item={item}
                color={section.color}
                onClick={
                  sectionId === 'ktp' && item.name === 'Projeto TRANSFORMAÇÃO'
                    ? () => setProjetoAberto(true)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ))}

      {projetoAberto && <TransformacaoScreen onClose={() => setProjetoAberto(false)} />}
    </div>
  );
}

export function CentralDashboard({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden mb-6 h-40 sm:h-52 bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #a855f7 0%, transparent 50%), radial-gradient(circle at 70% 50%, #06b6d4 0%, transparent 50%)' }} />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-white font-black text-2xl sm:text-4xl tracking-tight">S.O.K</h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-1">Sistema Operacional Korvil</p>
          <p className="text-zinc-500 text-xs mt-2">Acesso total automático • GitHub + Bolt + APP</p>
        </div>
      </div>

      {/* Ecossistema KORVIL */}
      <h3 className="text-white font-bold text-lg mb-3">Ecossistema KORVIL</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onNavigate(s.id)}
            className="group bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-zinc-600 transition-all"
          >
            <img
              src={s.logo}
              alt={s.name}
              className="w-12 h-12 rounded-full object-contain p-1 bg-black ring-1 ring-zinc-700 group-hover:ring-2 transition"
              onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')}
            />
            <span className="text-white text-xs font-semibold">{s.name}</span>
            <span className="text-zinc-500 text-[10px] text-center leading-tight">{s.tagline}</span>
          </button>
        ))}
      </div>

      <KorvilStats />

      {/* Central content */}
      {CENTRAL_KORVIL.categories.map((cat) => (
        <div key={cat.title} className="mb-8">
          <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-violet-500" />
            {cat.title}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cat.items.map((item) => (
              <ItemCard key={item.name} item={item} color={CENTRAL_KORVIL.color} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
