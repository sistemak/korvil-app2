/*
# Lista de ADM no banco (admins_master) e permissões do cadastro

1. Nova tabela
- `admins_master`: lista dos e-mails ADM do KORVIL (email unico).
- Seed com os 8 e-mails oficiais de ADM.

2. Nova função
- `is_admin_email(p_email text)`: devolve true se o e-mail estiver em admins_master.
  Roda com permissão do dono da tabela, então o app consegue checar sem ler a lista inteira.

3. Alterações em korvil_users
- Usuário comum (role = user) é todo mundo que nao esta em admins_master. Nao existe coluna role gravavel pelo app.
- Remove a permissao de escrita geral de anon/authenticated e libera apenas as colunas de cadastro e perfil.
  Assim ninguem consegue se promover a ADM alterando a propria linha.

4. Seguranca
- RLS ligado em admins_master sem politicas e sem grants: o app nao consegue ler nem alterar a lista diretamente.
- Funcao exposta para anon e authenticated (usada na tela de login e no cadastro).

5. Notas
- Migracao idempotente: pode ser reaplicada sem efeito colateral.
- Nenhuma senha ou usuario de auth.users e gravado aqui.
*/

CREATE TABLE IF NOT EXISTS public.admins_master (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admins_master ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admins_master FROM anon, authenticated;

INSERT INTO public.admins_master (email) VALUES
  ('korvil.p@gmail.com'),
  ('korvil.tp@gmail.com'),
  ('sistemak.srv@gmail.com'),
  ('kalmacdc@gmail.com'),
  ('kafortunado@gmail.com'),
  ('korvilloja@gmail.com'),
  ('saydavid02@gmail.com'),
  ('saykorvil@gmail.com')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin_email(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins_master
    WHERE lower(email) = lower(trim(p_email))
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_email(text) TO anon, authenticated;

REVOKE INSERT, UPDATE ON public.korvil_users FROM anon, authenticated;

GRANT INSERT (id, folder, full_name, nickname, email, cpf, birth_date, age, whatsapp, cep, street_number, neighborhood, street, avatar_url, social_links)
  ON public.korvil_users TO authenticated;

GRANT UPDATE (folder, full_name, nickname, email, cpf, birth_date, age, whatsapp, cep, street_number, neighborhood, street, avatar_url, social_links)
  ON public.korvil_users TO authenticated;
