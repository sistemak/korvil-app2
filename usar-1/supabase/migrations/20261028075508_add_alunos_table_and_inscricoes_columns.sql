/*
# Add alunos registry table and extend inscricoes

1. New Tables
- `projeto_transformacao_alunos` — registry of all students with auto-generated short ID and sequential number
  - `id` (uuid, primary key)
  - `aluno_id` (text, unique) — short ID like "marcos43", lowercase, no spaces
  - `numero` (integer) — sequential number (last + 1)
  - `nome` (text)
  - `cpf` (text)
  - `whatsapp` (text)
  - `email` (text)
  - `modalidade` (text) — "presencial" or "online"
  - `status` (text, default "ativo") — "ativo" or "desativado"
  - `inscricao_id` (uuid, nullable) — link to latest inscricao
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Modified Tables
- `projeto_transformacao_inscricoes` — add columns:
  - `aluno_id` (text, nullable) — short ID of the student
  - `aluno_numero` (integer, nullable) — sequential number
  - `modalidade` (text, nullable) — "presencial" or "online" derived from plan type
  - `status` (text, nullable) — status at time of inscription

3. Security
- Enable RLS on `projeto_transformacao_alunos`.
- Grant CRUD to `anon, authenticated` (no-auth app — inscription is public).
- Allow anon + authenticated CRUD on both tables.
- Add policies for select/insert/update/delete on alunos table.
*/

ALTER TABLE projeto_transformacao_inscricoes
  ADD COLUMN IF NOT EXISTS aluno_id text,
  ADD COLUMN IF NOT EXISTS aluno_numero integer,
  ADD COLUMN IF NOT EXISTS modalidade text,
  ADD COLUMN IF NOT EXISTS status text;

CREATE TABLE IF NOT EXISTS projeto_transformacao_alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id text UNIQUE NOT NULL,
  numero integer NOT NULL,
  nome text NOT NULL,
  cpf text,
  whatsapp text,
  email text,
  modalidade text,
  status text NOT NULL DEFAULT 'ativo',
  inscricao_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projeto_transformacao_alunos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON projeto_transformacao_alunos TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_alunos" ON projeto_transformacao_alunos;
CREATE POLICY "anon_select_alunos" ON projeto_transformacao_alunos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alunos" ON projeto_transformacao_alunos;
CREATE POLICY "anon_insert_alunos" ON projeto_transformacao_alunos FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alunos" ON projeto_transformacao_alunos;
CREATE POLICY "anon_update_alunos" ON projeto_transformacao_alunos FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alunos" ON projeto_transformacao_alunos;
CREATE POLICY "anon_delete_alunos" ON projeto_transformacao_alunos FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_alunos_aluno_id ON projeto_transformacao_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_alunos_numero ON projeto_transformacao_alunos(numero);
CREATE INDEX IF NOT EXISTS idx_alunos_cpf ON projeto_transformacao_alunos(cpf);
