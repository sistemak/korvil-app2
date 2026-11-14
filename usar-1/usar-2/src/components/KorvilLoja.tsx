/* Korvil-Loja — Marketplace oficial K.L. Fullscreen, catálogo, filtros, busca,
   carrinho, favoritos, pedidos, cupom, checkout com frete inteligente, bancos,
   Pix QR, K-AI flutuante, admin, auto-carousel, sons Web Audio, skeleton shimmer.
   Estilo visual: premium tech black + cyan #22d3ee, glassmorphism, glow effects. */

import { useState, useMemo, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
  X, Search, ShoppingCart, Heart, Tag, Settings,
  Star, Truck, Check, ChevronRight, ChevronDown, Plus, Minus,
  ShoppingBag, Package, User, Zap, MapPin, Building2, Copy,
  ShieldCheck, Bell, Share2, Clock, Award, ThumbsUp,
  Mic as MicIcon, Camera as CameraIcon, Home as HomeIcon, PlusCircle,
  Play as PlayIcon, Pencil,
} from 'lucide-react';
import {
  PRODUCTS, SECTORS, type Product, type Sector,
} from '@/data/korvil-loja-catalog';
import { fetchLojaProducts } from '@/lib/lojaProducts';
import LojaProductForm from '@/components/LojaProductForm';
import { getFreteByBairro } from '@/lib/frete';
import { getLojaUser, type LojaUser } from '@/lib/lojaAuth';
import { isAdminEmail } from '@/data/admins';
import KAIButton from '@/components/KAIButton';
import { askKorvilAI } from '@/lib/k-ai-client';
import { supabase, getSessionUser, signIn, signUpAccount, signOut } from '@/lib/korvilAuth';
import { generatePixCode, copyToClipboard, PIX_KEY } from '@/lib/pixCode';
import {
  getBankUsage, incrementBankUsage, getSortedBanks,
  createPedido, getPedidos, updatePedidoStatus,
  getFavoritos, toggleFavorito as toggleFavoritoDb,
  getAvaliacoes, addAvaliacao, getPerguntas, addPergunta,
  type Avaliacao, type Pergunta,
} from '@/lib/lojaMarketplace';

type Tab = 'compras' | 'pedidos' | 'favoritos' | 'cupom' | 'config';

interface CartItem {
  productId: string;
  qty: number;
  variations: Record<string, string>;
}

interface Order {
  id: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  date: string;
  coupon?: string;
  freight?: number;
  deliveryMode?: 'entrega' | 'retirar';
}

const CART_KEY = 'kl-cart';
const FAV_KEY = 'kl-favs';
const ORDERS_KEY = 'kl-orders';
const COUPON_CODE = 'KORVIL10';
const FILTER_ORDER = ['Marcas', 'Faixa de Preço', 'Amperagens', 'Aromas', 'autor', 'Bitolas', 'bivolt', 'capacidade', 'comprimento', 'Cores', 'dureza', 'Formatos', 'Grãos', 'itens', 'marca', 'Materiais', 'Modelos', 'nível', 'Pesos', 'Planos', 'quantidade', 'ram', 'Regiões', 'resolução', 'Sabores', 'ssd', 'Tamanhos', 'Tipos', 'tipo-limpeza', 'tipo-pele', 'Versões', 'Voltagens', 'Volumes'] as const;
const FILTER_LABELS: Record<string, string> = { tipo: 'Tipos', tamanho: 'Tamanhos', sabor: 'Sabores', cor: 'Cores', material: 'Materiais', volume: 'Volumes', peso: 'Pesos', voltagem: 'Voltagens', aroma: 'Aromas', grão: 'Grãos', bitola: 'Bitolas', amperagem: 'Amperagens', região: 'Regiões', plano: 'Planos', versão: 'Versões', modelo: 'Modelos', nivel: 'nível', formato: 'Formatos', 'tipo-limpeza': 'tipo-limpeza', 'tipo-pele': 'tipo-pele', itens: 'itens', capacidade: 'capacidade', comprimento: 'comprimento', dureza: 'dureza', ram: 'ram', ssd: 'ssd', resolução: 'resolução', bivolt: 'bivolt', quantidade: 'quantidade', autor: 'autor' };

/* --- Web Audio sons sutis --- */
let audioCtx: AudioContext | null = null;
function FiltroRecolhivel({ titulo, children }: { titulo: ReactNode; children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="mt-4 border-t border-[#e5e7eb] pt-4">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="mb-2 flex w-full items-center justify-between gap-2 text-sm font-bold text-[#222] transition hover:text-[#3483fa]"
      >
        {titulo}
        {aberto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {aberto && children}
    </div>
  );
}

function getCtx(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return audioCtx;
  } catch {
    return null;
  }
}
function playSound(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.2) {
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignora
  }
}
const sfx = {
  click: () => playSound(800, 0.05, 'sine', 0.15),
  cart: () => playSound(400, 0.08, 'sine', 0.2),
  success: () => { playSound(523, 0.1, 'sine', 0.2); setTimeout(() => playSound(659, 0.1, 'sine', 0.2), 80); setTimeout(() => playSound(784, 0.15, 'sine', 0.2), 160); },
  error: () => playSound(150, 0.15, 'sawtooth', 0.15),
};

function load<T>(key: string, fallback: T): T {
  try {
    const r = localStorage.getItem(key);
    return r ? (JSON.parse(r) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignora
  }
}

function fmtPrice(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

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
  { name: 'Nubank Ultra', deeplink: 'nubank://', fallback: 'https://app.nubank.com.br' },
  { name: 'PagBank', deeplink: 'pagbank://', fallback: 'https://pagbank.com.br' },
  { name: 'Mercado Pago', deeplink: 'mercadopago://', fallback: 'https://www.mercadopago.com.br' },
  { name: 'PicPay', deeplink: 'picpay://', fallback: 'https://www.picpay.com' },
  { name: 'Banco Original', deeplink: 'original://', fallback: 'https://www.original.com.br' },
  { name: 'Banco BV', deeplink: 'bvbank://', fallback: 'https://www.bancobv.com.br' },
  { name: 'BS2', deeplink: 'bs2://', fallback: 'https://www.bs2.com' },
];

function SkeletonCard() {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-800/50 shimmer" />
      <div className="p-3 space-y-1.5">
        <div className="h-2 w-1/3 bg-gray-800 rounded" />
        <div className="h-3 w-3/4 bg-gray-800 rounded" />
        <div className="h-2 w-1/2 bg-gray-800 rounded" />
        <div className="h-6 w-full bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}

export default function KorvilLoja({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('compras');
  const [search, setSearch] = useState('');
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeTagFilters, setActiveTagFilters] = useState<Record<string, string>>({});
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [buyNowProduct, setBuyNowProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(load(CART_KEY, []));
  const [favs, setFavs] = useState<string[]>(load(FAV_KEY, []));
  const [orders, setOrders] = useState<Order[]>(load(ORDERS_KEY, []));
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [lojaUser, setLojaUser] = useState<LojaUser | null>(null);
  const [confetti, setConfetti] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating'>('relevance');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; text: string; read: boolean }[]>([]);
  const [authUser, setAuthUser] = useState<{ email?: string; id?: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authProfile, setAuthProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const carouselRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => save(CART_KEY, cart), [cart]);
  useEffect(() => save(FAV_KEY, favs), [favs]);
  useEffect(() => save(ORDERS_KEY, orders), [orders]);

  // Auto-login ADM
  useEffect(() => {
    getLojaUser().then(setLojaUser);
  }, [authUser?.id]);

  useEffect(() => {
    fetchLojaProducts().then((remote) => { if (remote) setProducts(remote); });
  }, []);

  // Auth session check
  useEffect(() => {
    (async () => {
      const u = await getSessionUser();
      setAuthUser(u);
      if (u) {
        const { data } = await supabase.from('korvil_users').select('full_name, avatar_url').eq('id', u.id).maybeSingle();
        if (data) setAuthProfile(data);
        const dbFavs = await getFavoritos();
        if (dbFavs.length > 0) setFavs(dbFavs);
        const dbPedidos = await getPedidos();
        if (dbPedidos.length > 0) {
          const mapped: Order[] = dbPedidos.map((p) => ({
            id: p.order_code,
            items: p.items as { name: string; qty: number; price: number }[],
            total: p.total,
            date: new Date(p.created_at).toLocaleDateString('pt-BR'),
            coupon: p.coupon,
            freight: p.freight,
            deliveryMode: p.delivery_mode as 'entrega' | 'retirar',
          }));
          setOrders(mapped);
        }
      }
    })();
  }, []);

  // Skeleton loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Auto-carousel de produtos em destaque
  const featured = useMemo(() => [...products].sort(() => Math.random() - 0.5).slice(0, 6), [products]);
  const bannerSlides = useMemo(() => featured.slice(0, 3), [featured]);
  useEffect(() => {
    carouselRef.current = setInterval(() => {
      setCarouselIdx((i) => (i + 1) % 3);
    }, 4000);
    return () => { if (carouselRef.current) clearInterval(carouselRef.current); };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (activeSector) list = list.filter((p) => p.sector === activeSector);
    if (activeCategory) list = list.filter((p) => p.category === activeCategory);
    if (activeSub) list = list.filter((p) => p.subcategory === activeSub);
    if (activeBrand) list = list.filter((p) => p.brand === activeBrand);
    Object.entries(activeTagFilters).forEach(([key, value]) => {
      list = list.filter((p) => p.tags.includes(`${key}:${value}`));
    });
    if (priceMin !== null) list = list.filter((p) => p.price >= priceMin);
    if (priceMax !== null) list = list.filter((p) => p.price <= priceMax);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [products, activeSector, activeCategory, activeSub, activeBrand, activeTagFilters, priceMin, priceMax, search]);

  const shuffled = useMemo(() => {
    if (!search && !activeSector && !activeCategory && !activeSub && !activeBrand) {
      const base = [...products].sort(() => Math.random() - 0.5);
      if (sortBy === 'price_asc') return [...base].sort((a, b) => a.price - b.price);
      if (sortBy === 'price_desc') return [...base].sort((a, b) => b.price - a.price);
      if (sortBy === 'rating') return [...base].sort((a, b) => b.rating - a.rating);
      return base;
    }
    if (sortBy === 'price_asc') return [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') return [...filtered].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return [...filtered].sort((a, b) => b.rating - a.rating);
    return filtered;
  }, [filtered, search, activeSector, activeCategory, activeSub, activeBrand, activeTagFilters, priceMin, priceMax, sortBy]);

  const brandsForFilter = useMemo(() => {
    let list = products;
    if (activeSector) list = list.filter((p) => p.sector === activeSector);
    if (activeCategory) list = list.filter((p) => p.category === activeCategory);
    if (activeSub) list = list.filter((p) => p.subcategory === activeSub);
    return [...new Set(list.map((p) => p.brand))].sort();
  }, [products, activeSector, activeCategory, activeSub]);

  const tagFiltersForSidebar = useMemo(() => {
    let base = products;
    if (activeSector) base = base.filter((p) => p.sector === activeSector);
    if (activeCategory) base = base.filter((p) => p.category === activeCategory);
    if (activeSub) base = base.filter((p) => p.subcategory === activeSub);

    return FILTER_ORDER.map((label) => {
      const key = label === 'Marcas' ? 'marca' : Object.entries(FILTER_LABELS).find(([, value]) => value === label)?.[0] ?? label;
      const list = base.filter((p) => Object.entries(activeTagFilters).every(([selectedKey, selectedValue]) => selectedKey === key || p.tags.includes(`${selectedKey}:${selectedValue}`)));
      const values = [...new Set(list.flatMap((p) => p.tags.filter((tag) => tag.startsWith(`${key}:`)).map((tag) => tag.slice(key.length + 1))))].sort();
      return { key, label, values };
    }).filter((group) => group.label !== 'Marcas' && (group.label === 'Faixa de Preço' ? base.length > 0 : group.values.length > 0));
  }, [products, activeSector, activeCategory, activeSub, activeTagFilters, brandsForFilter]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => {
    const p = products.find((x) => x.id === c.productId);
    return s + (p ? p.price * c.qty : 0);
  }, 0);
  const discount = appliedCoupon === COUPON_CODE ? cartTotal * 0.1 : 0;
  const finalTotal = cartTotal - discount;

  const addToCart = useCallback((product: Product, variations: Record<string, string>) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (c) => c.productId === product.id &&
          JSON.stringify(c.variations) === JSON.stringify(variations),
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { productId: product.id, qty: 1, variations }];
    });
    sfx.cart();
    showToast('Adicionado ao carrinho');
  }, [showToast]);

  const toggleFav = useCallback((id: string) => {
    sfx.click();
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (authUser) void toggleFavoritoDb(id);
      return next;
    });
  }, [authUser]);

  const updateQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const q = next[idx].qty + delta;
      if (q <= 0) return next.filter((_, i) => i !== idx);
      next[idx] = { ...next[idx], qty: q };
      return next;
    });
  };

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (code === COUPON_CODE) {
      setAppliedCoupon(code);
      sfx.success();
      showToast('Cupom KORVIL10 aplicado — 10% de desconto');
    } else {
      sfx.error();
      showToast('Cupom inválido');
    }
  };

  const finishCheckout = async (freight: number, deliveryMode: 'entrega' | 'retirar', pixCode?: string, bankUsed?: string) => {
    const items = cart.map((c) => {
      const p = products.find((x) => x.id === c.productId);
      return { name: p?.name ?? 'Item', qty: c.qty, price: p?.price ?? 0 };
    });
    const orderCode = `PED-${Date.now()}`;
    const orderTotal = finalTotal + freight;
    const order: Order = {
      id: orderCode,
      items,
      total: orderTotal,
      date: new Date().toLocaleDateString('pt-BR'),
      coupon: appliedCoupon ?? undefined,
      freight,
      deliveryMode,
    };
    setOrders((prev) => [order, ...prev]);
    if (authUser) {
      await createPedido({
        order_code: orderCode,
        items,
        total: orderTotal,
        freight,
        coupon: appliedCoupon ?? undefined,
        delivery_mode: deliveryMode,
        pix_code: pixCode,
        bank_used: bankUsed,
      });
    }
    if (bankUsed) incrementBankUsage(bankUsed);
    setCart([]);
    setAppliedCoupon(null);
    setCouponInput('');
    setCheckoutOpen(false);
    setBuyNowProduct(null);
    sfx.success();
    setConfetti(true);
    setTimeout(() => setConfetti(false), 3000);
    showToast(`Pedido ${orderCode} criado — aguardando pagamento`);
    setTab('pedidos');
  };

  const clearFilters = () => {
    setActiveSector(null);
    setActiveCategory(null);
    setActiveSub(null);
    setActiveBrand(null);
    setActiveTagFilters({});
    setPriceMin(null);
    setPriceMax(null);
    setSearch('');
    setExpandedSector(null);
    setExpandedCat(null);
  };

  const selectSector = (sId: string) => {
    setActiveSector(sId || null);
    setActiveCategory(null);
    setActiveSub(null);
    setActiveBrand(null);
    setActiveTagFilters({});
    setPriceMin(null);
    setPriceMax(null);
  };

  const toggleTagFilter = (key: string, value: string) => {
    setActiveTagFilters((current) => {
      if (current[key] === value) {
        const next = { ...current };
        delete next[key];
        return next;
      }
      return { ...current, [key]: value };
    });
  };

  const isLojaAdmin = lojaUser?.isAdmin ?? false;
  const isAdminUser = isAdminEmail(authUser?.email);

  return (
    <div className="korvil-loja kl-marketplace-bg fixed inset-0 z-[9998] text-[#222] overflow-y-auto pb-20">
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } } .shimmer { background: linear-gradient(90deg, transparent, rgba(0,245,255,0.04), transparent); background-size: 200% 100%; animation: shimmer 1.5s infinite; } @keyframes confettiFall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } } `}</style>

      {/* Subtle ambient glow */}
      <div className="fixed inset-0 pointer-events-none opacity-0" aria-hidden="true" />

      {/* Confetti */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-[10001]">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#a855f7', '#06b6d4', '#d4af37', '#10b981', '#f59e0b'][i % 5],
                animation: `confettiFall ${1.5 + Math.random()}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header estilo ML — 3 linhas */}
      <header className="sticky top-0 z-30 kl-marketplace-header shadow-sm">
        {/* Linha 1: CEP + sino + carrinho badge */}
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => { sfx.click(); setTab('config'); }}
            className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-[#00f5ff] transition"
          >
            <MapPin size={14} className="text-[#00f5ff]" />
            <span className="font-medium">Enviar para Capital</span>
            <ChevronDown size={12} className="text-zinc-500" />
          </button>

          <div className="flex items-center gap-2">
            {/* Admin badge */}
            {isLojaAdmin && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-md">
                <ShieldCheck size={12} className="text-[#00f5ff]" />
                <span className="text-[9px] font-bold kl-neon-text">ADMIN</span>
              </div>
            )}
            {/* Notifications */}
            <button
              onClick={() => { sfx.click(); setNotifOpen((o) => !o); }}
              className="relative p-1.5 hover:text-[#00f5ff] transition"
              aria-label="Notificações"
            >
              <Bell size={20} className="text-zinc-300" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#141414] border border-[#00f5ff]/20 rounded-xl shadow-2xl shadow-[#00f5ff]/10 z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-[#222] text-xs font-bold text-zinc-300">Notificações</div>
                  {notifications.length === 0 ? (
                    <p className="px-3 py-4 text-xs text-zinc-600 text-center">Nenhuma notificação</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className={`px-3 py-2.5 text-xs border-b border-[#222]/50 ${n.read ? 'text-zinc-500' : 'text-zinc-200'}`}>
                        {n.text}
                      </div>
                    ))
                  )}
                </div>
              )}
            </button>
            {/* Cart */}
            <button
              onClick={() => { sfx.click(); setCartOpen(true); }}
              className="relative p-1.5 hover:text-[#00f5ff] transition"
              aria-label="Carrinho"
            >
              <ShoppingCart size={20} className="text-zinc-300" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#00f5ff] text-black text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 kl-pulse">
                  {cartCount}
                </span>
              )}
            </button>
            {isAdminUser && (
              <button
                onClick={() => { sfx.click(); setEditing('new'); }}
                className="flex items-center gap-1.5 bg-[#00f5ff] text-black text-xs font-bold px-3 py-1.5 rounded-full hover:brightness-110 transition"
              >
                <Plus size={14} />
                Adicionar
              </button>
            )}
            {/* Profile */}
            <button
              onClick={() => { sfx.click(); setAuthModalOpen(true); }}
              className="p-1.5 hover:text-[#00f5ff] transition"
              aria-label={lojaUser ? 'Minha conta' : 'Entrar na conta'}
            >
              <User size={20} className={lojaUser ? 'text-[#00f5ff]' : 'text-zinc-300'} />
            </button>
            {/* Close */}
            <button
              onClick={() => { sfx.click(); onClose(); }}
              className="p-1.5 text-zinc-400 hover:text-red-400 transition"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Linha 2: Busca radius 24px com mic e camera ciano */}
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar produtos, marcas e ofertas..."
                className="w-full bg-white border border-transparent rounded-full pl-10 pr-20 py-3 text-sm text-[#222] placeholder:text-[#737373] focus:border-[#3483fa] focus:outline-none shadow-sm transition"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={() => { sfx.click(); showToast('Busca por voz em breve'); }}
                  className="p-1.5 rounded-full hover:bg-[#00f5ff]/10 transition"
                  aria-label="Busca por voz"
                >
                  <MicIcon size={16} className="text-[#00f5ff]" />
                </button>
                <button
                  onClick={() => { sfx.click(); showToast('Busca por imagem em breve'); }}
                  className="p-1.5 rounded-full hover:bg-[#00f5ff]/10 transition"
                  aria-label="Busca por imagem"
                >
                  <CameraIcon size={16} className="text-[#00f5ff]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Linha 3: Endereço + sort */}
        <div className="flex items-center justify-between px-4 pb-2">
          <button
            onClick={() => { sfx.click(); setTab('config'); }}
            className="flex items-center gap-1 text-[11px] text-white hover:text-[#3483fa] transition truncate"
          >
            <MapPin size={11} className="text-[#00f5ff] shrink-0" />
            <span className="truncate">Jd. Rio da Praia · Capital</span>
            <ChevronDown size={10} className="shrink-0" />
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-transparent text-[11px] text-white focus:outline-none cursor-pointer shrink-0"
          >
            <option value="relevance" className="bg-[#141414]">Relevância</option>
            <option value="price_asc" className="bg-[#141414]">Menor preço</option>
            <option value="price_desc" className="bg-[#141414]">Maior preço</option>
            <option value="rating" className="bg-[#141414]">Melhor avaliados</option>
          </select>
        </div>

        {/* Menu bar horizontal scroll */}
        <nav className="kl-hide-scrollbar flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {([
            { id: 'compras', label: 'Compras', icon: ShoppingBag },
            { id: 'pedidos', label: 'Pedidos', icon: Package },
            { id: 'favoritos', label: 'Favoritos', icon: Heart },
            { id: 'cupom', label: 'Cupom', icon: Tag },
            { id: 'config', label: 'Config', icon: Settings },
          ] as { id: Tab; label: string; icon: typeof ShoppingBag }[]).map((m) => (
            <button
              key={m.id}
              onClick={() => { sfx.click(); setTab(m.id); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                tab === m.id
                  ? 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/30'
                  : 'text-zinc-400 hover:text-[#00f5ff] hover:bg-[#1e1e1e]/60'
              }`}
            >
              <m.icon size={14} /> {m.label}
            </button>
          ))}
        </nav>
      </header>

      {tab === 'compras' && (
        <>
          <nav className="kl-marketplace-scroll flex items-end gap-6 overflow-x-auto border-b border-[#333] bg-black px-4 pt-3 shadow-sm">
            <button onClick={() => { selectSector(''); setActiveCategory(null); setActiveSub(null); }} className={`shrink-0 pb-2 text-sm font-semibold ${!activeSector ? 'border-b-2 border-white text-white' : 'text-[#bdbdbd]'}`}>Tudo</button>
            {SECTORS.map((sector) => (
              <button key={sector.id} onClick={() => selectSector(sector.id)} className={`shrink-0 pb-2 text-sm font-semibold ${activeSector === sector.id ? 'border-b-2 border-[#3483fa] text-[#3483fa]' : 'text-white'}`}>{sector.name}</button>
            ))}
          </nav>
          <div className="mx-4 mt-3 flex items-center justify-between rounded-full bg-black px-4 py-2.5 text-white shadow-sm">
            <span className="text-sm font-bold">KORVIL+ · Assine e ganhe até 20% OFF</span><ChevronRight size={18} />
          </div>
        </>
      )}

      {/* Atalhos horizontais — 8 botões circulares */}
      {tab === 'compras' && !search && !activeSector && (
        <div className="max-w-7xl mx-auto mt-3 px-4">
          <div className="kl-hide-scrollbar flex items-center gap-3 overflow-x-auto pb-1">
            {[
              { label: 'Ofertas', icon: Tag, action: () => { sfx.click(); setTab('cupom'); } },
              { label: 'Pedidos', icon: Package, action: () => { sfx.click(); setTab('pedidos'); } },
              { label: 'Favoritos', icon: Heart, action: () => { sfx.click(); setTab('favoritos'); } },
              { label: 'Frete', icon: Truck, action: () => { sfx.click(); showToast('Frete inteligente ativo'); } },
              { label: 'Pix', icon: Zap, action: () => { sfx.click(); showToast('Pagamento via Pix disponível'); } },
              { label: 'Cupom', icon: Award, action: () => { sfx.click(); setTab('cupom'); } },
              { label: 'Conta', icon: User, action: () => { sfx.click(); setAuthModalOpen(true); } },
              { label: 'Config', icon: Settings, action: () => { sfx.click(); setTab('config'); } },
            ].map((s) => (
              <button
                key={s.label}
                onClick={s.action}
                className="flex flex-col items-center gap-1 shrink-0 group"
              >
                <div className="w-14 h-14 rounded-full bg-[#1e1e1e] border border-[#00f5ff]/30 flex items-center justify-center group-hover:border-[#00f5ff] group-hover:shadow-[0_0_15px_rgba(0,245,255,0.4)] transition-all duration-200">
                  <s.icon size={20} className="text-[#00f5ff]" />
                </div>
                <span className="text-[10px] text-zinc-400 group-hover:text-[#00f5ff] transition font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Banner carrossel — 3 slides com dots ciano */}
      {tab === 'compras' && !search && !activeSector && (
        <div className="relative max-w-7xl mx-auto mt-3 px-4">
          <div className="relative rounded-2xl overflow-hidden h-36 sm:h-48 bg-black border border-[#f0d400]">
            {bannerSlides.map((p, i) => (
              <div
                key={p.id}
                className={`absolute inset-0 flex items-center gap-4 p-4 transition-opacity duration-700 ${i === carouselIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              >
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block text-[9px] font-black bg-[#00f5ff] text-black px-2 py-0.5 rounded mb-1">FULL</span>
                  <p className="text-[10px] kl-neon-text font-semibold">{p.brand}</p>
                  <h3 className="font-bold text-sm sm:text-lg text-[#222] line-clamp-1">{p.name}</h3>
                  <p className="font-black text-lg sm:text-2xl text-white mt-1">{fmtPrice(p.price)}</p>
                  <button
                    onClick={() => { sfx.click(); setSelectedProduct(p); }}
                    className="mt-2 bg-[#00f5ff] hover:bg-[#00d4dd] text-black text-xs font-bold px-3 py-1.5 rounded-full transition shadow-[0_0_12px_rgba(0,245,255,0.4)]"
                  >
                    Ver oferta
                  </button>
                </div>
              </div>
            ))}
            {/* Carousel dots */}
            <div className="absolute bottom-2 right-3 flex gap-1.5">
              {bannerSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIdx(i)}
                  className={`w-2 h-2 rounded-full transition ${i === carouselIdx ? 'bg-[#00f5ff] shadow-[0_0_8px_rgba(0,245,255,0.6)]' : 'bg-zinc-700'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Faixa KORVIL+ */}
      {tab === 'compras' && !search && !activeSector && (
        <div className="max-w-7xl mx-auto mt-3 px-4">
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3 border-l-4 border-[#00f5ff]"
            style={{ background: 'linear-gradient(90deg, #000 0%, #003d42 100%)' }}
          >
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#00f5ff]" />
              <div>
                <p className="text-sm font-black kl-neon-text">KORVIL+</p>
                <p className="text-[10px] text-zinc-400">Frete grátis e cupons exclusivos</p>
              </div>
            </div>
            <button
              onClick={() => { sfx.click(); setTab('cupom'); }}
              className="text-[11px] font-bold text-[#00f5ff] border border-[#00f5ff]/40 rounded-full px-3 py-1 hover:bg-[#00f5ff]/10 transition"
            >
              Ativar
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {tab === 'compras' && (
        <div className="relative flex flex-col lg:flex-row max-w-7xl mx-auto mt-4 gap-3">
          {/* Sidebar Filters */}
          <aside className="kl-marketplace-filter lg:fixed lg:left-3 lg:top-[140px] lg:z-20 lg:w-64 shrink-0 lg:self-start rounded-xl p-3 lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#222]">Filtros</h3>
              {(activeSector || activeBrand || search) && (
                <button onClick={clearFilters} className="text-[11px] kl-neon-text hover:underline">
                  Limpar
                </button>
              )}
            </div>

            {/* Sector tree */}
            <div className="space-y-1">
              {SECTORS.map((s: Sector) => (
                <div key={s.id}>
                  <button
                    onClick={() => { sfx.click(); selectSector(s.id); setExpandedSector(expandedSector === s.id ? null : s.id); setExpandedCat(null); }}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold transition ${
                      activeSector === s.id ? 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20' : 'text-zinc-400 hover:bg-[#1e1e1e]/60 hover:text-[#00f5ff]'
                    }`}
                  >
                    {expandedSector === s.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {s.name}
                  </button>
                  {expandedSector === s.id && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      {s.categories.map((c) => (
                        <div key={c.id}>
                          <button
                            onClick={() => { setActiveCategory(activeCategory === c.id ? null : c.id); setActiveSub(null); setExpandedCat(expandedCat === c.id ? null : c.id); }}
                            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] transition ${
                              activeCategory === c.id ? 'text-[#00f5ff] font-semibold' : 'text-zinc-500 hover:text-[#00f5ff]'
                            }`}
                          >
                            {expandedCat === c.id ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            {c.name}
                          </button>
                          {expandedCat === c.id && (
                            <div className="ml-4 space-y-0.5">
                              {c.subcategories.map((sc) => (
                                <button
                                  key={sc.id}
                                  onClick={() => setActiveSub(activeSub === sc.id ? null : sc.id)}
                                  className={`w-full text-left px-2 py-1 rounded text-[11px] transition ${
                                    activeSub === sc.id ? 'text-[#00f5ff] font-semibold' : 'text-zinc-600 hover:text-[#00f5ff]'
                                  }`}
                                >
                                  {sc.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Brands */}
            {brandsForFilter.length > 1 && (
              <FiltroRecolhivel titulo="Marcas">
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {brandsForFilter.map((b) => (
                    <button
                      key={b}
                      onClick={() => setActiveBrand(activeBrand === b ? null : b)}
                      className={`w-full text-left px-2 py-1 rounded text-[11px] transition ${
                        activeBrand === b ? 'text-[#00f5ff] font-semibold bg-[#00f5ff]/10' : 'text-zinc-500 hover:text-[#00f5ff]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </FiltroRecolhivel>
            )}

            {/* Filtros dinâmicos por tags (Tipos, Tamanhos, Sabores, Cores) */}
            {tagFiltersForSidebar.map((group) => (
              <FiltroRecolhivel key={group.key} titulo={<span>{group.label}</span>}>
                {group.label === 'Faixa de Preço' ? (
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Mínimo" value={priceMin ?? ''} onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : null)} className="w-full rounded-lg border border-[#d5d9dd] bg-white px-2 py-2 text-xs text-[#222] focus:border-[#3483fa] focus:outline-none" />
                    <span className="text-xs text-[#555]">—</span>
                    <input type="number" placeholder="Máximo" value={priceMax ?? ''} onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : null)} className="w-full rounded-lg border border-[#d5d9dd] bg-white px-2 py-2 text-xs text-[#222] focus:border-[#3483fa] focus:outline-none" />
                  </div>
                ) : (
                  <div className="max-h-40 space-y-1 overflow-y-auto">
                    {group.values.map((value) => (
                      <button key={value} onClick={() => toggleTagFilter(group.key, value)} className={`w-full rounded px-2 py-2 text-left text-xs transition ${activeTagFilters[group.key] === value ? 'bg-black font-semibold text-white' : 'text-[#222] hover:bg-[#f1f3f5]'}`}>
                        {value}
                      </button>
                    ))}
                  </div>
                )}
              </FiltroRecolhivel>
            ))}
          </aside>

          {/* Product grid */}
          <div className="flex-1 p-2 sm:ml-72 sm:p-4">
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="relative min-h-[176px] overflow-hidden rounded-xl bg-black p-4 shadow-sm">
                <span className="text-[10px] font-bold text-white">KORVIL OFERTAS</span>
                <h2 className="mt-2 text-xl font-black leading-tight text-white">ATÉ 18X<br />SEM JUROS</h2>
                <p className="mt-3 text-[10px] text-white">Condições especiais na loja</p>
                <div className="absolute bottom-3 right-3 flex gap-1"><span className="h-2 w-2 rounded-full bg-[#222]" /><span className="h-2 w-2 rounded-full bg-white" /><span className="h-2 w-2 rounded-full bg-white" /></div>
              </div>
              <div className="rounded-xl bg-black p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2"><h2 className="text-lg font-black leading-tight text-white">OFERTAS<br />RELÂMPAGO</h2><span className="rounded bg-white px-1.5 py-1 text-[10px] font-bold text-black">02 : 05 : 11</span></div>
                <div className="mt-3 space-y-2">{products.slice(0, 3).map((product) => <div key={product.id} className="flex items-center gap-2 rounded-lg bg-white p-1.5"><img src={product.image} alt="" className="h-12 w-12 rounded object-cover" /><div className="min-w-0"><span className="rounded bg-black px-1 text-[10px] font-bold text-white">20% OFF</span><p className="truncate text-xs font-semibold text-[#222]">{fmtPrice(product.price)}</p></div></div>)}</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-zinc-400">
                {shuffled.length} {shuffled.length === 1 ? 'produto' : 'produtos'}
                {activeSector && ` · ${SECTORS.find((s) => s.id === activeSector)?.name}`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : shuffled.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                <ShoppingBag size={48} className="mb-3" />
                <p className="text-sm">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                {shuffled.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    fav={favs.includes(p.id)}
                    onFav={() => toggleFav(p.id)}
                    onOpen={() => { sfx.click(); setSelectedProduct(p); }}
                    onBuy={() => {
                      const v: Record<string, string> = {};
                      p.variations.forEach((vr) => { v[vr.label] = vr.options[0]; });
                      addToCart(p, v);
                    }}
                    onBuyNow={() => { sfx.click(); setBuyNowProduct(p); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pedidos */}
      {tab === 'pedidos' && (
        <div className="relative max-w-3xl mx-auto p-4 pt-6">
          <h2 className="text-lg font-bold mb-4">
            Meus Pedidos
            {isLojaAdmin && <span className="text-[11px] text-cyan-400 ml-2">(ADMIN — todos os pedidos)</span>}
          </h2>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-zinc-600">
              <Package size={48} className="mb-3" />
              <p className="text-sm">Nenhum pedido ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 backdrop-blur hover:border-cyan-500/30 transition-all duration-300 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{o.id}</span>
                    <span className="text-xs text-zinc-500">{o.date}</span>
                  </div>
                  <div className="space-y-1 mb-2">
                    {o.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-xs text-zinc-400">
                        <span>{it.qty}x {it.name}</span>
                        <span>{fmtPrice(it.price * it.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                    <div className="flex items-center gap-2">
                      {o.coupon && <span className="text-xs text-cyan-400">Cupom {o.coupon}</span>}
                      {o.deliveryMode === 'retirar' && <span className="text-xs text-emerald-400">Retirar no local</span>}
                      {o.freight !== undefined && o.freight > 0 && <span className="text-xs text-zinc-500">Frete {fmtPrice(o.freight)}</span>}
                    </div>
                    <span className="font-bold text-sm">{fmtPrice(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favoritos */}
      {tab === 'favoritos' && (
        <div className="relative max-w-5xl mx-auto p-4 pt-6">
          <h2 className="text-lg font-bold mb-4">Favoritos</h2>
          {favs.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-zinc-600">
              <Heart size={48} className="mb-3" />
              <p className="text-sm">Nenhum favorito ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {favs
                .map((id) => products.find((p) => p.id === id))
                .filter(Boolean)
                .map((p) => (
                  <ProductCard
                    key={p!.id}
                    product={p!}
                    fav
                    onFav={() => toggleFav(p!.id)}
                    onOpen={() => { sfx.click(); setSelectedProduct(p!); }}
                    onBuy={() => {
                      const v: Record<string, string> = {};
                      p!.variations.forEach((vr) => { v[vr.label] = vr.options[0]; });
                      addToCart(p!, v);
                    }}
                    onBuyNow={() => { sfx.click(); setBuyNowProduct(p!); }}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Cupom */}
      {tab === 'cupom' && (
        <div className="relative max-w-md mx-auto p-4 pt-10">
          <div className="bg-gray-900/50 border border-cyan-500/20 rounded-2xl p-6 text-center backdrop-blur shadow-xl shadow-cyan-500/5">
            <Tag size={40} className="text-cyan-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold mb-1">Cupom de Desconto</h2>
            <p className="text-zinc-500 text-xs mb-4">Digite seu cupom para ganhar desconto no carrinho</p>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="KORVIL10"
                className="flex-1 bg-black border border-gray-800 rounded-xl px-3 py-2.5 text-sm uppercase focus:border-cyan-500/50 focus:outline-none"
              />
              <button
                onClick={applyCoupon}
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-bold text-sm px-4 rounded-full hover:from-cyan-400 hover:to-cyan-500 transition shadow-glow-cyan"
              >
                Aplicar
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 text-sm">
                <Check size={16} /> Cupom {appliedCoupon} ativo — 10% off
              </div>
            )}
            <p className="text-zinc-600 text-[11px] mt-4">Dica: use o cupom <strong className="text-cyan-400">KORVIL10</strong></p>
          </div>
        </div>
      )}

      {/* Config */}
      {tab === 'config' && (
        <div className="relative max-w-md mx-auto p-4 pt-10">
          <div className="bg-gray-900/50 border border-cyan-500/20 rounded-2xl p-6 backdrop-blur shadow-xl shadow-cyan-500/5">
            <Settings size={32} className="text-cyan-500 mb-3" />
            <h2 className="text-lg font-bold mb-4">Configurações</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-zinc-400">Notificações de pedidos</span>
                <span className="text-cyan-400">Ativado</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-zinc-400">Vendedor padrão</span>
                <span className="text-zinc-300">Korvil Store</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-zinc-400">Conta</span>
                <span className={isLojaAdmin ? 'text-cyan-400 font-bold' : 'text-zinc-300'}>
                  {isLojaAdmin ? 'ADMIN' : 'Comum'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-400">Versão</span>
                <span className="text-zinc-500">v-2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <LojaProductForm
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setProducts((prev) => (prev.some((x) => x.id === saved.id) ? prev.map((x) => (x.id === saved.id ? saved : x)) : [...prev, saved]));
            setSelectedProduct((cur) => (cur?.id === saved.id ? saved : cur));
            setEditing(null);
            showToast('Produto salvo');
          }}
        />
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          isAdmin={isAdminUser}
          onEdit={() => setEditing(selectedProduct)}
          fav={favs.includes(selectedProduct.id)}
          onFav={() => toggleFav(selectedProduct.id)}
          onAdd={(v) => {
            addToCart(selectedProduct, v);
          }}
          onBuyNow={(v) => {
            addToCart(selectedProduct, v);
            setSelectedProduct(null);
            setBuyNowProduct(selectedProduct);
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          products={products}
          total={cartTotal}
          discount={discount}
          finalTotal={finalTotal}
          coupon={appliedCoupon}
          onClose={() => setCartOpen(false)}
          onQty={updateQty}
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        />
      )}

      {/* Checkout Modal (from cart) */}
      {checkoutOpen && (
        <CheckoutModal
          total={finalTotal}
          coupon={appliedCoupon}
          onClose={() => setCheckoutOpen(false)}
          onConfirm={finishCheckout}
        />
      )}

      {/* Buy Now Checkout (direct from product) */}
      {buyNowProduct && (
        <CheckoutModal
          total={buyNowProduct.price}
          coupon={null}
          onClose={() => setBuyNowProduct(null)}
          onConfirm={async (_freight, _mode, _pix, _bank) => {
            const items = [{ name: buyNowProduct.name, qty: 1, price: buyNowProduct.price }];
            const orderCode = `PED-${Date.now()}`;
            const orderTotal = buyNowProduct.price + _freight;
            const order: Order = {
              id: orderCode,
              items,
              total: orderTotal,
              date: new Date().toLocaleDateString('pt-BR'),
              freight: _freight,
              deliveryMode: _mode,
            };
            setOrders((prev) => [order, ...prev]);
            if (authUser) {
              await createPedido({
                order_code: orderCode,
                items,
                total: orderTotal,
                freight: _freight,
                delivery_mode: _mode,
                pix_code: _pix,
                bank_used: _bank,
              });
            }
            if (_bank) incrementBankUsage(_bank);
            setBuyNowProduct(null);
            sfx.success();
            setConfetti(true);
            setTimeout(() => setConfetti(false), 3000);
            showToast(`Pedido ${orderCode} criado`);
            setTab('pedidos');
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-semibold text-sm px-5 py-2.5 rounded-full shadow-xl shadow-cyan-500/30">
          {toast}
        </div>
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[10002] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={() => setAuthModalOpen(false)}>
          <div className="bg-gray-900/90 border border-cyan-500/20 rounded-3xl max-w-sm w-full p-6 backdrop-blur-xl shadow-2xl shadow-cyan-500/10" onClick={(e) => e.stopPropagation()}>
            {authUser ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                  {authProfile?.avatar_url ? (
                    <img src={authProfile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User size={28} className="text-cyan-400" />
                  )}
                </div>
                <h3 className="font-bold text-lg text-white mb-1">{authProfile?.full_name ?? authUser.email}</h3>
                <p className="text-xs text-zinc-500 mb-4">{authUser.email}</p>
                <button
                  onClick={() => { setAuthModalOpen(false); setTab('pedidos'); }}
                  className="w-full bg-gray-800 text-white font-semibold text-sm py-3 rounded-xl hover:bg-gray-700 transition mb-2 border border-cyan-500/10"
                >
                  Meus Pedidos
                </button>
                <button
                  onClick={async () => { await signOut(); setAuthUser(null); setAuthProfile(null); setAuthModalOpen(false); sfx.click(); }}
                  className="w-full text-red-400 font-semibold text-sm py-2.5 hover:text-red-300 transition"
                >
                  Sair
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-lg text-white mb-4 text-center">
                  {authMode === 'login' ? 'Entrar na Korvil' : 'Criar conta'}
                </h3>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Senha"
                    value={authPass}
                    onChange={(e) => setAuthPass(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
                  />
                  {authError && <p className="text-xs text-red-400">{authError}</p>}
                  <button
                    onClick={async () => {
                      setAuthLoading(true);
                      setAuthError(null);
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
                        }
                        setAuthModalOpen(false);
                        sfx.success();
                      } catch (e) {
                        setAuthError(e instanceof Error ? e.message : 'Erro ao autenticar');
                        sfx.error();
                      } finally {
                        setAuthLoading(false);
                      }
                    }}
                    disabled={authLoading || !authEmail || !authPass}
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold text-sm py-3 rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-2 shadow-glow-cyan"
                  >
                    {authLoading ? 'Aguarde...' : authMode === 'login' ? 'Entrar' : 'Criar conta'}
                  </button>
                  <button
                    onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(null); }}
                    className="w-full text-zinc-400 text-xs hover:text-white transition"
                  >
                    {authMode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav — 5 tabs fixo estilo ML */}
      <nav className="fixed bottom-0 left-0 right-0 z-[9999] kl-marketplace-bottom flex items-center justify-around px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-2px_8px_rgba(0,0,0,.06)]">
        {([
          { id: 'compras' as Tab, label: 'Início', icon: HomeIcon },
          { id: null, label: 'Buscar', icon: Search, action: () => { const el = document.querySelector<HTMLInputElement>('input[placeholder*="Buscar"]'); el?.focus(); } },
          { id: null, label: 'Vender', icon: PlusCircle, action: () => { sfx.click(); showToast('Vender — em breve'); }, highlight: true },
          { id: null, label: 'Carrinho', icon: ShoppingCart, badge: cartCount, action: () => setCartOpen(true) },
          { id: 'config' as Tab, label: 'Conta', icon: User },
        ]).map((item, idx) => {
          const active = item.id !== null && tab === item.id;
          return (
            <button
              key={idx}
              onClick={() => { sfx.click(); if (item.action) item.action(); else if (item.id) setTab(item.id); }}
              className={`relative flex flex-col items-center gap-0.5 px-2 py-1 transition ${active ? 'text-[#3483fa]' : 'text-black hover:text-[#3483fa]'}`}
            >
              {item.highlight ? (
                <div className="w-8 h-8 rounded-full bg-[#00f5ff] flex items-center justify-center shadow-[0_0_12px_rgba(0,245,255,0.4)]">
                  <item.icon size={18} className="text-black" />
                </div>
              ) : (
                <item.icon size={20} />
              )}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-0 right-0 bg-[#00f5ff] text-black text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {item.badge}
                </span>
              )}
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* K-AI floating button inside Loja */}
      <KAIButton />
    </div>
  );
}

/* --- K-AI floating button for Loja --- */
function LojaKAI({ isAdmin: admin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'kai'; text: string }[]>([]);

  const respond = async (text: string) => {
    setMessages((prev) => [...prev, { role: 'user' as const, text }]);
    setInput('');
    setAiLoading(true);
    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role === 'kai' ? 'assistant' : m.role,
        content: m.text,
      }));
      const r = await askKorvilAI(text, { setor: 'loja', history });
      setMessages((prev) => [...prev, { role: 'kai' as const, text: r.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'kai' as const, text: 'Não consegui responder agora. Tente novamente.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed z-[10001] w-[300px] sm:w-[340px] bg-zinc-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden flex flex-col"
          style={{ right: '16px', bottom: '180px', maxHeight: '440px' }}
        >
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-3 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#2a2a2e] flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-[10px]">K-AI</span>
              </div>
              <span className="text-white font-bold text-sm">K-AI Loja</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[140px]">
            {messages.length === 0 && (
              <p className="text-zinc-500 text-xs text-center py-4">
                Olá! Sou a K-AI da loja. Pergunte sobre produtos, preços, frete, cupons...
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-cyan-600 text-black' : 'bg-gray-800 text-zinc-100'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl px-3 py-2 text-sm text-zinc-400 animate-pulse">K-AI pensando...</div>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-800">
            <div className="flex gap-1.5">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && input.trim() && !aiLoading) { respond(input); } }}
                placeholder="Pergunte sobre a loja..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
              />
              <button
                onClick={() => { if (input.trim() && !aiLoading) { respond(input); } }}
                disabled={aiLoading}
                className="bg-cyan-500 text-black font-bold text-xs px-3 rounded-lg disabled:opacity-40"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed z-[10000] w-[72px] h-[72px] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          style={{
            right: '16px',
            bottom: '90px',
            background: 'radial-gradient(circle, #2a2a2e 0%, #1e1e22 55%, #16161a 100%)',
            boxShadow: '0 0 20px rgba(42,42,46,0.8), 0 0 40px rgba(0,245,255,0.15)',
          }}
          aria-label="K-AI Loja"
        >
          <span className="text-cyan-400 font-bold text-xs">K-AI</span>
        </button>
      )}
    </>
  );
}

function ProductCard({
  product: p, fav, onFav, onOpen, onBuy, onBuyNow,
}: {
  product: Product;
  fav: boolean;
  onFav: () => void;
  onOpen: () => void;
  onBuy: () => void;
  onBuyNow: () => void;
}) {
  const discount = 20;
  const oldPrice = p.price / (1 - discount / 100);

  return (
    <article className="kl-marketplace-card group rounded-xl overflow-hidden transition-shadow hover:shadow-md flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-[#f5f5f5] cursor-pointer" onClick={onOpen}>
        <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <span className="w-fit rounded bg-black px-1.5 py-0.5 text-[10px] font-bold text-white">{discount}% OFF</span>
          <span className="w-fit rounded bg-[#3483fa] px-1.5 py-0.5 text-[10px] font-bold text-white">NOVO</span>
        </div>
        <div className="absolute bottom-2 left-2 flex gap-1"><span className="rounded bg-black px-1.5 py-1 text-[10px] font-semibold text-white">02:05:11</span><span className="rounded bg-black px-1.5 py-1 text-[10px] font-semibold text-white">GANHE $</span></div>
        <button onClick={(e) => { e.stopPropagation(); onBuy(); }} className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md hover:bg-[#f2f6ff] transition" aria-label="Adicionar ao carrinho">
          <ShoppingCart size={18} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onFav(); }} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm" aria-label="Favoritar">
          <Heart size={15} className={fav ? 'fill-[#3483fa] text-[#3483fa]' : 'text-[#666]'} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="mb-1 text-[10px] font-semibold text-[#3483fa]">{p.brand}</p>
        <h4 className="mb-2 line-clamp-2 min-h-[32px] cursor-pointer text-sm leading-tight text-[#333]" onClick={onOpen}>{p.name}</h4>
        <div className="mb-1 flex items-center gap-1 text-[11px]">
          <span className="rounded bg-black px-1 py-0.5 font-bold text-white">{discount}% OFF</span>
          <span className="text-[#888] line-through">{fmtPrice(oldPrice)}</span>
        </div>
        <div className="flex items-end justify-between gap-1">
          <span className="text-xl font-semibold text-[#222]">{fmtPrice(p.price)}</span>
          <span className="text-[11px] text-[#555]">+100 vendidos</span>
        </div>
        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#00a650]"><Truck size={13} /> Grátis <span className="font-black">FULL</span></p>
        <p className="mt-1 text-xs text-[#777]">ou rápido amanhã</p>
        <button onClick={onBuyNow} className="mt-3 w-full rounded-lg bg-[#3483fa] py-2 text-xs font-bold text-white transition hover:bg-[#2968c8]">Comprar agora</button>
      </div>
    </article>
  );
}

function ProductGallery({ images, video, name }: { images: string[]; video: string | null; name: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const mediaCount = images.length + (video ? 1 : 0);

  return (
    <div>
      {/* Main display */}
      <div className="w-full h-64 sm:h-80 bg-[#141414] rounded-t-3xl overflow-hidden relative flex items-center justify-center">
        {showVideo && video ? (
          <video
            src={video}
            controls
            autoPlay
            className="w-full h-full object-cover"
            poster={images[0]}
          />
        ) : (
          <img src={images[activeIdx] ?? images[0]} alt={name} className="w-full h-full object-cover" />
        )}
      </div>
      {/* Thumbnails */}
      <div className="flex gap-2 p-2 bg-[#0a0a0a] border-t border-[#222] overflow-x-auto kl-hide-scrollbar">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => { setActiveIdx(i); setShowVideo(false); }}
            className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
              !showVideo && activeIdx === i ? 'border-[#00f5ff]' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
        {video && (
          <button
            onClick={() => setShowVideo(true)}
            className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 flex items-center justify-center bg-black/80 transition ${
              showVideo ? 'border-[#00f5ff]' : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <PlayIcon size={18} className="text-[#00f5ff]" fill="#00f5ff" />
          </button>
        )}
        <span className="text-[10px] text-zinc-500 self-center ml-1">{mediaCount} mídias</span>
      </div>
    </div>
  );
}

function ProductDetail({
  product: p, fav, onFav, onAdd, onBuyNow, onClose, isAdmin, onEdit,
}: {
  product: Product;
  isAdmin: boolean;
  onEdit: () => void;
  fav: boolean;
  onFav: () => void;
  onAdd: (v: Record<string, string>) => void;
  onBuyNow: (v: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [variations, setVariations] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    p.variations.forEach((vr) => { v[vr.label] = vr.options[0]; });
    return v;
  });
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState<Avaliacao[]>([]);
  const [questions, setQuestions] = useState<Pergunta[]>([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newQuestion, setNewQuestion] = useState('');
  const [tab, setTab] = useState<'desc' | 'reviews' | 'questions'>('desc');

  useEffect(() => {
    getAvaliacoes(p.id).then(setReviews);
    getPerguntas(p.id).then(setQuestions);
  }, [p.id]);

  const handleShare = () => {
    const url = window.location.href;
    const shareData = { title: p.name, text: `${p.name} — ${fmtPrice(p.price)} na Korvil Loja`, url };
    if (navigator.share) {
      void navigator.share(shareData);
    } else {
      void navigator.clipboard?.writeText(`${p.name} - ${url}`);
    }
  };

  const submitReview = async () => {
    if (!newReview.trim()) return;
    const ok = await addAvaliacao(p.id, newRating, newReview.trim());
    if (ok) {
      setReviews((prev) => [{ id: Date.now().toString(), product_id: p.id, rating: newRating, comment: newReview.trim(), user_name: 'Você', created_at: new Date().toISOString() }, ...prev]);
      setNewReview('');
      sfx.success();
    }
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return;
    const ok = await addPergunta(p.id, newQuestion.trim());
    if (ok) {
      setQuestions((prev) => [{ id: Date.now().toString(), product_id: p.id, question: newQuestion.trim(), answer: null, user_name: 'Você', answered: false, created_at: new Date().toISOString() }, ...prev]);
      setNewQuestion('');
      sfx.click();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-900/90 border border-cyan-500/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Gallery: front / back / video */}
          <ProductGallery images={p.images} video={p.video} name={p.name} />
          {isAdmin && (
            <button
              onClick={onEdit}
              className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur text-[#00f5ff] p-2 rounded-full hover:bg-black/80 transition"
              aria-label="Editar produto"
            >
              <Pencil size={18} />
            </button>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition z-10"
          >
            <X size={18} className="text-white" />
          </button>
          <button
            onClick={onFav}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition z-10"
          >
            <Heart size={18} className={fav ? 'fill-[#00f5ff] text-[#00f5ff]' : 'text-white'} />
          </button>
          <button
            onClick={handleShare}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition z-10"
            aria-label="Compartilhar"
          >
            <Share2 size={16} className="text-white" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-cyan-400 font-semibold mb-1">{p.brand}</p>
          <h2 className="text-xl font-black text-white mb-2">{p.name}</h2>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} className={i <= Math.round(p.rating) ? 'fill-cyan-500 text-cyan-500' : 'text-zinc-700'} />
              ))}
            </div>
            <span className="text-xs text-zinc-400">{p.rating} · {p.reviews} avaliações</span>
          </div>

          <p className="text-sm text-zinc-400 mb-4">{p.description}</p>

          {p.variations.map((vr) => (
            <div key={vr.label} className="mb-3">
              <p className="text-xs font-semibold text-zinc-300 mb-1.5">{vr.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {vr.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setVariations((prev) => ({ ...prev, [vr.label]: opt }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      variations[vr.label] === opt
                        ? 'bg-cyan-500 text-black'
                        : 'bg-gray-800 text-zinc-300 hover:bg-gray-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-end gap-2 mb-1">
            <span className="font-black text-2xl text-white">{fmtPrice(p.price)}</span>
          </div>
          <p className="text-sm text-zinc-400 mb-1">{p.installment} sem juros</p>
          <div className="flex items-center gap-1.5 mb-4">
            <Truck size={14} className="text-emerald-500" />
            <span className="text-xs text-emerald-500 font-semibold">{p.shipping}</span>
          </div>

          {/* Qty + 2 buttons */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-2 py-1.5">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-1 hover:text-cyan-400 transition">
                <Minus size={16} />
              </button>
              <span className="font-bold text-sm w-6 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-1 hover:text-cyan-400 transition">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => { for (let i = 0; i < qty; i++) onAdd(variations); }}
              className="flex-1 border border-cyan-500/40 text-cyan-300 font-bold text-sm py-3 rounded-xl transition hover:bg-cyan-500/10 hover:border-cyan-500/60 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} /> Adicionar ao carrinho
            </button>
          </div>

          {/* Comprar agora */}
          <button
            onClick={() => { for (let i = 0; i < qty; i++) onAdd(variations); onBuyNow(variations); }}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-bold text-sm py-3 rounded-xl transition hover:from-cyan-400 hover:to-cyan-500 flex items-center justify-center gap-2 mb-4 shadow-glow-cyan"
          >
            <Zap size={18} /> Comprar agora
          </button>

          {/* Tabs: descricao / avaliacoes / perguntas */}
          <div className="flex gap-2 border-b border-gray-800 mb-3">
            {([
              { id: 'desc', label: 'Descrição' },
              { id: 'reviews', label: `Avaliações (${reviews.length})` },
              { id: 'questions', label: `Perguntas (${questions.length})` },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-2 text-xs font-semibold transition border-b-2 ${
                  tab === t.id ? 'text-cyan-300 border-cyan-500' : 'text-zinc-500 border-transparent hover:text-cyan-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'desc' && (
            <div className="text-sm text-zinc-400 space-y-2">
              <p>{p.description}</p>
              <div className="pt-3 border-t border-gray-800 flex items-center gap-2 text-xs">
                <span>Vendedor: <strong className="text-zinc-300">{p.seller}</strong></span>
                <span className="text-emerald-400 flex items-center gap-1"><ShieldCheck size={12} /> Reputação Korvil</span>
              </div>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="space-y-3">
              <div className="bg-gray-800/50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} onClick={() => setNewRating(i)}>
                      <Star size={18} className={i <= newRating ? 'fill-cyan-500 text-cyan-500' : 'text-zinc-600'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="Escreva sua avaliação..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none resize-none"
                  rows={2}
                />
                <button
                  onClick={submitReview}
                  disabled={!newReview.trim()}
                  className="mt-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-40 shadow-glow-cyan"
                >
                  Enviar avaliação
                </button>
              </div>
              {reviews.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-4">Nenhuma avaliação ainda. Seja o primeiro!</p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="bg-gray-800/30 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} size={10} className={i <= r.rating ? 'fill-cyan-500 text-cyan-500' : 'text-zinc-700'} />
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-500">{r.user_name ?? 'Anônimo'}</span>
                    </div>
                    <p className="text-xs text-zinc-300">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'questions' && (
            <div className="space-y-3">
              <div className="bg-gray-800/50 rounded-xl p-3">
                <input
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Faça uma pergunta sobre este produto..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
                />
                <button
                  onClick={submitQuestion}
                  disabled={!newQuestion.trim()}
                  className="mt-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-40 shadow-glow-cyan"
                >
                  Enviar pergunta
                </button>
              </div>
              {questions.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-4">Nenhuma pergunta ainda.</p>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="bg-gray-800/30 rounded-xl p-3">
                    <p className="text-xs text-zinc-200 font-semibold">P: {q.question}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{q.user_name ?? 'Anônimo'}</p>
                    {q.answer && (
                      <p className="text-xs text-zinc-400 mt-2 pl-3 border-l-2 border-cyan-500/30">R: {q.answer}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-xs text-zinc-500">
            <span>Vendedor: <strong className="text-zinc-300">{p.seller}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  cart, products, total, discount, finalTotal, coupon,
  onClose, onQty, onCheckout,
}: {
  cart: CartItem[];
  products: Product[];
  total: number;
  discount: number;
  finalTotal: number;
  coupon: string | null;
  onClose: () => void;
  onQty: (idx: number, delta: number) => void;
  onCheckout: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      <div
        className="relative w-full max-w-md bg-black border-l border-cyan-500/20 h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShoppingCart size={18} className="text-cyan-400" /> Carrinho ({cart.length})
          </h3>
          <button onClick={onClose} className="p-1.5 hover:text-cyan-400 transition">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-zinc-600">
              <ShoppingCart size={40} className="mb-3" />
              <p className="text-sm">Carrinho vazio</p>
            </div>
          ) : (
            cart.map((c, idx) => {
              const p = products.find((x) => x.id === c.productId);
              if (!p) return null;
              return (
                <div key={idx} className="flex gap-3 bg-gray-900/50 border border-gray-800 rounded-xl p-3 backdrop-blur hover:border-cyan-500/30 transition">
                  <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-cyan-400 font-semibold">{p.brand}</p>
                    <h4 className="text-xs font-semibold text-white line-clamp-2 mb-1">{p.name}</h4>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {Object.entries(c.variations).map(([k, v]) => (
                        <span key={k} className="text-[9px] bg-gray-800 text-zinc-400 px-1.5 py-0.5 rounded">{v}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-gray-800 rounded-lg px-1.5 py-1">
                        <button onClick={() => onQty(idx, -1)} className="p-0.5 hover:text-cyan-400">
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{c.qty}</span>
                        <button onClick={() => onQty(idx, 1)} className="p-0.5 hover:text-cyan-400">
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-bold text-sm">{fmtPrice(p.price * c.qty)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-cyan-500/20 p-4 space-y-2">
            {discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-400">
                <span>Desconto ({coupon})</span>
                <span>-{fmtPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Subtotal (frete no checkout)</span>
              <span className="font-black text-lg">{fmtPrice(finalTotal)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold text-sm py-3 rounded-xl transition shadow-glow-cyan"
            >
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutModal({
  total, coupon, onClose, onConfirm,
}: {
  total: number;
  coupon: string | null;
  onClose: () => void;
  onConfirm: (freight: number, deliveryMode: 'entrega' | 'retirar', pixCode?: string, bankUsed?: string) => void;
}) {
  const [deliveryMode, setDeliveryMode] = useState<'entrega' | 'retirar'>('entrega');
  const [endereco, setEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [bairro, setBairro] = useState('');
  const [freight, setFreight] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState<'cartao' | 'pix' | 'boleto'>('pix');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankSearch, setBankSearch] = useState('');
  const [paid, setPaid] = useState(false);
  const [waitingPayment, setWaitingPayment] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  useEffect(() => {
    if (deliveryMode === 'retirar') {
      setFreight(0);
      return;
    }
    if (bairro.trim()) {
      const result = getFreteByBairro(bairro);
      setFreight(result.clientePaga);
    } else if (cep.trim()) {
      const result = getFreteByBairro(cep);
      setFreight(result.clientePaga);
    } else {
      setFreight(null);
    }
  }, [bairro, cep, deliveryMode]);

  const grandTotal = total + (freight ?? 0);
  const pixCode = generatePixCode(grandTotal);

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
    sfx.click();
    void copyToClipboard(pixCode).then(() => {
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 2000);
    });
    const start = Date.now();
    window.location.href = bank.deeplink;
    setTimeout(() => {
      if (Date.now() - start < 1500) {
        window.open(bank.fallback, '_blank');
      }
    }, 1500);
  };

  // Auto-verifica pagamento quando a aba volta ao foco
  useEffect(() => {
    if (!waitingPayment) return;
    const checkFocus = () => {
      if (!document.hidden) {
        setWaitingPayment(false);
        setPaid(true);
        sfx.success();
        setTimeout(() => {
          onConfirm(freight ?? 0, deliveryMode, pixCode, selectedBank ?? undefined);
        }, 1500);
      }
    };
    document.addEventListener('visibilitychange', checkFocus);
    window.addEventListener('focus', checkFocus);
    return () => {
      document.removeEventListener('visibilitychange', checkFocus);
      window.removeEventListener('focus', checkFocus);
    };
  }, [waitingPayment, freight, deliveryMode, pixCode, selectedBank, onConfirm]);

  const handleConfirm = () => {
    setWaitingPayment(true);
    sfx.click();
  };

  const handleAlreadyPaid = () => {
    setWaitingPayment(false);
    setPaid(true);
    sfx.success();
    setTimeout(() => {
      onConfirm(freight ?? 0, deliveryMode, pixCode, selectedBank ?? undefined);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-900/90 border border-cyan-500/20 rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 backdrop-blur-xl shadow-2xl shadow-cyan-500/10"
        onClick={(e) => e.stopPropagation()}
      >
        {paid ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-emerald-400" />
            </div>
            <h3 className="font-bold text-lg text-white mb-1">Pagamento confirmado!</h3>
            <p className="text-zinc-400 text-sm">PIX copia e cola enviado</p>
            <p className="text-zinc-500 text-xs mt-2">Transferência para {PIX_KEY} (Neon)</p>
          </div>
        ) : waitingPayment ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock size={32} className="text-cyan-400" />
            </div>
            <h3 className="font-bold text-lg text-white mb-1">Aguardando pagamento PIX</h3>
            <p className="text-zinc-400 text-sm mb-1">Pague {fmtPrice(grandTotal)} via PIX</p>
            <p className="text-zinc-500 text-xs mb-4">Chave: {PIX_KEY} (Neon)</p>
            <button
              onClick={handleAlreadyPaid}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Check size={18} /> Já paguei, verificar
            </button>
            <button
              onClick={() => setWaitingPayment(false)}
              className="w-full mt-2 text-zinc-400 text-xs py-2 hover:text-white transition"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Checkout</h3>
              <button onClick={onClose} className="p-1.5 hover:text-cyan-400">
                <X size={18} />
              </button>
            </div>

            {/* Entrega ou Retirar */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-zinc-300 mb-2">Opção de entrega</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { sfx.click(); setDeliveryMode('entrega'); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition border ${
                    deliveryMode === 'entrega' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' : 'bg-gray-800 text-zinc-400 border-gray-700'
                  }`}
                >
                  <Truck size={14} /> Entrega
                </button>
                <button
                  onClick={() => { sfx.click(); setDeliveryMode('retirar'); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition border ${
                    deliveryMode === 'retirar' ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' : 'bg-gray-800 text-zinc-400 border-gray-700'
                  }`}
                >
                  <MapPin size={14} /> Retirar no local
                </button>
              </div>
              {deliveryMode === 'retirar' && (
                <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                  <Check size={12} /> Grátis — Jd. Rio da Praia
                </p>
              )}
            </div>

            {/* Endereço */}
            {deliveryMode === 'entrega' && (
              <div className="space-y-2 mb-4">
                <input
                  placeholder="Endereço de entrega"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="CEP"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    className="bg-black border border-gray-800 rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none"
                  />
                  <input
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="bg-black border border-gray-800 rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Pagamento */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-zinc-300 mb-2">Forma de pagamento</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: 'pix', label: 'Pix' },
                  { id: 'cartao', label: 'Cartão' },
                  { id: 'boleto', label: 'Boleto' },
                ] as const).map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => { sfx.click(); setPayMethod(pm.id); }}
                    className={`px-2 py-2 rounded-xl text-xs font-semibold transition border ${
                      payMethod === pm.id ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' : 'bg-gray-800 text-zinc-400 border-gray-700'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PIX */}
            {payMethod === 'pix' && (
              <div className="mb-4 bg-black border border-gray-800 rounded-xl p-4">
                <p className="text-xs text-zinc-400 mb-2">Pague via Pix para:</p>
                <p className="text-sm font-bold text-white mb-1">{PIX_KEY}</p>
                <p className="text-[10px] text-zinc-500 mb-3">Banco Neon · Valor: {fmtPrice(grandTotal)}</p>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    readOnly
                    value={pixCode}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-[10px] text-zinc-400"
                  />
                  <button
                    onClick={() => { void copyToClipboard(pixCode).then(() => { setPixCopied(true); sfx.click(); setTimeout(() => setPixCopied(false), 2000); }); }}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                  >
                    <Copy size={14} className="text-zinc-300" />
                  </button>
                </div>
                {pixCopied && <p className="text-[10px] text-emerald-400 mb-2">Codigo PIX copiado!</p>}
                <div className="w-32 h-32 mx-auto bg-white rounded-lg flex items-center justify-center p-2">
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2ZmZiIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZmIi8+PC9zdmc+')] bg-contain bg-no-repeat bg-center" />
                </div>
                <p className="text-center text-[10px] text-zinc-500 mt-2">QR Code Pix copia e cola</p>
              </div>
            )}

            {/* Cartão fields */}
            {payMethod === 'cartao' && (
              <div className="space-y-2 mb-4">
                <div className="flex gap-1.5">
                  {['Visa', 'Master', 'Elo'].map((c) => (
                    <span key={c} className="text-[10px] bg-gray-800 text-zinc-400 px-2 py-1 rounded">{c}</span>
                  ))}
                </div>
                <input placeholder="Número do cartão" className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Validade" className="bg-black border border-gray-800 rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none" />
                  <input placeholder="CVV" className="bg-black border border-gray-800 rounded-xl px-3 py-2.5 text-sm focus:border-cyan-500/50 focus:outline-none" />
                </div>
              </div>
            )}

            {/* Bancos com busca */}
            {payMethod !== 'boleto' && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1">
                  <Building2 size={12} /> Pagar pelo banco
                </p>
                <input
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Digite seu banco (ex: Nubank, Itau...)"
                  className="w-full bg-black border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none mb-2"
                />
                {mostUsedBanks.length > 0 && !bankSearch && (
                  <div className="mb-2">
                    <p className="text-[10px] text-cyan-400 font-semibold mb-1">Mais usados</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {mostUsedBanks.slice(0, 4).map((b) => (
                        <button
                          key={b.name}
                          onClick={() => openBankApp(b)}
                          className={`px-1 py-2 rounded-lg text-[9px] font-semibold transition border ${
                            selectedBank === b.name ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' : 'bg-gray-800 text-zinc-400 border-gray-700 hover:border-cyan-500/30'
                          }`}
                        >
                          {b.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-zinc-500 font-semibold mb-1">Todos os bancos</p>
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto">
                  {filteredBanks.map((b) => (
                    <button
                      key={b.name}
                      onClick={() => openBankApp(b)}
                      className={`px-1 py-2 rounded-lg text-[9px] font-semibold transition border ${
                        selectedBank === b.name ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' : 'bg-gray-800 text-zinc-400 border-gray-700 hover:border-cyan-500/30'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
                {selectedBank && (
                  <p className="text-[10px] text-emerald-400 mt-1">
                    {selectedBank} selecionado{pixCopied ? ' — PIX copiado!' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Resumo */}
            <div className="bg-black border border-gray-800 rounded-xl p-3 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">Subtotal</span>
                <span>{fmtPrice(total)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-xs text-emerald-400 mb-1">
                  <span>Cupom {coupon}</span>
                  <span>10% off</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Frete</span>
                <span className={freight === 0 ? 'text-emerald-400' : 'text-white'}>
                  {freight === null ? 'Calcule no endereço' : freight === 0 ? 'Grátis' : fmtPrice(freight)}
                </span>
              </div>
              <div className="flex justify-between font-black text-lg pt-2 border-t border-gray-800 mt-2">
                <span>Total</span>
                <span>{fmtPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={freight === null && deliveryMode === 'entrega'}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-glow-cyan"
            >
              <Check size={18} /> Pagar via PIX
            </button>
            <p className="text-center text-zinc-600 text-[10px] mt-3">Pagamento real via PIX para {PIX_KEY}</p>
            <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-zinc-600">
              <ShieldCheck size={10} /> Compra protegida · Garantia 7 dias
            </div>
          </>
        )}
      </div>
    </div>
  );
}
