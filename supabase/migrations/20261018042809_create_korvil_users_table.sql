/*
# Tabela korvil_users (cadastro de usuários do app)

1. Nova tabela
- `korvil_users`
- `id` (uuid, chave primária; igual ao id da conta de acesso criada no cadastro)
- `folder` (text, único): nome da "pasta" do usuário — primeiro nome + iniciais dos demais nomes (ex.: "JoãoSMD")
- `full_name` (text): nome completo informado no cadastro
- `email` (text, único): e-mail da conta
- `cpf` (text): CPF com máscara
- `birth_date` (text): data de nascimento (YYYY-MM-DD)
- `age` (integer): idade calculada na data do cadastro
- `whatsapp` (text): WhatsApp com máscara
- `cep` (text): CEP com máscara
- `street_number` (text): número da casa
- `neighborhood` (text): bairro
- `street` (text): rua
- `created_at` (timestamp): momento do cadastro

2. Segurança
- RLS habilitado.
- Cada usuário autenticado lê e edita SOMENTE a própria linha (auth.uid() = id).
- Ninguém anônimo vê nada. Senhas NÃO ficam nesta tabela: ficam no sistema de
  autenticação oficial (hash seguro no servidor), nunca em texto puro.
*/

CREATE TABLE IF NOT EXISTS korvil_users (
  id uuid PRIMARY KEY,
  folder text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  cpf text NOT NULL,
  birth_date text NOT NULL,
  age integer NOT NULL,
  whatsapp text NOT NULL,
  cep text NOT NULL,
  street_number text NOT NULL,
  neighborhood text NOT NULL,
  street text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE korvil_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_korvil_user" ON korvil_users;
CREATE POLICY "select_own_korvil_user" ON korvil_users
FOR SELECT TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_korvil_user" ON korvil_users;
CREATE POLICY "insert_own_korvil_user" ON korvil_users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_korvil_user" ON korvil_users;
CREATE POLICY "update_own_korvil_user" ON korvil_users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_korvil_user" ON korvil_users;
CREATE POLICY "delete_own_korvil_user" ON korvil_users
FOR DELETE TO authenticated
USING (auth.uid() = id);
