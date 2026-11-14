CREATE TABLE IF NOT EXISTS omfome_avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  restaurante_id uuid REFERENCES omfome_restaurantes(id) ON DELETE CASCADE,
  item_id text,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text,
  user_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE omfome_avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_omfome_avaliacoes" ON omfome_avaliacoes;
CREATE POLICY "select_all_omfome_avaliacoes" ON omfome_avaliacoes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_omfome_avaliacao" ON omfome_avaliacoes;
CREATE POLICY "insert_own_omfome_avaliacao" ON omfome_avaliacoes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_omfome_avaliacao" ON omfome_avaliacoes;
CREATE POLICY "update_own_omfome_avaliacao" ON omfome_avaliacoes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_omfome_avaliacoes_restaurante ON omfome_avaliacoes(restaurante_id);
