/*
# Create arquivos table for S.O.K K-B.D (file database)

1. New Tables
- `arquivos`
  - `id` (uuid, primary key)
  - `nome` (text, not null) — original file name
  - `tipo` (text, not null) — mime type or category (imagem, video, audio, documento)
  - `file_id_telegram` (text, not null) — Telegram file_id for download
  - `tamanho` (bigint, default 0) — file size in bytes
  - `setor` (text, not null) — which sector owns the file (KORVIL, SISTEMA_K, K_TP, K_AFORTUNADO, K_ALMA)
  - `data_criacao` (timestamptz, default now()) — upload timestamp

2. Security
- Enable RLS on `arquivos`.
- Grant CRUD to `authenticated` only (S.O.K is admin-only, requires sign-in).
- All authenticated admin users can manage all arquivos rows (shared admin data, no per-user ownership).
- No `anon` access — S.O.K requires authentication.

3. Notes
- This table stores Telegram file_ids as a lightweight file database.
- Actual file content lives on Telegram servers; this table is the metadata index.
- All authenticated admin users share full access to all files across all setores.
*/

CREATE TABLE IF NOT EXISTS arquivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL,
  file_id_telegram text NOT NULL,
  tamanho bigint NOT NULL DEFAULT 0,
  setor text NOT NULL,
  data_criacao timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE arquivos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON arquivos TO authenticated;

DROP POLICY IF EXISTS "auth_select_arquivos" ON arquivos;
CREATE POLICY "auth_select_arquivos"
ON arquivos FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_arquivos" ON arquivos;
CREATE POLICY "auth_insert_arquivos"
ON arquivos FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_arquivos" ON arquivos;
CREATE POLICY "auth_update_arquivos"
ON arquivos FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_arquivos" ON arquivos;
CREATE POLICY "auth_delete_arquivos"
ON arquivos FOR DELETE
TO authenticated USING (true);
