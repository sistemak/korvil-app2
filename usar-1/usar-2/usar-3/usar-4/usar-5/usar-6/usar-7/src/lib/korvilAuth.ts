import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'korvil-auth',
  },
});

export interface KorvilProfile {
  id: string;
  folder: string;
  full_name: string;
  nickname: string | null;
  email: string;
  cpf: string;
  birth_date: string;
  age: number;
  whatsapp: string;
  cep: string;
  street_number: string;
  neighborhood: string;
  street: string;
  avatar_url: string | null;
  social_links: Record<string, string>;
  created_at: string;
}

export type CadastroInput = Omit<KorvilProfile, 'id' | 'created_at' | 'avatar_url'>;

/** "João da Silva Moreira" -> "João" (primeiro nome do cadastro). */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

/** Como a K-AI deve chamar o usuário: apelido, senão primeiro nome. */
export function displayName(profile: Pick<KorvilProfile, 'full_name' | 'nickname'>): string {
  return profile.nickname?.trim() || firstName(profile.full_name) || 'chefe';
}

export async function getSessionUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export async function getMyProfile(): Promise<KorvilProfile | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('korvil_users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (error) return null;
  return (data as KorvilProfile) ?? null;
}

/** "João da Silva Moreira" -> "JoãoDSM" (primeiro nome + iniciais dos demais). */
export function buildFolderName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Usuario';
  const first = parts[0];
  const initials = parts
    .slice(1)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');
  return `${first}${initials}`;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpAccount(email: string, password: string) {
  // Email confirmation is OFF: the session comes back immediately.
  return supabase.auth.signUp({ email, password });
}

export async function saveCadastro(userId: string, input: CadastroInput) {
  return supabase
    .from('korvil_users')
    .insert({ id: userId, ...input })
    .select()
    .single();
}

/** Salva os dados do cadastro; se a linha já existir (tentativa anterior), atualiza. */
export async function upsertCadastro(userId: string, input: CadastroInput) {
  const ins = await saveCadastro(userId, input);
  if (!ins.error) return ins;
  return supabase
    .from('korvil_users')
    .update(input)
    .eq('id', userId)
    .select()
    .single();
}

/** Campos que o próprio usuário pode editar na tela de perfil. */
export type ProfileEditInput = Partial<
  Pick<
    KorvilProfile,
    | 'full_name'
    | 'nickname'
    | 'cpf'
    | 'birth_date'
    | 'whatsapp'
    | 'cep'
    | 'street_number'
    | 'neighborhood'
    | 'street'
    | 'avatar_url'
    | 'social_links'
  >
>;

export type SocialLinksMap = Record<string, string>;

export async function updateMyProfile(
  input: ProfileEditInput
): Promise<{ data?: KorvilProfile; error?: { message: string } }> {
  const user = await getSessionUser();
  if (!user) return { error: { message: 'Sessão expirada. Entre novamente.' } };
  return supabase
    .from('korvil_users')
    .update(input)
    .eq('id', user.id)
    .select()
    .single()
    .then((res) =>
      res.error
        ? { error: { message: res.error.message } }
        : { data: res.data as KorvilProfile }
    );
}

/** Salva a foto de perfil no espaço de arquivos (pasta privada do usuário) e devolve a URL pública. */
export async function uploadAvatar(file: File): Promise<{ url?: string; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { error: 'Sessão expirada. Entre novamente.' };
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type });
  if (upErr) return { error: upErr.message };
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { url: data.publicUrl };
}
