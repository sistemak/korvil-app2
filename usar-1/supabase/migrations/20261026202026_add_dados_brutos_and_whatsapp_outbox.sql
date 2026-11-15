/*
# Add dados_brutos to inscricoes + create whatsapp_outbox

1. Modified Tables
- `projeto_transformacao_inscricoes`
  - Add column `dados_brutos` (jsonb, default '{}'::jsonb): full raw dump of the form exactly as the person filled it, for fidelity.

2. New Tables
- `whatsapp_outbox`
  - Fallback queue for WhatsApp messages that could not be sent via WhatsApp Cloud API (no WHATSAPP_TOKEN configured).
  - `id` (uuid, primary key)
  - `destinatario` (text, phone number in international format, digits only)
  - `mensagem` (text, formatted message body)
  - `payload` (jsonb, full original payload sent by the caller)
  - `status` (text, default 'pending': pending | sent | failed)
  - `origem` (text, which feature produced this message, e.g. 'transformacao')
  - `tentativas` (int, default 0)
  - `erro` (text, nullable, last error message if any)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

3. Security
- `projeto_transformacao_inscricoes`: no new policies needed; the new column is covered by the existing open CRUD policies.
- `whatsapp_outbox`: Enable RLS. Grant CRUD to `anon, authenticated` and to `service_role` (the edge function uses the service role key to insert fallback messages). Open CRUD policies because the edge function writes via service_role (which bypasses RLS anyway) and the app does not need to read this table directly; the policies exist so the table is reachable.
*/

ALTER TABLE projeto_transformacao_inscricoes
  ADD COLUMN IF NOT EXISTS dados_brutos jsonb DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS whatsapp_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destinatario text NOT NULL,
  mensagem text NOT NULL,
  payload jsonb,
  status text NOT NULL DEFAULT 'pending',
  origem text,
  tentativas integer NOT NULL DEFAULT 0,
  erro text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE whatsapp_outbox ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON whatsapp_outbox TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "anon_select_whatsapp_outbox" ON whatsapp_outbox;
CREATE POLICY "anon_select_whatsapp_outbox"
  ON whatsapp_outbox FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_whatsapp_outbox" ON whatsapp_outbox;
CREATE POLICY "anon_insert_whatsapp_outbox"
  ON whatsapp_outbox FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_whatsapp_outbox" ON whatsapp_outbox;
CREATE POLICY "anon_update_whatsapp_outbox"
  ON whatsapp_outbox FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_whatsapp_outbox" ON whatsapp_outbox;
CREATE POLICY "anon_delete_whatsapp_outbox"
  ON whatsapp_outbox FOR DELETE
  TO anon, authenticated USING (true);
