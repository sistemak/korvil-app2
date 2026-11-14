/* K-OMFOME Delivery — iFood clone inside the Korvil ecosystem.
   Same dark glass CSS as KorvilLoja. Mobile-first.
   Restaurants list -> menu -> cart bottom sheet -> checkout with PIX + BANKS. */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X, Search, ShoppingCart, Star, Clock, MapPin, ChevronRight,
  Plus, Minus, Truck, Check, Copy, Filter, Zap, UserCircle,
  ShieldCheck, Building2, Bell,
} from 'lucide-react';
import { supabase, getSessionUser, signIn, signUpAccount, signOut } from '@/lib/korvilAuth';
import { generatePixCode, copyToClipboard, PIX_KEY } from '@/lib/pixCode';
import { getBankUsage, incrementBankUsage, getSortedBanks } from '@/lib/lojaMarketplace';

interface Restaurante {
  id: string;
  nome: string;
  logo_url: string | null;
  banner_url: string | null;
  categoria: string;
  nota: number;
  tempo_entrega: string;
  taxa_entrega: number;
  frete_gratis: boolean;
  cupom: string | null;
  descricao: string | null;
}

interface MenuItem {
  id: string;
  restaurante_id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  categoria: string;
  imagem_url: string | null;
  destaque: boolean;
}

interface CartItem {
  itemId: string;
  nome: string;
  preco: number;
  qty: number;
}

interface Avaliacao {
  id: string;
  rating: number;
  comment: string | null;
  user_name: string | null;
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Todos', emoji: '🍽️' },
  { id: 'Marmitex', label: 'Marmitex', emoji: '🍱' },
  { id: 'Oriental', label: 'Oriental', emoji: '🍣' },
  { id: 'Lanches', label: 'Lanches', emoji: '🍔' },
  { id: 'Pizzas', label: 'Pizzas', emoji: '🍕' },
  { id: 'Pasteis', label: 'Pasteis', emoji: '🥟' },
  { id: 'Sobremesas', label: 'Sobremesas', emoji: '🍰' },
  { id: 'HotDog', label: 'HotDog', emoji: '🌭' },
  { id: 'Bebidas', label: 'Bebidas', emoji: '🥤' },
  { id: 'Alcoolicas', label: 'Alcoolicas', emoji: '🍺' },
];

const BAIRROS_TAXA: Record<string, number> = {
  boraceia: 34, guaratuba: 29, costasol: 27, morada: 25,
  saolourenco: 20, indaia: 13, vistalinda: 9, albatroz: 7,
  centro: 7, maitinga: 7, riopraia: 6, raphael: 8,
  caiubura: 16, saojoao: 15, caruara: 29,
};

function matchBairro(text: string): number | null {
  const lower = text.toLowerCase().replace(/\s+/g, '');
  for (const [bairro, taxa] of Object.entries(BAIRROS_TAXA)) {
    if (lower.includes(bairro)) return taxa;
  }
  return null;
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
  { name: 'PagBank', deeplink: 'pagbank://', fallback: 'https://pagbank.com.br' },
  { name: 'Mercado Pago', deeplink: 'mercadopago://', fallback: 'https://www.mercadopago.com.br' },
  { name: 'PicPay', deeplink: 'picpay://', fallback: 'https://www.picpay.com' },
];

const IMG = {
  marmitexP: 'https://images.pexels.com/photos/30635708/pexels-photo-30635708.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  marmitexM: 'https://images.pexels.com/photos/30635702/pexels-photo-30635702.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  marmitexG: 'https://images.pexels.com/photos/30635716/pexels-photo-30635716.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  burgerClassico: 'https://images.pexels.com/photos/9201333/pexels-photo-9201333.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  burgerDuplo: 'https://images.pexels.com/photos/36829386/pexels-photo-36829386.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  batata: 'https://images.pexels.com/photos/29285461/pexels-photo-29285461.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  sushi12: 'https://images.pexels.com/photos/28951526/pexels-photo-28951526.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  temaki: 'https://images.pexels.com/photos/8743914/pexels-photo-8743914.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  yakisoba: 'https://images.pexels.com/photos/13729069/pexels-photo-13729069.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  pizzaMarg: 'https://images.pexels.com/photos/28945102/pexels-photo-28945102.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  pizzaCalab: 'https://images.pexels.com/photos/28945103/pexels-photo-28945103.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  pastel: 'https://images.pexels.com/photos/37106474/pexels-photo-37106474.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  pudim: 'https://images.pexels.com/photos/11281582/pexels-photo-11281582.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  brigadeiro: 'https://images.pexels.com/photos/34263268/pexels-photo-34263268.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  hotdog: 'https://images.pexels.com/photos/4669301/pexels-photo-4669301.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  hotdogDuplo: 'https://images.pexels.com/photos/5041477/pexels-photo-5041477.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  coca: 'https://images.pexels.com/photos/5869812/pexels-photo-5869812.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  agua: 'https://images.pexels.com/photos/31966524/pexels-photo-31966524.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  caipirinha: 'https://images.pexels.com/photos/37662775/pexels-photo-37662775.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  cerveja: 'https://images.pexels.com/photos/10839495/pexels-photo-10839495.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
  suco: 'https://images.pexels.com/photos/38431320/pexels-photo-38431320.jpeg?auto=compress&cs=tinysrgb&h=300&w=300',
};

const BANNER = {
  marmitex: 'https://images.pexels.com/photos/19781592/pexels-photo-19781592.jpeg?auto=compress&cs=tinysrgb&h=400&w=800',
  sushi: 'https://images.pexels.com/photos/28951526/pexels-photo-28951526.jpeg?auto=compress&cs=tinysrgb&h=400&w=800',
  burger: 'https://images.pexels.com/photos/9201333/pexels-photo-9201333.jpeg?auto=compress&cs=tinysrgb&h=400&w=800',
  pizza: 'https://images.pexels.com/photos/28945102/pexels-photo-28945102.jpeg?auto=compress&cs=tinysrgb&h=400&w=800',
  pastel: 'https://images.pexels.com/photos/37106474/pexels-photo-37106474.jpeg?auto=compress&cs=tinysrgb&h=400&w=800',
  doce: 'https://images.pexels.com/photos/34263268/pexels-photo-34263268.jpeg?auto=compress&cs=tinysrgb&h=400&w=800',
  hotdog: 'https://images.pexels.com/photos/4669301/pexels-photo-4669301.jpeg?auto=compress&cs=tinysrgb&h=400&w=800',
  bebidas: 'https://images.pexels.com/photos/5869812/pexels-photo-5869812.jpeg?auto=compress&cs=tinysrgb&h=400&w=800',
  bar: 'https://images.pexels.com/photos/37662775/pexels-photo-37662775.jpeg?auto=compress&cs=tinysrgb&h=400&w=800',
};

const FALLBACK_RESTAURANTS: Restaurante[] = [
  { id: 'r1', nome: 'Korvil Marmitex', logo_url: null, banner_url: BANNER.marmitex, categoria: 'Marmitex', nota: 4.8, tempo_entrega: '25-40 min', taxa_entrega: 4.99, frete_gratis: true, cupom: 'OMFOME10', descricao: 'Marmitex caseiro com comida brasileira de verdade. Feito na hora, ingredientes frescos do dia.' },
  { id: 'r2', nome: 'Sushi Oriental Korvil', logo_url: null, banner_url: BANNER.sushi, categoria: 'Oriental', nota: 4.7, tempo_entrega: '30-50 min', taxa_entrega: 6.99, frete_gratis: false, cupom: null, descricao: 'Sushi e temaki frescos preparados por chefs japoneses. Peixe importado diariamente.' },
  { id: 'r3', nome: 'Burguer K-TP', logo_url: null, banner_url: BANNER.burger, categoria: 'Lanches', nota: 4.9, tempo_entrega: '20-35 min', taxa_entrega: 3.99, frete_gratis: true, cupom: 'BURGER15', descricao: 'Hamburgueres artesanais com carne Angus 120g. Pao brioche feito na casa.' },
  { id: 'r4', nome: 'Pizza Korvil', logo_url: null, banner_url: BANNER.pizza, categoria: 'Pizzas', nota: 4.6, tempo_entrega: '35-55 min', taxa_entrega: 5.99, frete_gratis: false, cupom: null, descricao: 'Pizzas artesanais em forno a lenha. Massa de fermentacao natural por 48 horas.' },
  { id: 'r5', nome: 'Pastelaria Sao Judas', logo_url: null, banner_url: BANNER.pastel, categoria: 'Pasteis', nota: 4.5, tempo_entrega: '15-30 min', taxa_entrega: 2.99, frete_gratis: true, cupom: null, descricao: 'Pasteis frescos fritos na hora. Massa crocante e recheios generosos. Sucos naturais.' },
  { id: 'r6', nome: 'Doce Korvil', logo_url: null, banner_url: BANNER.doce, categoria: 'Sobremesas', nota: 4.9, tempo_entrega: '20-35 min', taxa_entrega: 3.49, frete_gratis: false, cupom: 'DOCE10', descricao: 'Sobremesas artesanais. Pudins, brigadeiros gourmet e tortas feitas com chocolate belga.' },
  { id: 'r7', nome: 'HotDog Korvil', logo_url: null, banner_url: BANNER.hotdog, categoria: 'HotDog', nota: 4.4, tempo_entrega: '20-30 min', taxa_entrega: 2.49, frete_gratis: true, cupom: null, descricao: 'Hot dogs especiais com salsicha premium, molhos da casa e batata palha crocante.' },
  { id: 'r8', nome: 'Bebidas Korvil Express', logo_url: null, banner_url: BANNER.bebidas, categoria: 'Bebidas', nota: 4.3, tempo_entrega: '10-20 min', taxa_entrega: 1.99, frete_gratis: true, cupom: null, descricao: 'Bebidas geladas com entrega rapida. Refrigerantes, aguas, sucos e mais.' },
  { id: 'r9', nome: 'Bar Korvil', logo_url: null, banner_url: BANNER.bar, categoria: 'Alcoolicas', nota: 4.7, tempo_entrega: '25-40 min', taxa_entrega: 7.99, frete_gratis: false, cupom: 'BAR20', descricao: 'Drinks autorais e cervejas artesanais geladas. Caipirinhas premiadas.' },
];

const FALLBACK_MENU: Record<string, MenuItem[]> = {
  r1: [
    { id: 'm1', restaurante_id: 'r1', nome: 'Marmitex P', descricao: 'Arroz, feijao, carne assada, salada de tomate. Porcao individual.', preco: 12.90, categoria: 'Principal', imagem_url: IMG.marmitexP, destaque: true },
    { id: 'm2', restaurante_id: 'r1', nome: 'Marmitex M', descricao: 'Arroz, feijao, carne assada, 2 saladas, farofa e ovo. Porcao generosa.', preco: 16.90, categoria: 'Principal', imagem_url: IMG.marmitexM, destaque: true },
    { id: 'm3', restaurante_id: 'r1', nome: 'Marmitex G', descricao: 'Arroz, feijao, carne assada, 3 salidas, ovo, farofa e banana frita. Compartilhar.', preco: 19.90, categoria: 'Principal', imagem_url: IMG.marmitexG, destaque: false },
    { id: 'm4', restaurante_id: 'r1', nome: 'Refrigerante Lata', descricao: 'Coca-Cola, Guaranas ou Sprite 350ml gelado.', preco: 5.00, categoria: 'Bebidas', imagem_url: IMG.coca, destaque: false },
  ],
  r2: [
    { id: 'm5', restaurante_id: 'r2', nome: 'Combinado 12 pecas', descricao: '12 sushis variados: 4 nigiri salmao, 4 nigiri atum, 4 uramaki filadelfia.', preco: 32.90, categoria: 'Combos', imagem_url: IMG.sushi12, destaque: true },
    { id: 'm6', restaurante_id: 'r2', nome: 'Temaki Salmon', descricao: 'Temaki de salmao fresco com cream cheese e cebolinha. Cone grande.', preco: 18.90, categoria: 'Temaki', imagem_url: IMG.temaki, destaque: true },
    { id: 'm7', restaurante_id: 'r2', nome: 'Yakisoba', descricao: 'Yakisoba de carne ou frango com legumes e molho especial. Serve 1 pessoa.', preco: 28.90, categoria: 'Quentes', imagem_url: IMG.yakisoba, destaque: false },
  ],
  r3: [
    { id: 'm8', restaurante_id: 'r3', nome: 'Burger Classico', descricao: 'Pao brioche, carne Angus 120g, queijo cheddar, alface, tomate e molho da casa.', preco: 18.90, categoria: 'Burgers', imagem_url: IMG.burgerClassico, destaque: true },
    { id: 'm9', restaurante_id: 'r3', nome: 'Burger Duplo', descricao: '2 carnes Angus 120g, queijo duplo, bacon crocante e cebola caramelizada.', preco: 24.90, categoria: 'Burgers', imagem_url: IMG.burgerDuplo, destaque: true },
    { id: 'm10', restaurante_id: 'r3', nome: 'Batata Frita G', descricao: 'Batata frita grande com cheddar derretido e bacon em cubos.', preco: 12.90, categoria: 'Acompanhamentos', imagem_url: IMG.batata, destaque: false },
  ],
  r4: [
    { id: 'm11', restaurante_id: 'r4', nome: 'Pizza Margherita', descricao: 'Molho de tomate italiano, mussarela de bufala, manjericao fresco e azeite.', preco: 39.90, categoria: 'Pizzas', imagem_url: IMG.pizzaMarg, destaque: true },
    { id: 'm12', restaurante_id: 'r4', nome: 'Pizza Calabresa', descricao: 'Calabresa fatiada, cebola roxa, mussarela e azeitonas pretas.', preco: 42.90, categoria: 'Pizzas', imagem_url: IMG.pizzaCalab, destaque: false },
    { id: 'm13', restaurante_id: 'r4', nome: 'Pizza Portuguesa', descricao: 'Presunto, ovo, cebola, ervilha, mussarela e orégano. 8 fatias.', preco: 45.90, categoria: 'Pizzas', imagem_url: IMG.pizzaMarg, destaque: false },
  ],
  r5: [
    { id: 'm14', restaurante_id: 'r5', nome: 'Pastel de Carne', descricao: 'Pastel fresco de carne moida temperada. Massa crocante frita na hora.', preco: 8.90, categoria: 'Pasteis', imagem_url: IMG.pastel, destaque: true },
    { id: 'm15', restaurante_id: 'r5', nome: 'Pastel de Queijo', descricao: 'Pastel fresco de queijo mussarela. Massa crocante frita na hora.', preco: 7.90, categoria: 'Pasteis', imagem_url: IMG.pastel, destaque: false },
    { id: 'm16', restaurante_id: 'r5', nome: 'Suco Natural', descricao: 'Suco natural de laranja, abacaxi ou maracuja. 400ml.', preco: 6.90, categoria: 'Bebidas', imagem_url: IMG.suco, destaque: false },
  ],
  r6: [
    { id: 'm17', restaurante_id: 'r6', nome: 'Pudim de Leite', descricao: 'Pudim de leite condensado com calda de caramelo. Textura cremosa.', preco: 9.90, categoria: 'Sobremesas', imagem_url: IMG.pudim, destaque: true },
    { id: 'm18', restaurante_id: 'r6', nome: 'Brigadeiro Gourmet', descricao: 'Brigadeiro belga com granulado especial. Unidade.', preco: 6.90, categoria: 'Sobremesas', imagem_url: IMG.brigadeiro, destaque: false },
  ],
  r7: [
    { id: 'm19', restaurante_id: 'r7', nome: 'Hot Dog Especial', descricao: 'Pao, salsicha premium, molhos da casa, batata palha, queijo e milho.', preco: 12.90, categoria: 'HotDog', imagem_url: IMG.hotdog, destaque: true },
    { id: 'm20', restaurante_id: 'r7', nome: 'Hot Dog Duplo', descricao: '2 salsichas premium, queijo cheddar, bacon e onion rings.', preco: 16.90, categoria: 'HotDog', imagem_url: IMG.hotdogDuplo, destaque: false },
  ],
  r8: [
    { id: 'm21', restaurante_id: 'r8', nome: 'Coca-Cola 2L', descricao: 'Coca-Cola 2 litros gelada. Entrega em 15 minutos.', preco: 9.90, categoria: 'Refrigerantes', imagem_url: IMG.coca, destaque: true },
    { id: 'm22', restaurante_id: 'r8', nome: 'Agua Mineral 500ml', descricao: 'Agua mineral sem gas 500ml gelada.', preco: 3.50, categoria: 'Aguas', imagem_url: IMG.agua, destaque: false },
  ],
  r9: [
    { id: 'm23', restaurante_id: 'r9', nome: 'Caipirinha', descricao: 'Caipirinha de limao taiti com cachaca artesanal. Feita na hora.', preco: 15.90, categoria: 'Drinks', imagem_url: IMG.caipirinha, destaque: true },
    { id: 'm24', restaurante_id: 'r9', nome: 'Cerveja Long Neck', descricao: 'Cerveja artesanal IPA 330ml gelada. Lote especial.', preco: 8.90, categoria: 'Cervejas', imagem_url: IMG.cerveja, destaque: false },
  ],
};

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
  } catch { /* ignora */ }
}

export default function KorvilOmfome({ onClose }: { onClose: () => void }) {
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>(FALLBACK_RESTAURANTS);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [selectedRest, setSelectedRest] = useState<Restaurante | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'time'>('relevance');
  const [authUser, setAuthUser] = useState<{ email?: string; id?: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authProfile, setAuthProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
  const [reviewItem, setReviewItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('omfome_restaurantes').select('*').eq('ativo', true);
      if (data && data.length > 0) setRestaurantes(data as Restaurante[]);
      const u = await getSessionUser();
      setAuthUser(u);
      if (u) {
        const { data: prof } = await supabase.from('korvil_users').select('full_name, avatar_url').eq('id', u.id).maybeSingle();
        if (prof) setAuthProfile(prof);
      }
    })();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const filteredRest = useMemo(() => {
    let list = restaurantes;
    if (activeCat !== 'all') list = list.filter((r) => r.categoria === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.nome.toLowerCase().includes(q) || r.categoria.toLowerCase().includes(q) || (r.descricao ?? '').toLowerCase().includes(q));
    }
    if (sortBy === 'rating') return [...list].sort((a, b) => b.nota - a.nota);
    if (sortBy === 'time') return [...list].sort((a, b) => a.tempo_entrega.localeCompare(b.tempo_entrega));
    return list;
  }, [restaurantes, activeCat, search, sortBy]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => s + c.preco * c.qty, 0);

  const openRestaurante = async (r: Restaurante) => {
    sfxClick();
    setSelectedRest(r);
    setMenu([]);
    const { data } = await supabase.from('omfome_cardapio').select('*').eq('restaurante_id', r.id).eq('disponivel', true);
    if (data && data.length > 0) {
      setMenu(data as MenuItem[]);
    } else {
      setMenu(FALLBACK_MENU[r.id] ?? []);
    }
  };

  const addToCart = (item: MenuItem) => {
    sfxClick();
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.itemId === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { itemId: item.id, nome: item.nome, preco: item.preco, qty: 1 }];
    });
    showToast(`${item.nome} adicionado`);
  };

  const updateQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const q = next[idx].qty + delta;
      if (q <= 0) return next.filter((_, i) => i !== idx);
      next[idx] = { ...next[idx], qty: q };
      return next;
    });
  };

  const menuCats = useMemo(() => [...new Set(menu.map((m) => m.categoria))], [menu]);

  // --- Restaurant list view ---
  if (!selectedRest) {
    return (
      <div className="fixed inset-0 z-[9998] bg-black flex flex-col">
        <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } } .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent); background-size: 200% 100%; animation: shimmer 1.5s infinite; }`}</style>
        <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 0%, #a855f7 0%, transparent 40%), radial-gradient(circle at 75% 100%, #06b6d4 0%, transparent 40%)' }} />

        {/* Header */}
        <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onClose} className="p-2 hover:text-violet-400 transition">
              <X size={20} className="text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-white font-black text-lg flex items-center gap-2">
                <span className="text-violet-400">K-OMFOME</span> Delivery
              </h1>
              <p className="text-zinc-500 text-[10px] flex items-center gap-1">
                <MapPin size={10} /> Entrega rapida na regiao
              </p>
            </div>
            <button onClick={() => setAuthModalOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-violet-500/40 transition">
              {authUser ? (
                authProfile?.avatar_url ? (
                  <img src={authProfile.avatar_url} alt="Perfil" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <UserCircle size={18} className="text-violet-400" />
                )
              ) : (
                <UserCircle size={18} className="text-zinc-400" />
              )}
            </button>
            <div className="relative">
              <button onClick={() => setCartOpen(true)} className="relative p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                <ShoppingCart size={18} className="text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-violet-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar restaurantes ou pratos..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none"
            />
          </div>
          {/* Sort */}
          <div className="flex items-center gap-2 mt-2">
            <Filter size={12} className="text-zinc-500" />
            {([
              { id: 'relevance', label: 'Mais relevantes' },
              { id: 'rating', label: 'Melhor nota' },
              { id: 'time', label: 'Mais rapido' },
            ] as const).map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={`text-[10px] px-2 py-1 rounded-full transition ${
                  sortBy === s.id ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40' : 'text-zinc-500 border border-zinc-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Banner promocional */}
        <div className="px-4 pt-3">
          <div className="bg-gradient-to-r from-violet-600/30 to-fuchsia-600/20 border border-violet-500/30 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">Cupom OMFOME10</p>
              <p className="text-zinc-400 text-xs">10% off na primeira compra</p>
            </div>
            <Zap size={24} className="text-violet-400" />
          </div>
        </div>

        {/* Category scroll */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => { sfxClick(); setActiveCat(c.id); }}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                activeCat === c.id ? 'bg-violet-500/15 text-violet-300 border-violet-500/40' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>

        {/* Restaurantes */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <h2 className="text-white font-bold text-sm mb-3">Restaurantes</h2>
          <div className="space-y-3">
            {filteredRest.map((r) => (
              <button
                key={r.id}
                onClick={() => openRestaurante(r)}
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition flex flex-col text-left"
              >
                <div className="relative h-32 bg-zinc-800">
                  {r.banner_url ? (
                    <img src={r.banner_url} alt={r.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">{CATEGORIES.find((c) => c.id === r.categoria)?.emoji ?? '🍽️'}</span>
                    </div>
                  )}
                  {r.frete_gratis && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Frete gratis
                    </span>
                  )}
                  {r.cupom && (
                    <span className="absolute top-2 right-2 bg-violet-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {r.cupom}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-white font-bold text-sm mb-1">{r.nome}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Star size={11} className="fill-violet-500 text-violet-500" /> {r.nota.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {r.tempo_entrega}
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck size={11} /> {r.frete_gratis ? 'Gratis' : fmtPrice(r.taxa_entrega)}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-[10px] mt-1">{r.descricao}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {cartCount > 0 && !cartOpen && (
          <button
            onClick={() => setCartOpen(true)}
            className="fixed bottom-4 left-4 right-4 z-30 bg-violet-500 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-between px-4 shadow-2xl shadow-violet-500/30"
          >
            <span className="flex items-center gap-2"><ShoppingCart size={18} /> {cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
            <span>{fmtPrice(cartTotal)}</span>
          </button>
        )}

        {cartOpen && (
          <CartDrawer cart={cart} total={cartTotal} onClose={() => setCartOpen(false)} onQty={updateQty} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
        )}

        {authModalOpen && (
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
                }
                setAuthModalOpen(false); sfxClick();
              } catch (e) { setAuthError(e instanceof Error ? e.message : 'Erro'); }
              finally { setAuthLoading(false); }
            }}
            onSignOut={async () => { await signOut(); setAuthUser(null); setAuthProfile(null); setAuthModalOpen(false); sfxClick(); }}
          />
        )}

        {toast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-violet-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xl">{toast}</div>}
      </div>
    );
  }

  // --- Restaurant menu view ---
  return (
    <div className="fixed inset-0 z-[9998] bg-black flex flex-col">
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 0%, #a855f7 0%, transparent 40%)' }} />

      <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
        <button onClick={() => setSelectedRest(null)} className="p-2 hover:text-violet-400 transition">
          <ChevronRight size={20} className="text-white rotate-180" />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-sm">{selectedRest.nome}</h1>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400">
            <span className="flex items-center gap-1"><Star size={10} className="fill-violet-500 text-violet-500" /> {selectedRest.nota.toFixed(1)}</span>
            <span className="flex items-center gap-1"><Clock size={10} /> {selectedRest.tempo_entrega}</span>
            <span className="flex items-center gap-1"><Truck size={10} /> {selectedRest.frete_gratis ? 'Gratis' : fmtPrice(selectedRest.taxa_entrega)}</span>
          </div>
        </div>
        <button onClick={() => setAuthModalOpen(true)} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
          {authUser ? (authProfile?.avatar_url ? <img src={authProfile.avatar_url} alt="Perfil" className="w-5 h-5 rounded-full object-cover" /> : <UserCircle size={18} className="text-violet-400" />) : <UserCircle size={18} className="text-zinc-400" />}
        </button>
        <button onClick={() => setCartOpen(true)} className="relative p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl">
          <ShoppingCart size={18} className="text-white" />
          {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-violet-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{cartCount}</span>}
        </button>
      </div>

      {selectedRest.banner_url && (
        <div className="h-36 bg-zinc-800"><img src={selectedRest.banner_url} alt={selectedRest.nome} className="w-full h-full object-cover" /></div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {menuCats.map((cat) => (
          <div key={cat} className="mb-4">
            <h2 className="text-white font-bold text-sm mb-2 sticky top-0 bg-black/80 backdrop-blur py-2 z-10">{cat}</h2>
            <div className="space-y-2">
              {menu.filter((m) => m.categoria === cat).map((item) => (
                <div key={item.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-xs mb-0.5 cursor-pointer hover:text-violet-300" onClick={() => setReviewItem(item)}>{item.nome}</h3>
                    <p className="text-zinc-500 text-[10px] line-clamp-2 mb-1">{item.descricao}</p>
                    <p className="font-bold text-sm text-violet-300">{fmtPrice(item.preco)}</p>
                    {authUser && <p className="text-[9px] text-zinc-600 mt-0.5">Toque no nome para avaliar</p>}
                  </div>
                  {item.imagem_url && (
                    <div className="relative shrink-0">
                      <img src={item.imagem_url} alt={item.nome} className="w-16 h-16 rounded-lg object-cover" />
                      <button onClick={() => addToCart(item)} className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
                        <Plus size={14} className="text-white" />
                      </button>
                    </div>
                  )}
                  {!item.imagem_url && (
                    <button onClick={() => addToCart(item)} className="self-center w-8 h-8 bg-violet-500/15 border border-violet-500/40 rounded-lg flex items-center justify-center shrink-0">
                      <Plus size={16} className="text-violet-300" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {cartCount > 0 && !cartOpen && !checkoutOpen && (
        <button onClick={() => setCartOpen(true)} className="fixed bottom-4 left-4 right-4 z-30 bg-violet-500 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-between px-4 shadow-2xl">
          <span className="flex items-center gap-2"><ShoppingCart size={18} /> {cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
          <span>{fmtPrice(cartTotal)}</span>
        </button>
      )}

      {cartOpen && <CartDrawer cart={cart} total={cartTotal} onClose={() => setCartOpen(false)} onQty={updateQty} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}

      {checkoutOpen && (
        <OmfomeCheckout
          cart={cart}
          total={cartTotal}
          restaurante={selectedRest}
          onClose={() => setCheckoutOpen(false)}
          onConfirm={async (pixCode, bankUsed, deliveryMode, endereco, freight) => {
            const orderCode = `OMF-${Date.now()}`;
            const orderTotal = cartTotal + freight;
            const user = await getSessionUser();
            if (user) {
              await supabase.from('omfome_pedidos').insert({
                user_id: user.id,
                restaurante_id: selectedRest.id,
                order_code: orderCode,
                items: cart.map((c) => ({ nome: c.nome, qty: c.qty, preco: c.preco })),
                total: orderTotal,
                taxa_entrega: freight,
                endereco,
                pix_code: pixCode,
                status: 'recebido',
              });
            }
            if (bankUsed) incrementBankUsage(bankUsed);
            setCart([]);
            setCheckoutOpen(false);
            setSelectedRest(null);
            sfxClick();
            showToast(`Pedido ${orderCode} criado!`);
          }}
        />
      )}

      {reviewItem && (
        <ReviewModal
          item={reviewItem}
          restauranteId={selectedRest.id}
          userId={authUser?.id ?? null}
          userName={authProfile?.full_name ?? null}
          onClose={() => setReviewItem(null)}
          onSaved={() => { showToast('Avaliacao enviada!'); setReviewItem(null); }}
        />
      )}

      {authModalOpen && (
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
              }
              setAuthModalOpen(false); sfxClick();
            } catch (e) { setAuthError(e instanceof Error ? e.message : 'Erro'); }
            finally { setAuthLoading(false); }
          }}
          onSignOut={async () => { await signOut(); setAuthUser(null); setAuthProfile(null); setAuthModalOpen(false); sfxClick(); }}
        />
      )}

      {toast && <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-violet-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xl">{toast}</div>}
    </div>
  );
}

function CartDrawer({ cart, total, onClose, onQty, onCheckout }: { cart: CartItem[]; total: number; onClose: () => void; onQty: (idx: number, delta: number) => void; onCheckout: () => void; }) {
  return (
    <div className="fixed inset-0 z-[9999] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur" />
      <div className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="font-bold text-sm text-white flex items-center gap-2"><ShoppingCart size={18} className="text-violet-400" /> Carrinho ({cart.length})</h3>
          <button onClick={onClose} className="p-1.5 hover:text-violet-400"><X size={18} className="text-white" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-zinc-600"><ShoppingCart size={40} className="mb-3" /><p className="text-sm">Carrinho vazio</p></div>
          ) : (
            cart.map((c, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
                <div className="flex-1"><h4 className="text-xs font-semibold text-white">{c.nome}</h4><p className="text-sm font-bold text-violet-300">{fmtPrice(c.preco * c.qty)}</p></div>
                <div className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-1.5 py-1">
                  <button onClick={() => onQty(idx, -1)} className="p-0.5"><Minus size={12} className="text-white" /></button>
                  <span className="text-xs font-bold text-white w-5 text-center">{c.qty}</span>
                  <button onClick={() => onQty(idx, 1)} className="p-0.5"><Plus size={12} className="text-white" /></button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="border-t border-zinc-800 p-4 space-y-2">
            <div className="flex justify-between items-center"><span className="text-sm text-zinc-400">Subtotal (frete no checkout)</span><span className="font-black text-lg text-white">{fmtPrice(total)}</span></div>
            <button onClick={onCheckout} className="w-full bg-violet-500 hover:bg-violet-400 text-white font-bold text-sm py-3 rounded-xl transition">Finalizar Pedido</button>
          </div>
        )}
      </div>
    </div>
  );
}

function OmfomeCheckout({ cart, total, restaurante, onClose, onConfirm }: {
  cart: CartItem[];
  total: number;
  restaurante: Restaurante;
  onClose: () => void;
  onConfirm: (pixCode: string, bankUsed: string | undefined, deliveryMode: 'entrega' | 'retirar', endereco: string, freight: number) => Promise<void>;
}) {
  const [deliveryMode, setDeliveryMode] = useState<'entrega' | 'retirar'>('entrega');
  const [endereco, setEndereco] = useState('');
  const [freight, setFreight] = useState<number | null>(null);
  const [paid, setPaid] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankSearch, setBankSearch] = useState('');

  // Hidden calc: auto-match bairro from endereco
  useEffect(() => {
    if (deliveryMode === 'retirar') { setFreight(0); return; }
    if (endereco.trim()) {
      const taxa = matchBairro(endereco);
      setFreight(taxa ?? 0);
    } else {
      setFreight(null);
    }
  }, [endereco, deliveryMode]);

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
        setTimeout(() => { void onConfirm(pixCode, selectedBank ?? undefined, deliveryMode, endereco, freight ?? 0); }, 1500);
      }
    };
    document.addEventListener('visibilitychange', checkFocus);
    window.addEventListener('focus', checkFocus);
    return () => { document.removeEventListener('visibilitychange', checkFocus); window.removeEventListener('focus', checkFocus); };
  }, [waiting, pixCode, selectedBank, deliveryMode, endereco, freight, onConfirm]);

  const handleConfirm = () => { setWaiting(true); sfxClick(); };
  const handleAlreadyPaid = () => {
    setWaiting(false); setPaid(true); sfxClick();
    setTimeout(() => { void onConfirm(pixCode, selectedBank ?? undefined, deliveryMode, endereco, freight ?? 0); }, 1500);
  };

  if (paid) {
    return (
      <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 text-center backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-emerald-400" /></div>
          <h3 className="font-bold text-lg text-white mb-1">Pedido confirmado!</h3>
          <p className="text-zinc-400 text-sm">{restaurante.nome}</p>
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
          <p className="text-zinc-400 text-sm mb-1">Pague {fmtPrice(grandTotal)} via PIX</p>
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
          <h3 className="font-bold text-lg text-white">Checkout</h3>
          <button onClick={onClose} className="p-1.5"><X size={18} className="text-white" /></button>
        </div>

        {/* Entrega ou Retirar */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-zinc-300 mb-2">Opcao de entrega</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => { sfxClick(); setDeliveryMode('entrega'); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition border ${deliveryMode === 'entrega' ? 'bg-violet-500/15 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
              <Truck size={14} /> Entrega
            </button>
            <button onClick={() => { sfxClick(); setDeliveryMode('retirar'); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition border ${deliveryMode === 'retirar' ? 'bg-violet-500/15 text-violet-300 border-violet-500/40' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
              <MapPin size={14} /> Retirar no local
            </button>
          </div>
          {deliveryMode === 'retirar' && <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1"><Check size={12} /> Gratis — retire no restaurante</p>}
        </div>

        {/* Endereco */}
        {deliveryMode === 'entrega' && (
          <div className="mb-4">
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereco completo (rua, numero, bairro)" className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none" />
            {freight !== null && freight > 0 && <p className="text-[10px] text-zinc-500 mt-1">Taxa de entrega: {fmtPrice(freight)}</p>}
            {freight === 0 && endereco.trim() && <p className="text-[10px] text-zinc-500 mt-1">Bairro nao encontrado — taxa R$ 0 (retirar no local)</p>}
          </div>
        )}

        {/* PIX */}
        <div className="mb-4 bg-black border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-400 mb-2">Pague via Pix para:</p>
          <p className="text-sm font-bold text-white mb-1">{PIX_KEY}</p>
          <p className="text-[10px] text-zinc-500 mb-3">Banco Neon · {fmtPrice(grandTotal)}</p>
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

        {/* Resumo */}
        <div className="bg-black border border-zinc-800 rounded-xl p-3 mb-4 space-y-1">
          <div className="flex justify-between text-sm"><span className="text-zinc-400">Subtotal</span><span className="text-white">{fmtPrice(total)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-400">Frete</span><span className={freight === 0 ? 'text-emerald-400' : 'text-white'}>{freight === 0 ? 'Gratis' : fmtPrice(freight ?? 0)}</span></div>
          <div className="flex justify-between font-black text-lg pt-2 border-t border-zinc-800"><span className="text-white">Total</span><span className="text-white">{fmtPrice(grandTotal)}</span></div>
        </div>

        <button onClick={handleConfirm} disabled={deliveryMode === 'entrega' && !endereco.trim()} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40">
          <Check size={18} /> Pagar via PIX
        </button>
        <p className="text-center text-zinc-600 text-[10px] mt-3 flex items-center justify-center gap-1"><ShieldCheck size={10} /> Compra protegida K-OMFOME</p>
      </div>
    </div>
  );
}

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

function ReviewModal({ item, restauranteId, userId, userName, onClose, onSaved }: {
  item: MenuItem;
  restauranteId: string;
  userId: string | null;
  userName: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('omfome_avaliacoes').select('*').eq('restaurante_id', restauranteId).order('created_at', { ascending: false });
      setReviews((data as Avaliacao[]) ?? []);
      setLoading(false);
    })();
  }, [restauranteId]);

  const submit = async () => {
    if (!userId || !comment.trim()) return;
    await supabase.from('omfome_avaliacoes').insert({
      user_id: userId,
      restaurante_id: restauranteId,
      item_id: item.id,
      rating,
      comment: comment.trim(),
      user_name: userName,
    });
    setReviews((prev) => [{ id: Date.now().toString(), rating, comment: comment.trim(), user_name: userName, created_at: new Date().toISOString() }, ...prev]);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[10001] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl max-w-md w-full max-h-[88vh] overflow-y-auto p-6 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-white">{item.nome}</h3>
          <button onClick={onClose} className="p-1.5"><X size={18} className="text-white" /></button>
        </div>
        {item.imagem_url && <img src={item.imagem_url} alt={item.nome} className="w-full h-40 rounded-xl object-cover mb-4" />}
        <p className="text-sm text-zinc-400 mb-4">{item.descricao}</p>

        {/* Avaliar */}
        <div className="bg-zinc-800/50 rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-zinc-300 mb-2">Sua avaliacao</p>
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(i)}>
                <Star size={22} className={i <= rating ? 'fill-violet-500 text-violet-500' : 'text-zinc-600'} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escreva seu comentario sobre o prato..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none resize-none" rows={2} />
          <button onClick={submit} disabled={!comment.trim() || !userId} className="mt-2 bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-40">Enviar avaliacao</button>
          {!userId && <p className="text-[10px] text-zinc-500 mt-2">Entre na conta para avaliar</p>}
        </div>

        {/* Avaliacoes existentes */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-300">Avaliacoes ({reviews.length})</p>
          {loading ? (
            <p className="text-xs text-zinc-600 text-center py-4">Carregando...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">Nenhuma avaliacao ainda. Seja o primeiro!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="bg-zinc-800/30 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={10} className={i <= r.rating ? 'fill-violet-500 text-violet-500' : 'text-zinc-700'} />)}
                  </div>
                  <span className="text-[10px] text-zinc-500">{r.user_name ?? 'Anonimo'}</span>
                </div>
                <p className="text-xs text-zinc-300">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
