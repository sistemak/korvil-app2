/* Lista oficial de contas ADM do ecossistema Korvil.
   Quem entra com qualquer um destes e-mails tem acesso total (S.O.K, K-AI modo criador, loja admin).
   Editável no Meu perfil depois. */

export const ADMIN_EMAILS: string[] = [
  'korvilloja@gmail.com',
  'korvil.p@gmail.com',
  'sistemak.srv@gmail.com',
  'saydavid02@gmail.com',
  'saykorvil@gmail.com',
  'kalmacdc@gmail.com',
  'kafortunado@gmail.com',
  'korvil.tp@gmail.com',
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(lower);
}
