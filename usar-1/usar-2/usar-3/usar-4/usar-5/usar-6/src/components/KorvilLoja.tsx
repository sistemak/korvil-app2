/* Korvil-Loja — Marketplace oficial K.L. Fullscreen, catálogo, filtros, busca,
   carrinho, favoritos, pedidos, cupom, checkout. Persistência em localStorage. */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X, Search, ShoppingCart, Heart, Tag, Settings, Home,
  Star, Truck, Check, ChevronRight, ChevronDown, Plus, Minus,
  ShoppingBag, Package, User,
} from 'lucide-react';
import {
  PRODUCTS, SECTORS, type Product, type Sector,
} from '@/data/korvil-loja-catalog';

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
}

const CART_KEY = 'kl-cart';
const FAV_KEY = 'kl-favs';
const ORDERS_KEY = 'kl-orders';
const COUPON_CODE = 'KORVIL10';

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

export default function KorvilLoja({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('compras');
  const [search, setSearch] = useState('');
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(load(CART_KEY, []));
  const [favs, setFavs] = useState<string[]>(load(FAV_KEY, []));
  const [orders, setOrders] = useState<Order[]>(load(ORDERS_KEY, []));
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => save(CART_KEY, cart), [cart]);
  useEffect(() => save(FAV_KEY, favs), [favs]);
  useEffect(() => save(ORDERS_KEY, orders), [orders]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const filtered = useMemo(() => {
    let list = PRODUCTS;
    if (activeSector) list = list.filter((p) => p.sector === activeSector);
    if (activeCategory) list = list.filter((p) => p.category === activeCategory);
    if (activeSub) list = list.filter((p) => p.subcategory === activeSub);
    if (activeBrand) list = list.filter((p) => p.brand === activeBrand);
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
  }, [activeSector, activeCategory, activeSub, activeBrand, search]);

  const shuffled = useMemo(() => {
    if (!search && !activeSector && !activeCategory && !activeSub && !activeBrand) {
      return [...PRODUCTS].sort(() => Math.random() - 0.5);
    }
    return filtered;
  }, [filtered, search, activeSector, activeCategory, activeSub, activeBrand]);

  const brandsForFilter = useMemo(() => {
    let list = PRODUCTS;
    if (activeSector) list = list.filter((p) => p.sector === activeSector);
    if (activeCategory) list = list.filter((p) => p.category === activeCategory);
    if (activeSub) list = list.filter((p) => p.subcategory === activeSub);
    return [...new Set(list.map((p) => p.brand))].sort();
  }, [activeSector, activeCategory, activeSub]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => {
    const p = PRODUCTS.find((x) => x.id === c.productId);
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
    showToast('Adicionado ao carrinho');
  }, [showToast]);

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

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
      showToast('Cupom KORVIL10 aplicado — 10% de desconto');
    } else {
      showToast('Cupom inválido');
    }
  };

  const finishCheckout = () => {
    const items = cart.map((c) => {
      const p = PRODUCTS.find((x) => x.id === c.productId);
      return { name: p?.name ?? 'Item', qty: c.qty, price: p?.price ?? 0 };
    });
    const order: Order = {
      id: `PED-${Date.now()}`,
      items,
      total: finalTotal,
      date: new Date().toLocaleDateString('pt-BR'),
      coupon: appliedCoupon ?? undefined,
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setAppliedCoupon(null);
    setCouponInput('');
    setCheckoutOpen(false);
    setCartOpen(false);
    showToast(`Pedido ${order.id} confirmado`);
    setTab('pedidos');
  };

  const clearFilters = () => {
    setActiveSector(null);
    setActiveCategory(null);
    setActiveSub(null);
    setActiveBrand(null);
    setSearch('');
    setExpandedSector(null);
    setExpandedCat(null);
  };

  const selectSector = (sId: string) => {
    if (activeSector === sId) {
      setActiveSector(null);
      setActiveCategory(null);
      setActiveSub(null);
    } else {
      setActiveSector(sId);
      setActiveCategory(null);
      setActiveSub(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-zinc-950 text-white overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #a9a9a9, #d4d4d4)',
                boxShadow: '0 0 12px rgba(200,200,200,0.4)',
              }}
            >
              <span className="font-black text-sm" style={{ color: '#b8860b', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>KL</span>
            </div>
            <span className="font-black text-base hidden sm:block" style={{ color: '#d4af37', textShadow: '0 1px 4px rgba(212,175,55,0.3)' }}>
              Korvil-Loja
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar em toda Korvil-Loja..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none transition"
            />
          </div>

          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl hover:border-amber-500/50 transition shrink-0"
            aria-label="Carrinho"
          >
            <ShoppingCart size={18} className="text-zinc-300" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            className="p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl hover:border-amber-500/50 transition shrink-0"
            aria-label="Perfil"
          >
            <User size={18} className="text-zinc-300" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2.5 bg-zinc-900 border border-zinc-700 rounded-xl hover:border-red-500/50 transition shrink-0"
            aria-label="Fechar"
          >
            <X size={18} className="text-zinc-300" />
          </button>
        </div>

        {/* Menu bar */}
        <nav className="flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {([
            { id: 'compras', label: 'Compras', icon: ShoppingBag },
            { id: 'pedidos', label: 'Pedidos', icon: Package },
            { id: 'favoritos', label: 'Favoritos', icon: Heart },
            { id: 'cupom', label: 'Cupom', icon: Tag },
            { id: 'config', label: 'Configurações', icon: Settings },
          ] as { id: Tab; label: string; icon: typeof Home }[]).map((m) => (
            <button
              key={m.id}
              onClick={() => setTab(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                tab === m.id
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <m.icon size={14} /> {m.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      {tab === 'compras' && (
        <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 shrink-0 lg:sticky lg:top-[112px] lg:self-start border-r border-zinc-800/50 p-3 lg:max-h-[calc(100vh-112px)] lg:overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-300">Filtros</h3>
              {(activeSector || activeBrand || search) && (
                <button onClick={clearFilters} className="text-[11px] text-amber-500 hover:underline">
                  Limpar
                </button>
              )}
            </div>

            {/* Sector tree */}
            <div className="space-y-1">
              {SECTORS.map((s: Sector) => (
                <div key={s.id}>
                  <button
                    onClick={() => {
                      selectSector(s.id);
                      setExpandedSector(expandedSector === s.id ? null : s.id);
                      setExpandedCat(null);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-semibold transition ${
                      activeSector === s.id ? 'bg-zinc-800 text-amber-400' : 'text-zinc-400 hover:bg-zinc-900'
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
                            onClick={() => {
                              setActiveCategory(activeCategory === c.id ? null : c.id);
                              setActiveSub(null);
                              setExpandedCat(expandedCat === c.id ? null : c.id);
                            }}
                            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] transition ${
                              activeCategory === c.id ? 'text-amber-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
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
                                    activeSub === sc.id ? 'text-amber-400 font-semibold' : 'text-zinc-600 hover:text-zinc-400'
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
              <div className="mt-4 pt-4 border-t border-zinc-800/50">
                <h4 className="text-xs font-bold text-zinc-400 mb-2">Marcas</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {brandsForFilter.map((b) => (
                    <button
                      key={b}
                      onClick={() => setActiveBrand(activeBrand === b ? null : b)}
                      className={`w-full text-left px-2 py-1 rounded text-[11px] transition ${
                        activeBrand === b ? 'text-amber-400 font-semibold bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Product grid */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-zinc-400">
                {shuffled.length} {shuffled.length === 1 ? 'produto' : 'produtos'}
                {activeSector && ` · ${SECTORS.find((s) => s.id === activeSector)?.name}`}
              </p>
            </div>

            {shuffled.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                <ShoppingBag size={48} className="mb-3" />
                <p className="text-sm">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {shuffled.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    fav={favs.includes(p.id)}
                    onFav={() => toggleFav(p.id)}
                    onOpen={() => setSelectedProduct(p)}
                    onBuy={() => {
                      const v: Record<string, string> = {};
                      p.variations.forEach((vr) => { v[vr.label] = vr.options[0]; });
                      addToCart(p, v);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pedidos */}
      {tab === 'pedidos' && (
        <div className="max-w-3xl mx-auto p-4">
          <h2 className="text-lg font-bold mb-4">Meus Pedidos</h2>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-zinc-600">
              <Package size={48} className="mb-3" />
              <p className="text-sm">Nenhum pedido ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
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
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                    <span className="text-xs text-amber-500">{o.coupon && `Cupom ${o.coupon}`}</span>
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
        <div className="max-w-5xl mx-auto p-4">
          <h2 className="text-lg font-bold mb-4">Favoritos</h2>
          {favs.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-zinc-600">
              <Heart size={48} className="mb-3" />
              <p className="text-sm">Nenhum favorito ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {favs
                .map((id) => PRODUCTS.find((p) => p.id === id))
                .filter(Boolean)
                .map((p) => (
                  <ProductCard
                    key={p!.id}
                    product={p!}
                    fav
                    onFav={() => toggleFav(p!.id)}
                    onOpen={() => setSelectedProduct(p!)}
                    onBuy={() => {
                      const v: Record<string, string> = {};
                      p!.variations.forEach((vr) => { v[vr.label] = vr.options[0]; });
                      addToCart(p!, v);
                    }}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Cupom */}
      {tab === 'cupom' && (
        <div className="max-w-md mx-auto p-4 pt-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <Tag size={40} className="text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold mb-1">Cupom de Desconto</h2>
            <p className="text-zinc-500 text-xs mb-4">Digite seu cupom para ganhar desconto no carrinho</p>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="KORVIL10"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm uppercase focus:border-amber-500/50 focus:outline-none"
              />
              <button
                onClick={applyCoupon}
                className="bg-amber-500 text-black font-bold text-sm px-4 rounded-xl hover:bg-amber-400 transition"
              >
                Aplicar
              </button>
            </div>
            {appliedCoupon && (
              <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 text-sm">
                <Check size={16} /> Cupom {appliedCoupon} ativo — 10% off
              </div>
            )}
            <p className="text-zinc-600 text-[11px] mt-4">Dica: use o cupom <strong className="text-amber-500">KORVIL10</strong></p>
          </div>
        </div>
      )}

      {/* Config */}
      {tab === 'config' && (
        <div className="max-w-md mx-auto p-4 pt-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <Settings size={32} className="text-zinc-500 mb-3" />
            <h2 className="text-lg font-bold mb-4">Configurações</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Notificações de pedidos</span>
                <span className="text-amber-500">Ativado</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Vendedor padrão</span>
                <span className="text-zinc-300">Korvil Store</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-400">Versão</span>
                <span className="text-zinc-500">v-2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          fav={favs.includes(selectedProduct.id)}
          onFav={() => toggleFav(selectedProduct.id)}
          onAdd={(v) => {
            addToCart(selectedProduct, v);
            setSelectedProduct(null);
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          total={cartTotal}
          discount={discount}
          finalTotal={finalTotal}
          coupon={appliedCoupon}
          onClose={() => setCartOpen(false)}
          onQty={updateQty}
          onCheckout={() => setCheckoutOpen(true)}
        />
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          total={finalTotal}
          coupon={appliedCoupon}
          onClose={() => setCheckoutOpen(false)}
          onConfirm={finishCheckout}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-amber-500 text-black font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xl animate-[whisperIn_0.2s_ease-out]">
          {toast}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product: p, fav, onFav, onOpen, onBuy,
}: {
  product: Product;
  fav: boolean;
  onFav: () => void;
  onOpen: () => void;
  onBuy: () => void;
}) {
  return (
    <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-zinc-950 cursor-pointer" onClick={onOpen}>
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onFav(); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition"
          aria-label="Favoritar"
        >
          <Heart size={15} className={fav ? 'fill-amber-500 text-amber-500' : 'text-zinc-400'} />
        </button>
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-[10px] text-amber-500 font-semibold mb-0.5">{p.brand}</p>
        <h4 className="text-xs font-semibold text-white leading-tight line-clamp-2 mb-1 cursor-pointer hover:text-amber-300" onClick={onOpen}>
          {p.name}
        </h4>
        <div className="flex items-center gap-1 mb-1.5">
          <Star size={11} className="fill-amber-500 text-amber-500" />
          <span className="text-[10px] text-zinc-400">{p.rating}</span>
          <span className="text-[10px] text-zinc-600">({p.reviews})</span>
        </div>
        <p className="font-black text-sm text-white mb-0.5">{fmtPrice(p.price)}</p>
        <p className="text-[10px] text-zinc-500 mb-1">{p.installment}</p>
        <div className="flex items-center gap-1 mb-2">
          <Truck size={11} className="text-emerald-500" />
          <span className="text-[10px] text-emerald-500 font-semibold">{p.shipping}</span>
        </div>
        <button
          onClick={onBuy}
          className="mt-auto w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-[11px] py-2 rounded-lg transition flex items-center justify-center gap-1"
        >
          <ShoppingCart size={13} /> Comprar
        </button>
      </div>
    </div>
  );
}

function ProductDetail({
  product: p, fav, onFav, onAdd, onClose,
}: {
  product: Product;
  fav: boolean;
  onFav: () => void;
  onAdd: (v: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [variations, setVariations] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    p.variations.forEach((vr) => { v[vr.label] = vr.options[0]; });
    return v;
  });
  const [qty, setQty] = useState(1);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img src={p.image} alt={p.name} className="w-full h-64 sm:h-80 object-cover rounded-t-3xl" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition"
          >
            <X size={18} className="text-white" />
          </button>
          <button
            onClick={onFav}
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center hover:bg-black/80 transition"
          >
            <Heart size={18} className={fav ? 'fill-amber-500 text-amber-500' : 'text-white'} />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-amber-500 font-semibold mb-1">{p.brand}</p>
          <h2 className="text-xl font-black text-white mb-2">{p.name}</h2>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={14} className={i <= Math.round(p.rating) ? 'fill-amber-500 text-amber-500' : 'text-zinc-700'} />
              ))}
            </div>
            <span className="text-xs text-zinc-400">{p.rating} · {p.reviews} avaliações</span>
          </div>

          <p className="text-sm text-zinc-400 mb-4">{p.description}</p>

          {/* Variations */}
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
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Price */}
          <div className="flex items-end gap-2 mb-1">
            <span className="font-black text-2xl text-white">{fmtPrice(p.price)}</span>
          </div>
          <p className="text-sm text-zinc-400 mb-1">{p.installment} sem juros</p>
          <div className="flex items-center gap-1.5 mb-4">
            <Truck size={14} className="text-emerald-500" />
            <span className="text-xs text-emerald-500 font-semibold">{p.shipping}</span>
          </div>

          {/* Qty + Add */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-2 py-1.5">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-1 hover:text-amber-400 transition">
                <Minus size={16} />
              </button>
              <span className="font-bold text-sm w-6 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-1 hover:text-amber-400 transition">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => { for (let i = 0; i < qty; i++) onAdd(variations); }}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} /> Adicionar ao carrinho
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs text-zinc-500">
            <span>Vendedor: <strong className="text-zinc-300">{p.seller}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  cart, total, discount, finalTotal, coupon,
  onClose, onQty, onCheckout,
}: {
  cart: CartItem[];
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
        className="relative w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <ShoppingCart size={18} className="text-amber-500" /> Carrinho ({cart.length})
          </h3>
          <button onClick={onClose} className="p-1.5 hover:text-amber-400 transition">
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
              const p = PRODUCTS.find((x) => x.id === c.productId);
              if (!p) return null;
              return (
                <div key={idx} className="flex gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                  <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-amber-500 font-semibold">{p.brand}</p>
                    <h4 className="text-xs font-semibold text-white line-clamp-2 mb-1">{p.name}</h4>
                    <div className="flex flex-wrap gap-1 mb-1">
                      {Object.entries(c.variations).map(([k, v]) => (
                        <span key={k} className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{v}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-1.5 py-1">
                        <button onClick={() => onQty(idx, -1)} className="p-0.5 hover:text-amber-400">
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{c.qty}</span>
                        <button onClick={() => onQty(idx, 1)} className="p-0.5 hover:text-amber-400">
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
          <div className="border-t border-zinc-800 p-4 space-y-2">
            {discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-400">
                <span>Desconto ({coupon})</span>
                <span>-{fmtPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">Total</span>
              <span className="font-black text-lg">{fmtPrice(finalTotal)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm py-3 rounded-xl transition"
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
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Finalizar Compra</h3>
          <button onClick={onClose} className="p-1.5 hover:text-amber-400">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <input
            placeholder="Nome completo"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none"
          />
          <input
            placeholder="E-mail"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none"
          />
          <input
            placeholder="Endereço de entrega"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="CEP"
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none"
            />
            <select className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500/50 focus:outline-none">
              <option>Cartão de Crédito</option>
              <option>Pix</option>
              <option>Boleto</option>
            </select>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-zinc-400">Subtotal</span>
            <span>{fmtPrice(total)}</span>
          </div>
          {coupon && (
            <div className="flex justify-between text-xs text-emerald-400 mb-1">
              <span>Cupom {coupon}</span>
              <span>10% off aplicado</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Frete</span>
            <span className="text-emerald-500">Grátis</span>
          </div>
          <div className="flex justify-between font-black text-lg pt-2 border-t border-zinc-800 mt-2">
            <span>Total</span>
            <span>{fmtPrice(total)}</span>
          </div>
        </div>

        <button
          onClick={onConfirm}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Check size={18} /> Confirmar Pedido
        </button>
        <p className="text-center text-zinc-600 text-[10px] mt-3">Compra simulada — nenhum pagamento real</p>
      </div>
    </div>
  );
}
