/*
# Korvil Loja marketplace tables

Creates tables for orders, favorites, reviews, questions, and addresses
to make the loja function like a real marketplace (Mercado Livre style).

1. New Tables
- `pedidos`: Order records with status tracking (aguardando/pago/enviado/entregue)
- `favoritos`: User favorite products
- `avaliacoes`: Product reviews with 1-5 star rating + comment
- `perguntas`: Product questions and answers (K-AI responds as seller)
- `enderecos`: Saved delivery addresses per user

2. Security
- All tables have RLS enabled
- Owner-scoped CRUD policies (TO authenticated) since the loja has auth
- user_id columns default to auth.uid() for seamless inserts
*/

-- Pedidos (orders)
CREATE TABLE IF NOT EXISTS pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  order_code text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  total numeric NOT NULL DEFAULT 0,
  freight numeric NOT NULL DEFAULT 0,
  coupon text,
  delivery_mode text NOT NULL DEFAULT 'entrega',
  address jsonb,
  status text NOT NULL DEFAULT 'aguardando',
  pix_code text,
  bank_used text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_pedidos" ON pedidos;
CREATE POLICY "select_own_pedidos" ON pedidos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_pedidos" ON pedidos;
CREATE POLICY "insert_own_pedidos" ON pedidos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_pedidos" ON pedidos;
CREATE POLICY "update_own_pedidos" ON pedidos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_pedidos" ON pedidos;
CREATE POLICY "delete_own_pedidos" ON pedidos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Favoritos (favorites)
CREATE TABLE IF NOT EXISTS favoritos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favoritos" ON favoritos;
CREATE POLICY "select_own_favoritos" ON favoritos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favoritos" ON favoritos;
CREATE POLICY "insert_own_favoritos" ON favoritos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_favoritos" ON favoritos;
CREATE POLICY "update_own_favoritos" ON favoritos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favoritos" ON favoritos;
CREATE POLICY "delete_own_favoritos" ON favoritos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Avaliacoes (product reviews)
CREATE TABLE IF NOT EXISTS avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  user_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_avaliacoes" ON avaliacoes;
CREATE POLICY "select_all_avaliacoes" ON avaliacoes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_avaliacoes" ON avaliacoes;
CREATE POLICY "insert_own_avaliacoes" ON avaliacoes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_avaliacoes" ON avaliacoes;
CREATE POLICY "update_own_avaliacoes" ON avaliacoes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_avaliacoes" ON avaliacoes;
CREATE POLICY "delete_own_avaliacoes" ON avaliacoes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Perguntas (product Q&A)
CREATE TABLE IF NOT EXISTS perguntas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  question text NOT NULL,
  answer text,
  user_name text,
  answered boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  answered_at timestamptz
);

ALTER TABLE perguntas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_perguntas" ON perguntas;
CREATE POLICY "select_all_perguntas" ON perguntas FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_perguntas" ON perguntas;
CREATE POLICY "insert_own_perguntas" ON perguntas FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_perguntas" ON perguntas;
CREATE POLICY "update_own_perguntas" ON perguntas FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_perguntas" ON perguntas;
CREATE POLICY "delete_own_perguntas" ON perguntas FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Enderecos (saved delivery addresses)
CREATE TABLE IF NOT EXISTS enderecos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Casa',
  street text NOT NULL,
  number text NOT NULL,
  neighborhood text NOT NULL,
  cep text NOT NULL,
  city text NOT NULL DEFAULT 'São Paulo',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_enderecos" ON enderecos;
CREATE POLICY "select_own_enderecos" ON enderecos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_enderecos" ON enderecos;
CREATE POLICY "insert_own_enderecos" ON enderecos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_enderecos" ON enderecos;
CREATE POLICY "update_own_enderecos" ON enderecos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_enderecos" ON enderecos;
CREATE POLICY "delete_own_enderecos" ON enderecos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pedidos_user_id ON pedidos(user_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_favoritos_user_id ON favoritos(user_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_product_id ON avaliacoes(product_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_product_id ON perguntas(product_id);
CREATE INDEX IF NOT EXISTS idx_enderecos_user_id ON enderecos(user_id);
