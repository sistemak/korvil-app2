/*
# Push notifications and activity queue

1. New Tables
- `atividade_eventos`: queue of everything that happens in the KORVIL app (new sign-ups, orders, weights, enrollments, edits). Each row has a title, a message, its source table and the time it was sent to the phones (`enviado_at`, empty until sent).
- `push_vapid`: the server-side key pair that identifies this app to the phone push services. Single row. Only the server can read it.

2. Modified Tables
- `push_subscriptions` (phone notification registrations): only official admin accounts can register a phone now. The insert rule checks the admin e-mail from the session.

3. Security
- RLS enabled on `atividade_eventos` and `push_vapid` with no policies for public or signed-in users, so only the server (service role) can read or change them.
- `push_subscriptions` keeps the existing own-row select and delete rules; insert and update require an admin account.

4. Notes
- Existing data is not changed.
- The public key used by phones to subscribe is returned by the notification function, never stored in client code.
*/

CREATE TABLE IF NOT EXISTS push_vapid (
  id integer PRIMARY KEY CHECK (id = 1),
  public_key text NOT NULL,
  private_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE push_vapid ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON push_vapid FROM anon, authenticated;
GRANT SELECT, INSERT ON push_vapid TO service_role;

CREATE TABLE IF NOT EXISTS atividade_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  corpo text NOT NULL,
  origem text NOT NULL,
  url text NOT NULL DEFAULT '/',
  created_at timestamptz NOT NULL DEFAULT now(),
  enviado_at timestamptz
);

CREATE INDEX IF NOT EXISTS atividade_eventos_pendentes_idx ON atividade_eventos (created_at) WHERE enviado_at IS NULL;

ALTER TABLE atividade_eventos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON atividade_eventos FROM anon, authenticated;
GRANT SELECT, UPDATE ON atividade_eventos TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_endpoint_key ON push_subscriptions (endpoint);

DROP POLICY IF EXISTS "insert_own_push_subscriptions" ON push_subscriptions;
CREATE POLICY "insert_own_push_subscriptions" ON push_subscriptions FOR INSERT
TO authenticated WITH CHECK (
  auth.uid() = user_id
  AND lower(auth.jwt() ->> 'email') IN (
    'korvilloja@gmail.com', 'korvil.p@gmail.com', 'sistemak.srv@gmail.com', 'saydavid02@gmail.com',
    'saykorvil@gmail.com', 'kalmacdc@gmail.com', 'kafortunado@gmail.com', 'korvil.tp@gmail.com'
  )
);

DROP POLICY IF EXISTS "update_own_push_subscriptions" ON push_subscriptions;
CREATE POLICY "update_own_push_subscriptions" ON push_subscriptions FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND lower(auth.jwt() ->> 'email') IN (
    'korvilloja@gmail.com', 'korvil.p@gmail.com', 'sistemak.srv@gmail.com', 'saydavid02@gmail.com',
    'saykorvil@gmail.com', 'kalmacdc@gmail.com', 'kafortunado@gmail.com', 'korvil.tp@gmail.com'
  )
)
WITH CHECK (
  auth.uid() = user_id
  AND lower(auth.jwt() ->> 'email') IN (
    'korvilloja@gmail.com', 'korvil.p@gmail.com', 'sistemak.srv@gmail.com', 'saydavid02@gmail.com',
    'saykorvil@gmail.com', 'kalmacdc@gmail.com', 'kafortunado@gmail.com', 'korvil.tp@gmail.com'
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;
GRANT SELECT, DELETE ON push_subscriptions TO service_role;
