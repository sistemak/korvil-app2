import { useState, type ReactNode } from 'react';
import { X, Save } from 'lucide-react';
import { SECTORS, type Product, type ProductVariation } from '@/data/korvil-loja-catalog';
import { saveLojaProduct } from '@/lib/lojaProducts';

interface FormState {
  sector: string;
  category: string;
  subcategory: string;
  name: string;
  brand: string;
  price: string;
  installment: string;
  shipping: string;
  seller: string;
  imagesText: string;
  video: string;
  description: string;
  variationsText: string;
  tagsText: string;
}

const inputClass = 'w-full bg-[#1e1e1e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#00f5ff] focus:outline-none';

function toFormState(p: Product | null): FormState {
  const firstSector = SECTORS[0];
  const firstCategory = firstSector.categories[0];
  return {
    sector: p?.sector ?? firstSector.id,
    category: p?.category ?? firstCategory.id,
    subcategory: p?.subcategory ?? firstCategory.subcategories[0].id,
    name: p?.name ?? '',
    brand: p?.brand ?? '',
    price: p ? String(p.price) : '',
    installment: p?.installment ?? '',
    shipping: p?.shipping ?? '',
    seller: p?.seller ?? 'Korvil',
    imagesText: p ? p.images.join('\n') : '',
    video: p?.video ?? '',
    description: p?.description ?? '',
    variationsText: p ? p.variations.map((v) => `${v.label}: ${v.options.join(', ')}`).join('\n') : '',
    tagsText: p ? p.tags.join('\n') : '',
  };
}

function lines(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

function buildProduct(f: FormState, base: Product | null): Product | string {
  const name = f.name.trim();
  if (!name) return 'Informe o nome do produto.';
  const price = Number(f.price.replace(',', '.'));
  if (!f.price.trim() || !Number.isFinite(price) || price < 0) return 'Informe um preço válido.';
  const images = lines(f.imagesText);
  if (images.length === 0) return 'Informe pelo menos um link de imagem.';
  const variations: ProductVariation[] = [];
  for (const line of lines(f.variationsText)) {
    const idx = line.indexOf(':');
    const label = idx > 0 ? line.slice(0, idx).trim() : '';
    const options = line.slice(idx + 1).split(',').map((o) => o.trim()).filter(Boolean);
    if (!label || options.length === 0) return `Opção inválida: "${line}". Use o formato Nome: opção 1, opção 2.`;
    variations.push({ label, options });
  }
  return {
    id: base?.id ?? `${f.sector}-${f.subcategory}-${Date.now().toString(36)}`,
    name,
    sector: f.sector,
    category: f.category,
    subcategory: f.subcategory,
    brand: f.brand.trim(),
    price,
    installment: f.installment.trim(),
    shipping: f.shipping.trim(),
    rating: base?.rating ?? 0,
    reviews: base?.reviews ?? 0,
    seller: f.seller.trim() || 'Korvil',
    image: images[0],
    images,
    video: f.video.trim() || null,
    description: f.description.trim(),
    variations,
    tags: lines(f.tagsText),
  };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-zinc-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export default function LojaProductForm({
  initial, onSaved, onClose,
}: {
  initial: Product | null;
  onSaved: (p: Product) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = SECTORS.find((s) => s.id === form.sector)?.categories ?? [];
  const subcategories = categories.find((c) => c.id === form.category)?.subcategories ?? [];

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const changeSector = (sectorId: string) => {
    const first = SECTORS.find((s) => s.id === sectorId)?.categories[0];
    setForm((f) => ({
      ...f,
      sector: sectorId,
      category: first?.id ?? '',
      subcategory: first?.subcategories[0]?.id ?? '',
    }));
  };

  const changeCategory = (categoryId: string) => {
    const first = categories.find((c) => c.id === categoryId)?.subcategories[0];
    setForm((f) => ({ ...f, category: categoryId, subcategory: first?.id ?? '' }));
  };

  const handleSave = async () => {
    const built = buildProduct(form, initial);
    if (typeof built === 'string') {
      setError(built);
      return;
    }
    setSaving(true);
    setError(null);
    const saveError = await saveLojaProduct(built);
    setSaving(false);
    if (saveError) {
      setError('Não foi possível salvar o produto. Tente novamente.');
      return;
    }
    onSaved(built);
  };

  return (
    <div className="fixed inset-0 z-[10005] bg-black/80 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#121212] border border-cyan-500/20 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[#2a2a2a]">
          <h3 className="font-bold text-lg text-white">{initial ? 'Editar produto' : 'Adicionar produto'}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[#00f5ff] text-black text-sm font-bold px-4 py-2 rounded-lg hover:brightness-110 transition disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-red-400 transition" aria-label="Fechar">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Setor">
              <select className={inputClass} value={form.sector} onChange={(e) => changeSector(e.target.value)}>
                {SECTORS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Categoria">
              <select className={inputClass} value={form.category} onChange={(e) => changeCategory(e.target.value)}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Subcategoria">
              <select className={inputClass} value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)}>
                {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nome do produto">
              <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Marca">
              <input className={inputClass} value={form.brand} onChange={(e) => set('brand', e.target.value)} />
            </Field>
            <Field label="Preço (R$)">
              <input className={inputClass} inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} />
            </Field>
            <Field label="Parcelamento">
              <input className={inputClass} value={form.installment} onChange={(e) => set('installment', e.target.value)} />
            </Field>
            <Field label="Frete">
              <input className={inputClass} value={form.shipping} onChange={(e) => set('shipping', e.target.value)} />
            </Field>
            <Field label="Vendedor">
              <input className={inputClass} value={form.seller} onChange={(e) => set('seller', e.target.value)} />
            </Field>
          </div>

          <Field label="Imagens (um link por linha; a primeira é a principal)">
            <textarea className={`${inputClass} min-h-[88px]`} value={form.imagesText} onChange={(e) => set('imagesText', e.target.value)} />
          </Field>
          <Field label="Vídeo (link, opcional)">
            <input className={inputClass} value={form.video} onChange={(e) => set('video', e.target.value)} />
          </Field>
          <Field label="Descrição">
            <textarea className={`${inputClass} min-h-[88px]`} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          <Field label="Opções (uma por linha, no formato Nome: opção 1, opção 2)">
            <textarea className={`${inputClass} min-h-[72px]`} value={form.variationsText} onChange={(e) => set('variationsText', e.target.value)} />
          </Field>
          <Field label="Filtros (uma tag por linha, no formato tipo:valor)">
            <textarea className={`${inputClass} min-h-[72px]`} value={form.tagsText} onChange={(e) => set('tagsText', e.target.value)} />
          </Field>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
