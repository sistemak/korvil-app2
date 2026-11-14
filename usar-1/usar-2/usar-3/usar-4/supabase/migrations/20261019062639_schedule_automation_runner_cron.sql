/*
# Enable pg_cron and pg_net, schedule automation runner

1. Extensions
- Enable `pg_cron` (agendador dentro do banco) e `pg_net` (chamadas HTTP assíncronas).
2. Automation
- Cron job `kai-automation-tick`: roda a cada 59 segundos e chama a edge function
  `kai-automation-runner`, que processa as automações vencidas (envia email via
  Resend, WhatsApp via Evolution API) e atualiza os status — mesmo com o app fechado.
- A rota é pública (verify_jwt=false) e idempotente: marca a automação antes de
  enviar, então chamadas repetidas não duplicam mensagens.
*/

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'kai-automation-tick') THEN
    PERFORM cron.schedule(
      'kai-automation-tick',
      '59 seconds',
      $cron$
      SELECT net.http_post(
        url := 'https://odzkohspsdxpolsydtbt.supabase.co/functions/v1/kai-automation-runner',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body := '{}'::jsonb
      );
      $cron$
    );
  END IF;
END $$;
