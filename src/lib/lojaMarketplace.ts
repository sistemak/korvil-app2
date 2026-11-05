/* Loja marketplace client — orders, favorites, reviews, questions, addresses.
   Uses Supabase tables with RLS. All functions check for auth session. */

import { supabase, getSessionUser } from '@/lib/korvilAuth';

export interface PedidoInput {
  order_code: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  freight: number;
  coupon?: string;
  delivery_mode: 'entrega' | 'retirar';
  address?: { street: string; number: string; neighborhood: string; cep: string; city: string };
  pix_code?: string;
  bank_used?: string;
}

export interface Pedido extends PedidoInput {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function createPedido(input: PedidoInput): Promise<Pedido | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('pedidos')
    .insert(input)
    .select()
    .single();
  if (error) return null;
  return data as Pedido;
}

export async function getPedidos(): Promise<Pedido[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const { data } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });
  return (data as Pedido[]) ?? [];
}

export async function updatePedidoStatus(id: string, status: string): Promise<boolean> {
  const { error } = await supabase
    .from('pedidos')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

export async function getFavoritos(): Promise<string[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const { data } = await supabase
    .from('favoritos')
    .select('product_id');
  return (data ?? []).map((r) => r.product_id);
}

export async function toggleFavorito(productId: string): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  const { data: existing } = await supabase
    .from('favoritos')
    .select('id')
    .eq('product_id', productId)
    .maybeSingle();
  if (existing) {
    await supabase.from('favoritos').delete().eq('product_id', productId);
    return false;
  }
  await supabase.from('favoritos').insert({ product_id: productId });
  return true;
}

export interface Avaliacao {
  id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  user_name: string | null;
  created_at: string;
}

export async function getAvaliacoes(productId: string): Promise<Avaliacao[]> {
  const { data } = await supabase
    .from('avaliacoes')
    .select('id, product_id, rating, comment, user_name, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  return (data as Avaliacao[]) ?? [];
}

export async function addAvaliacao(productId: string, rating: number, comment: string, userName?: string): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  const { error } = await supabase
    .from('avaliacoes')
    .insert({ product_id: productId, rating, comment, user_name: userName });
  return !error;
}

export interface Pergunta {
  id: string;
  product_id: string;
  question: string;
  answer: string | null;
  user_name: string | null;
  answered: boolean;
  created_at: string;
}

export async function getPerguntas(productId: string): Promise<Pergunta[]> {
  const { data } = await supabase
    .from('perguntas')
    .select('id, product_id, question, answer, user_name, answered, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  return (data as Pergunta[]) ?? [];
}

export async function addPergunta(productId: string, question: string, userName?: string): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  const { error } = await supabase
    .from('perguntas')
    .insert({ product_id: productId, question, user_name: userName });
  return !error;
}

export interface Endereco {
  id: string;
  label: string;
  street: string;
  number: string;
  neighborhood: string;
  cep: string;
  city: string;
  is_default: boolean;
}

export async function getEnderecos(): Promise<Endereco[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const { data } = await supabase
    .from('enderecos')
    .select('*')
    .order('is_default', { ascending: false });
  return (data as Endereco[]) ?? [];
}

export async function addEndereco(input: Omit<Endereco, 'id'>): Promise<boolean> {
  const user = await getSessionUser();
  if (!user) return false;
  const { error } = await supabase.from('enderecos').insert(input);
  return !error;
}

/* --- Bank usage tracking (localStorage) --- */
const BANK_USAGE_KEY = 'korvil-banks-usage';

export function getBankUsage(): Record<string, number> {
  try {
    const raw = localStorage.getItem(BANK_USAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function incrementBankUsage(bankName: string): void {
  try {
    const usage = getBankUsage();
    usage[bankName] = (usage[bankName] ?? 0) + 1;
    localStorage.setItem(BANK_USAGE_KEY, JSON.stringify(usage));
  } catch {
    // ignora
  }
}

export function getSortedBanks<T extends { name: string }>(banks: T[]): T[] {
  const usage = getBankUsage();
  return [...banks].sort((a, b) => (usage[b.name] ?? 0) - (usage[a.name] ?? 0));
}
