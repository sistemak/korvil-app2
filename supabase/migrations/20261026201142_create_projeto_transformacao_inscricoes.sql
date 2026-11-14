/*
# Create projeto_transformacao_inscricoes table

1. New Tables
- `projeto_transformacao_inscricoes`
  - Stores inscription submissions from the Projeto Transformação signup form.
  - `id` (uuid, primary key)
  - `nome` (text, full name as typed)
  - `cpf` (text, masked CPF as typed)
  - `data_nascimento` (text, ISO date as typed)
  - `genero` (text)
  - `whatsapp` (text, masked as typed)
  - `email` (text)
  - `cep` (text, masked as typed)
  - `rua` (text)
  - `numero` (text)
  - `bairro` (text)
  - `cidade` (text)
  - `objetivos` (text[], ordered priority list)
  - `nivel` (text, activity level)
  - `respostas` (jsonb, array of {pergunta, resposta} pairs exactly as typed)
  - `plano_nome` (text)
  - `plano_tipo` (text)
  - `plano_freq` (int)
  - `plano_valor` (int)
  - `plano_mat` (int)
  - `dias` (text[], selected weekdays)
  - `hora` (text)
  - `total` (int, first payment total)
  - `payload` (jsonb, full raw payload exactly as the person filled, for fidelity)
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `projeto_transformacao_inscricoes`.
- Grant CRUD to `anon` + `authenticated` (public inscription form, no sign-in required to submit).
- Open CRUD policies (USING (true) / WITH CHECK (true)) because submissions are intentionally public — anyone filling the form can submit. Reads are also open since there is no owner concept on this public form.
3. Important notes
- This is a single-tenant / no-auth table: the inscription form is public and does not require login, so policies target `anon, authenticated`.
- All fields are stored EXACTLY as the person typed them (masked CPF, masked WhatsApp, masked CEP, raw text answers).
*/

CREATE TABLE IF NOT EXISTS projeto_transformacao_inscricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  cpf text,
  data_nascimento text,
  genero text,
  whatsapp text,
  email text,
  cep text,
  rua text,
  numero text,
  bairro text,
  cidade text,
  objetivos text[],
  nivel text,
  respostas jsonb,
  plano_nome text,
  plano_tipo text,
  plano_freq integer,
  plano_valor integer,
  plano_mat integer,
  dias text[],
  hora text,
  total integer,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projeto_transformacao_inscricoes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON projeto_transformacao_inscricoes TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_inscricoes" ON projeto_transformacao_inscricoes;
CREATE POLICY "anon_select_inscricoes"
  ON projeto_transformacao_inscricoes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_inscricoes" ON projeto_transformacao_inscricoes;
CREATE POLICY "anon_insert_inscricoes"
  ON projeto_transformacao_inscricoes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_inscricoes" ON projeto_transformacao_inscricoes;
CREATE POLICY "anon_update_inscricoes"
  ON projeto_transformacao_inscricoes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_inscricoes" ON projeto_transformacao_inscricoes;
CREATE POLICY "anon_delete_inscricoes"
  ON projeto_transformacao_inscricoes FOR DELETE
  TO anon, authenticated USING (true);
