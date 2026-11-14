/*
# Add weekly weight tracking + GIF URL for Projeto Transformação

1. New Table: projeto_transformacao_pesos
   - Weekly weight entries per student
   - aluno_id (text), peso (numeric), data_registro (timestamptz), data_edicao (timestamptz)
   - semana_ano (text) — e.g. "2026-W44" to prevent duplicate weekly entries

2. Modified Table: projeto_transformacao_alunos
   - Add gif_url (text, nullable) — only admin can set; stores GIF attachment URL for cronograma

3. Security
   - RLS enabled on pesos table
   - Open CRUD for anon + authenticated (no-auth app, client talks to DB directly)
*/

CREATE TABLE IF NOT EXISTS projeto_transformacao_pesos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id text NOT NULL,
  peso numeric(5,2) NOT NULL,
  data_registro timestamptz NOT NULL DEFAULT now(),
  data_edicao timestamptz,
  semana_ano text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projeto_transformacao_pesos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON projeto_transformacao_pesos TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_pesos" ON projeto_transformacao_pesos;
CREATE POLICY "anon_select_pesos" ON projeto_transformacao_pesos
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pesos" ON projeto_transformacao_pesos;
CREATE POLICY "anon_insert_pesos" ON projeto_transformacao_pesos
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pesos" ON projeto_transformacao_pesos;
CREATE POLICY "anon_update_pesos" ON projeto_transformacao_pesos
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pesos" ON projeto_transformacao_pesos;
CREATE POLICY "anon_delete_pesos" ON projeto_transformacao_pesos
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_pesos_aluno_id ON projeto_transformacao_pesos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_pesos_semana ON projeto_transformacao_pesos(aluno_id, semana_ano);

ALTER TABLE projeto_transformacao_alunos
  ADD COLUMN IF NOT EXISTS gif_url text;
