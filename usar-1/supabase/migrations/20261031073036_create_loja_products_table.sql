/*
# Create loja_products table (KORVIL Loja catalog)

1. New Tables
- `loja_products`: one row per product shown in the KORVIL Loja.
  - Identity and classification: `id` (text, primary key), `sector`, `category`, `subcategory`, `brand`, `name`.
  - Commercial data: `price`, `installment`, `shipping`, `seller`.
  - Social data: `rating`, `reviews`.
  - Media and text: `image`, `images` (list), `video`, `description`.
  - Options and search: `variations` (list of option groups), `tags` (list).
  - `updated_at` timestamp, set on every change.

2. Security
- Enable RLS on `loja_products`.
- Anyone (anon and authenticated) can read products, because the catalog is public.
- Only the official admin accounts listed in the app can insert, update or delete products. The check uses the signed-in user's e-mail from the session token.

3. Notes
- The catalog is seeded the first time an admin opens the store (the app uploads the bundled list when the table is empty).
- No existing data is changed or removed.
*/

CREATE TABLE IF NOT EXISTS loja_products (
  id text PRIMARY KEY,
  sector text NOT NULL,
  category text NOT NULL,
  subcategory text NOT NULL,
  name text NOT NULL,
  brand text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  installment text NOT NULL DEFAULT '',
  shipping text NOT NULL DEFAULT '',
  rating numeric(3,2) NOT NULL DEFAULT 0,
  reviews integer NOT NULL DEFAULT 0,
  seller text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  video text,
  description text NOT NULL DEFAULT '',
  variations jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS loja_products_sector_idx ON loja_products (sector, category, subcategory);

ALTER TABLE loja_products ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON loja_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON loja_products TO authenticated;

DROP POLICY IF EXISTS "loja_products_select_all" ON loja_products;
CREATE POLICY "loja_products_select_all" ON loja_products FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "loja_products_insert_admin" ON loja_products;
CREATE POLICY "loja_products_insert_admin" ON loja_products FOR INSERT
TO authenticated WITH CHECK (
  lower(auth.jwt() ->> 'email') IN (
    'korvilloja@gmail.com', 'korvil.p@gmail.com', 'sistemak.srv@gmail.com', 'saydavid02@gmail.com',
    'saykorvil@gmail.com', 'kalmacdc@gmail.com', 'kafortunado@gmail.com', 'korvil.tp@gmail.com'
  )
);

DROP POLICY IF EXISTS "loja_products_update_admin" ON loja_products;
CREATE POLICY "loja_products_update_admin" ON loja_products FOR UPDATE
TO authenticated
USING (
  lower(auth.jwt() ->> 'email') IN (
    'korvilloja@gmail.com', 'korvil.p@gmail.com', 'sistemak.srv@gmail.com', 'saydavid02@gmail.com',
    'saykorvil@gmail.com', 'kalmacdc@gmail.com', 'kafortunado@gmail.com', 'korvil.tp@gmail.com'
  )
)
WITH CHECK (
  lower(auth.jwt() ->> 'email') IN (
    'korvilloja@gmail.com', 'korvil.p@gmail.com', 'sistemak.srv@gmail.com', 'saydavid02@gmail.com',
    'saykorvil@gmail.com', 'kalmacdc@gmail.com', 'kafortunado@gmail.com', 'korvil.tp@gmail.com'
  )
);

DROP POLICY IF EXISTS "loja_products_delete_admin" ON loja_products;
CREATE POLICY "loja_products_delete_admin" ON loja_products FOR DELETE
TO authenticated USING (
  lower(auth.jwt() ->> 'email') IN (
    'korvilloja@gmail.com', 'korvil.p@gmail.com', 'sistemak.srv@gmail.com', 'saydavid02@gmail.com',
    'saykorvil@gmail.com', 'kalmacdc@gmail.com', 'kafortunado@gmail.com', 'korvil.tp@gmail.com'
  )
);
