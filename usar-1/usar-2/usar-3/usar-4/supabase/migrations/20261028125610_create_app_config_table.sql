/*
# app_config table — portable project config store
Stores a single JSON config row per project, upserted by projeto_id.
*/

CREATE TABLE IF NOT EXISTS app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id text UNIQUE NOT NULL,
  dono text,
  config jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON app_config TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_app_config" ON app_config;
CREATE POLICY "anon_select_app_config" ON app_config
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_config" ON app_config;
CREATE POLICY "anon_insert_app_config" ON app_config
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_app_config" ON app_config;
CREATE POLICY "anon_update_app_config" ON app_config
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_app_config" ON app_config;
CREATE POLICY "anon_delete_app_config" ON app_config
  FOR DELETE TO anon, authenticated USING (true);
