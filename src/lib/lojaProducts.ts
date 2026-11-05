import { supabase } from '@/lib/korvilAuth';
import { PRODUCTS, type Product, type ProductVariation } from '@/data/korvil-loja-catalog';

interface LojaProductRow {
  id: string;
  sector: string;
  category: string;
  subcategory: string;
  name: string;
  brand: string;
  price: number | string;
  installment: string;
  shipping: string;
  rating: number | string;
  reviews: number;
  seller: string;
  image: string;
  images: string[];
  video: string | null;
  description: string;
  variations: ProductVariation[];
  tags: string[];
}

function rowToProduct(row: LojaProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    sector: row.sector,
    category: row.category,
    subcategory: row.subcategory,
    brand: row.brand,
    price: Number(row.price),
    installment: row.installment,
    shipping: row.shipping,
    rating: Number(row.rating),
    reviews: row.reviews,
    seller: row.seller,
    image: row.image,
    images: row.images,
    video: row.video,
    description: row.description,
    variations: row.variations,
    tags: row.tags,
  };
}

function productToRow(p: Product): LojaProductRow {
  return {
    id: p.id,
    sector: p.sector,
    category: p.category,
    subcategory: p.subcategory,
    name: p.name,
    brand: p.brand,
    price: p.price,
    installment: p.installment,
    shipping: p.shipping,
    rating: p.rating,
    reviews: p.reviews,
    seller: p.seller,
    image: p.image,
    images: p.images,
    video: p.video,
    description: p.description,
    variations: p.variations,
    tags: p.tags,
  };
}

export async function fetchLojaProducts(): Promise<Product[] | null> {
  const { data, error } = await supabase
    .from('loja_products')
    .select('*')
    .order('id', { ascending: true });
  if (error || !Array.isArray(data)) return null;
  if (data.length === 0) return null;
  return (data as LojaProductRow[]).map(rowToProduct);
}

async function seedIfEmpty(): Promise<string | null> {
  const { data, error } = await supabase.from('loja_products').select('id').limit(1);
  if (error) return error.message;
  if (Array.isArray(data) && data.length > 0) return null;
  const { error: seedError } = await supabase
    .from('loja_products')
    .upsert(PRODUCTS.map(productToRow), { onConflict: 'id' });
  return seedError ? seedError.message : null;
}

export async function saveLojaProduct(p: Product): Promise<string | null> {
  const seedError = await seedIfEmpty();
  if (seedError) return seedError;
  const { error } = await supabase
    .from('loja_products')
    .upsert({ ...productToRow(p), updated_at: new Date().toISOString() }, { onConflict: 'id' });
  return error ? error.message : null;
}
