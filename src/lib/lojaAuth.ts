/* Auth compartilhada para a Korvil-Loja.
   Detecta admin via /src/data/admins.ts e sincroniza com Supabase auth. */

import { getSessionUser, getMyProfile, type KorvilProfile } from '@/lib/korvilAuth';
import { isAdminEmail } from '@/data/admins';

export interface LojaUser {
  email: string;
  isAdmin: boolean;
  profile: KorvilProfile | null;
}

export async function getLojaUser(): Promise<LojaUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const profile = await getMyProfile();
  return {
    email: user.email ?? '',
    isAdmin: isAdminEmail(user.email),
    profile,
  };
}

export function isLojaAdmin(email?: string | null): boolean {
  return isAdminEmail(email);
}
