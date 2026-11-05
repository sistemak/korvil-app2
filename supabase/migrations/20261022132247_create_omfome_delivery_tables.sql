/*
# K-OMFOME Delivery tables

Creates tables for the food delivery module (iFood-style).
1. New Tables:
- `omfome_restaurantes`: Restaurant registry with logo, rating, delivery time, fee
- `omfome_cardapio`: Menu items per restaurant (name, desc, price, category, image)
- `omfome_pedidos`: Food delivery orders with status flow
2. Security
- RLS enabled on all tables
- SELECT public (anon+authenticated) for restaurantes and cardapio
- pedidos owner-scoped (authenticated only)
*/

CREATE TABLE IF NOT EXISTS omfome_restaurantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  logo_url text,
  banner_url text,
  categoria text NOT NULL DEFAULT 'Marmitex',
  nota numeric NOT NULL DEFAULT 4.5,
  tempo_entrega text NOT NULL DEFAULT '30-45 min',
  taxa_entrega numeric NOT NULL DEFAULT 5.00,
  frete_gratis boolean NOT NULL DEFAULT false,
  cupom text,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE omfome_restaurantes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_restaurantes" ON omfome_restaurantes;
CREATE POLICY "select_all_restaurantes" ON omfome_restaurantes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_restaurantes_adm" ON omfome_restaurantes;
CREATE POLICY "insert_restaurantes_adm" ON omfome_restaurantes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_restaurantes_adm" ON omfome_restaurantes;
CREATE POLICY "update_restaurantes_adm" ON omfome_restaurantes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS omfome_cardapio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurante_id uuid NOT NULL REFERENCES omfome_restaurantes(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  preco numeric NOT NULL DEFAULT 0,
  categoria text NOT NULL DEFAULT 'Principal',
  imagem_url text,
  disponivel boolean NOT NULL DEFAULT true,
  destaque boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE omfome_cardapio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_all_cardapio" ON omfome_cardapio;
CREATE POLICY "select_all_cardapio" ON omfome_cardapio FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_cardapio_adm" ON omfome_cardapio;
CREATE POLICY "insert_cardapio_adm" ON omfome_cardapio FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_cardapio_adm" ON omfome_cardapio;
CREATE POLICY "update_cardapio_adm" ON omfome_cardapio FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS omfome_pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurante_id uuid REFERENCES omfome_restaurantes(id) ON DELETE SET NULL,
  order_code text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  total numeric NOT NULL DEFAULT 0,
  taxa_entrega numeric NOT NULL DEFAULT 0,
  endereco text,
  status text NOT NULL DEFAULT 'recebido',
  pix_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE omfome_pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_omfome_pedidos" ON omfome_pedidos;
CREATE POLICY "select_own_omfome_pedidos" ON omfome_pedidos FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_omfome_pedidos" ON omfome_pedidos;
CREATE POLICY "insert_own_omfome_pedidos" ON omfome_pedidos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_omfome_pedidos" ON omfome_pedidos;
CREATE POLICY "update_own_omfome_pedidos" ON omfome_pedidos FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_omfome_pedidos" ON omfome_pedidos;
CREATE POLICY "delete_own_omfome_pedidos" ON omfome_pedidos FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_omfome_cardapio_restaurante ON omfome_cardapio(restaurante_id);
CREATE INDEX IF NOT EXISTS idx_omfome_pedidos_user ON omfome_pedidos(user_id);

-- Seed initial restaurants
INSERT INTO omfome_restaurantes (nome, categoria, nota, tempo_entrega, taxa_entrega, frete_gratis, descricao) VALUES
  ('Korvil Marmitex', 'Marmitex', 4.8, '25-40 min', 4.99, true, 'Marmitex caseiro com comida brasileira'),
  ('Sushi Oriental Korvil', 'Oriental', 4.7, '30-50 min', 6.99, false, 'Sushi e temaki frescos'),
  ('Burguer K-TP', 'Lanches', 4.9, '20-35 min', 3.99, true, 'Hamburgares artesanais'),
  ('Pizza Korvil', 'Pizzas', 4.6, '35-55 min', 5.99, false, 'Pizzas artesanais forno a lenha'),
  ('Pastelaria Sao Judas', 'Pasteis', 4.5, '15-30 min', 2.99, true, 'Pasteis frescos e sucos'),
  ('Doce Korvil', 'Sobremesas', 4.9, '20-35 min', 3.49, false, 'Sobremesas artesanais'),
  ('HotDog Korvil', 'HotDog', 4.4, '20-30 min', 2.49, true, 'Hot dogs especiais'),
  ('Bebidas Korvil Express', 'Bebidas', 4.3, '10-20 min', 1.99, true, 'Bebidas geladas entrega rapida'),
  ('Bar Korvil', 'Alcoolicas', 4.7, '25-40 min', 7.99, false, 'Drinks e cervejas artesanais')
ON CONFLICT DO NOTHING;

-- Seed menu items
INSERT INTO omfome_cardapio (restaurante_id, nome, descricao, preco, categoria, destaque) VALUES
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Korvil Marmitex'), 'Marmitex P', 'Arroz, feijao, carne, salada', 12.90, 'Principal', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Korvil Marmitex'), 'Marmitex M', 'Arroz, feijao, carne, 2 saladas, farofa', 16.90, 'Principal', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Korvil Marmitex'), 'Marmitex G', 'Arroz, feijao, carne, 3 salidas, ovo, farofa', 19.90, 'Principal', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Korvil Marmitex'), 'Refrigerante Lata', 'Coca, Guaranas ou Sprite', 5.00, 'Bebidas', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Sushi Oriental Korvil'), 'Combinado 12 pecas', '12 sushis variados', 32.90, 'Combos', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Sushi Oriental Korvil'), 'Temaki Salmon', 'Temaki de salmao fresco', 18.90, 'Temaki', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Sushi Oriental Korvil'), 'Yakisoba', 'Yakisoba de carne ou frango', 28.90, 'Quentes', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Burguer K-TP'), 'Burger Classico', 'Pao, carne 120g, queijo, alface, tomate', 18.90, 'Burgers', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Burguer K-TP'), 'Burger Duplo', '2 carnes 120g, queijo duplo, bacon', 24.90, 'Burgers', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Burguer K-TP'), 'Batata Frita G', 'Batata frita grande com cheddar', 12.90, 'Acompanhamentos', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Pizza Korvil'), 'Pizza Margherita', 'Molho, mussarela, manjericao', 39.90, 'Pizzas', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Pizza Korvil'), 'Pizza Calabresa', 'Calabresa, cebola, mussarela', 42.90, 'Pizzas', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Pizza Korvil'), 'Pizza Portuguesa', 'Presunto, ovo, cebola, ervilha, mussarela', 45.90, 'Pizzas', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Pastelaria Sao Judas'), 'Pastel de Carne', 'Pastel fresco de carne moída', 8.90, 'Pasteis', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Pastelaria Sao Judas'), 'Pastel de Queijo', 'Pastel fresco de queijo', 7.90, 'Pasteis', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Pastelaria Sao Judas'), 'Suco Natural', 'Laranja, abacaxi ou maracuja', 6.90, 'Bebidas', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Doce Korvil'), 'Pudim', 'Pudim de leite condensado', 9.90, 'Sobremesas', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Doce Korvil'), 'Brigadeiro Gourmet', 'Brigadeiro belga', 6.90, 'Sobremesas', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'HotDog Korvil'), 'Hot Dog Especial', 'Pao, salsicha, molhos, batata palha', 12.90, 'HotDog', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'HotDog Korvil'), 'Hot Dog Duplo', '2 salsichas, queijo, bacon', 16.90, 'HotDog', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Bebidas Korvil Express'), 'Coca 2L', 'Coca-Cola 2 litros gelada', 9.90, 'Refrigerantes', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Bebidas Korvil Express'), 'Agua Mineral 500ml', 'Agua mineral sem gas', 3.50, 'Aguas', false),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Bar Korvil'), 'Caipirinha', 'Caipirinha de limao com cachaca', 15.90, 'Drinks', true),
  ((SELECT id FROM omfome_restaurantes WHERE nome = 'Bar Korvil'), 'Cerveja Long Neck', 'Cerveja artesanal 330ml', 8.90, 'Cervejas', false)
ON CONFLICT DO NOTHING;
