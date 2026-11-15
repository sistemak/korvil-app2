/*
# Create kai_automations table

1. New Tables
- `kai_automations`: lembretes programados do K-AI (Programações > Automações > Lembretes).
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user — dono do lembrete)
  - `title` (text, opcional, título do lembrete)
  - `channels` (jsonb, array de canais escolhidos: whatsapp/email/sms/call)
  - `same_message` (boolean, true = uma mensagem para todos os canais)
  - `message` (text, mensagem única)
  - `messages_by_channel` (jsonb, mensagem separada por canal)
  - `wa_from`, `wa_to`, `wa_to_name` (text, WhatsApp de quem envia / recebe + nome)
  - `email_from`, `email_to` (text, emails)
  - `sms_from`, `sms_to`, `sms_to_name` (text, SMS)
  - `call_from`, `call_to`, `call_to_name` (text, ligação)
  - `scheduled_at` (timestamptz, quando executa)
  - `repeat` (text: once/daily/weekly/monthly/yearly)
  - `weekdays` (jsonb, array de dias da semana 0-6 quando repetir = weekly)
  - `voice_call` (boolean, ativar voz na ligação)
  - `status` (text: pending/sent/failed)
  - `last_error` (text, motivo da falha)
  - `sent_at` (timestamptz, quando foi enviada)
  - `created_at`, `updated_at` (timestamptz)
2. Security
- Enable RLS on `kai_automations`.
- Owner-scoped CRUD: cada usuário vê e mexe só nos próprios lembretes.
3. Notes
- Salvamento automático do formulário grava aqui (update por id) + cópia no aparelho.
*/

CREATE TABLE IF NOT EXISTS kai_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text,
  channels jsonb NOT NULL DEFAULT '[]'::jsonb,
  same_message boolean NOT NULL DEFAULT true,
  message text DEFAULT '',
  messages_by_channel jsonb DEFAULT '{}'::jsonb,
  wa_from text DEFAULT '',
  wa_to text DEFAULT '',
  wa_to_name text DEFAULT '',
  email_from text DEFAULT '',
  email_to text DEFAULT '',
  sms_from text DEFAULT '',
  sms_to text DEFAULT '',
  sms_to_name text DEFAULT '',
  call_from text DEFAULT '',
  call_to text DEFAULT '',
  call_to_name text DEFAULT '',
  scheduled_at timestamptz,
  repeat text NOT NULL DEFAULT 'once',
  weekdays jsonb NOT NULL DEFAULT '[]'::jsonb,
  voice_call boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kai_automations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_automations" ON kai_automations;
CREATE POLICY "select_own_automations" ON kai_automations FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_automations" ON kai_automations;
CREATE POLICY "insert_own_automations" ON kai_automations FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_automations" ON kai_automations;
CREATE POLICY "update_own_automations" ON kai_automations FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_automations" ON kai_automations;
CREATE POLICY "delete_own_automations" ON kai_automations FOR DELETE
TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_kai_automations_user_status
ON kai_automations (user_id, status, scheduled_at);
