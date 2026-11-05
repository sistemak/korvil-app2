/*
# Schedule K-AI evolution cron job (every 5 minutes)

## Purpose
Sets up a pg_cron job that calls the kai-evolve edge function every 5 minutes.
Each call generates a new K-AI proposal and sends a push notification with SIM/NÃO
action buttons to all subscribed devices.

## Changes
- Inserts a cron job that HTTP-GETs the kai-evolve edge function every 5 minutes
- Creates a kai_provider_health table to track AI provider availability
*/

-- Create provider health tracking table
CREATE TABLE IF NOT EXISTS kai_provider_health (
  id integer PRIMARY KEY DEFAULT 1,
  groq_ok boolean DEFAULT true,
  groq_last_check timestamptz DEFAULT now(),
  gemini_ok boolean DEFAULT true,
  gemini_last_check timestamptz DEFAULT now(),
  pollinations_ok boolean DEFAULT true,
  pollinations_last_check timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE kai_provider_health ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON kai_provider_health TO anon, authenticated;
GRANT SELECT, UPDATE, INSERT, DELETE ON kai_provider_health TO service_role;

DROP POLICY IF EXISTS "read_provider_health" ON kai_provider_health;
CREATE POLICY "read_provider_health" ON kai_provider_health FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "update_provider_health" ON kai_provider_health;
CREATE POLICY "update_provider_health" ON kai_provider_health FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Ensure single row exists
INSERT INTO kai_provider_health (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

-- Schedule the cron job: every 5 minutes, call kai-evolve edge function
-- The edge function generates a proposal + sends push notification
SELECT cron.schedule(
  'kai-evolve-cycle',
  '*/5 * * * *',
  $$
    SELECT net.http_get(
      url := current_setting('app.supabase_url', true) || '/functions/v1/kai-evolve',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      )
    );
  $$
);
