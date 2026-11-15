/*
# Activity triggers that feed phone notifications

1. Functions
- `registrar_atividade()`: writes a readable message (title, text, link) into `atividade_eventos` whenever one of the watched actions happens. Weights, for example, produce: "Magda Gomes dos Santos registrou peso 55kg hoje às 04h00 no cronograma dele(a) no Projeto TRANSFORMAÇÃO."
- `disparar_notificacao_atividade()`: right after a new event is written, calls the notification function so the phone gets the alert within seconds. Failures never block the user action.

2. Watched actions
- Projeto TRANSFORMAÇÃO: weight registered and edited, new enrollment, GIF uploaded, week marked as done.
- KORVIL App: new account sign-up.
- KORVIL Loja: new order, product edited by an admin, new review, new question.
- OMFOME: new order.
- Courses: new enrollment.
- S.O.K: new file.
- K-AI: activity log entries.

3. Scheduling
- Cron job `notificar-atividade-tick` runs every 30 seconds and retries any event not yet sent (for example when a phone was offline or the first call failed).

4. Security
- Trigger functions cannot be called by public or signed-in users.
- Notifications are only sent to phones registered by admin accounts.

5. Notes
- Triggers never change the data they watch; they only add rows to the notification queue.
- Form autosaves of the Projeto TRANSFORMAÇÃO file are not notified, to avoid repeated alerts while typing.
*/

CREATE OR REPLACE FUNCTION public.registrar_atividade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row jsonb := to_jsonb(NEW);
  v_ator text;
  v_titulo text;
  v_corpo text;
  v_url text := '/';
  v_hora text;
BEGIN
  BEGIN
    v_ator := COALESCE(
      (SELECT nome FROM projeto_transformacao_alunos WHERE aluno_id = v_row->>'aluno_id' LIMIT 1),
      (SELECT full_name FROM korvil_users WHERE id = NULLIF(v_row->>'user_id', '')::uuid),
      NULLIF(v_row->>'user_name', ''),
      NULLIF(v_row->>'full_name', ''),
      NULLIF(v_row->>'nome', ''),
      'Alguém'
    );
    v_hora := to_char(COALESCE((v_row->>'data_registro')::timestamptz, now()) AT TIME ZONE 'America/Sao_Paulo', 'HH24"h"MI');

    CASE TG_TABLE_NAME || ':' || TG_OP
      WHEN 'projeto_transformacao_pesos:INSERT' THEN
        v_titulo := 'Peso registrado - Projeto TRANSFORMAÇÃO';
        v_corpo := format('%s registrou peso %skg hoje às %s no cronograma dele(a) no Projeto TRANSFORMAÇÃO.', v_ator, (v_row->>'peso')::numeric::text, v_hora);
        v_url := '/?secao=ktp';
      WHEN 'projeto_transformacao_pesos:UPDATE' THEN
        v_titulo := 'Peso editado - Projeto TRANSFORMAÇÃO';
        v_corpo := format('%s alterou o peso para %skg no cronograma no Projeto TRANSFORMAÇÃO.', v_ator, (v_row->>'peso')::numeric::text);
        v_url := '/?secao=ktp';
      WHEN 'projeto_transformacao_inscricoes:INSERT' THEN
        v_titulo := 'Nova inscrição - Projeto TRANSFORMAÇÃO';
        v_corpo := format('%s se inscreveu no Projeto TRANSFORMAÇÃO.', v_ator);
        v_url := '/?secao=ktp';
      WHEN 'projeto_transformacao_alunos:UPDATE' THEN
        v_titulo := 'Novo GIF enviado - Projeto TRANSFORMAÇÃO';
        v_corpo := format('%s enviou um novo GIF no cronograma.', v_ator);
        v_url := '/?secao=ktp';
      WHEN 'projeto_transformacao_semanas_cumpridas:INSERT' THEN
        v_titulo := 'Semana cumprida - Projeto TRANSFORMAÇÃO';
        v_corpo := format('%s marcou a semana %s como cumprida.', v_ator, v_row->>'semana_iso');
        v_url := '/?secao=ktp';
      WHEN 'korvil_users:INSERT' THEN
        v_titulo := 'Novo cadastro no KORVIL App';
        v_corpo := format('%s criou uma conta (%s).', v_ator, COALESCE(v_row->>'email', 'sem e-mail'));
      WHEN 'pedidos:INSERT' THEN
        v_titulo := 'Novo pedido na KORVIL Loja';
        v_corpo := format('%s fez o pedido %s no valor de R$ %s.', v_ator, v_row->>'order_code', v_row->>'total');
        v_url := '/?secao=loja';
      WHEN 'omfome_pedidos:INSERT' THEN
        v_titulo := 'Novo pedido no OMFOME';
        v_corpo := format('%s fez o pedido %s no valor de R$ %s.', v_ator, v_row->>'order_code', v_row->>'total');
      WHEN 'korvil_cursos_matriculas:INSERT' THEN
        v_titulo := 'Nova matrícula em curso';
        v_corpo := format('%s se matriculou no curso %s.', v_ator, v_row->>'curso_titulo');
      WHEN 'avaliacoes:INSERT' THEN
        v_titulo := 'Nova avaliação na KORVIL Loja';
        v_corpo := format('%s avaliou um produto com %s estrela(s).', v_ator, v_row->>'rating');
        v_url := '/?secao=loja';
      WHEN 'perguntas:INSERT' THEN
        v_titulo := 'Nova pergunta na KORVIL Loja';
        v_corpo := format('%s fez uma pergunta: %s', v_ator, COALESCE(v_row->>'question', ''));
        v_url := '/?secao=loja';
      WHEN 'arquivos:INSERT' THEN
        v_titulo := 'Novo arquivo no S.O.K';
        v_corpo := format('Arquivo "%s" enviado para o setor %s.', v_row->>'nome', v_row->>'setor');
      WHEN 'kai_activity:INSERT' THEN
        v_titulo := 'Atividade no K-AI';
        v_corpo := format('%s: %s', v_ator, COALESCE(v_row->>'summary', v_row->>'action', ''));
      WHEN 'loja_products:UPDATE' THEN
        v_titulo := 'Produto editado na KORVIL Loja';
        v_corpo := format('Um administrador editou o produto "%s".', v_row->>'name');
        v_url := '/?secao=loja';
      ELSE
        NULL;
    END CASE;

    IF v_titulo IS NOT NULL THEN
      INSERT INTO atividade_eventos (titulo, corpo, origem, url)
      VALUES (v_titulo, v_corpo, TG_TABLE_NAME, v_url);
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'registrar_atividade falhou em %: %', TG_TABLE_NAME, SQLERRM;
  END;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.registrar_atividade() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.disparar_notificacao_atividade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://odzkohspsdxpolsydtbt.supabase.co/functions/v1/notificar-atividade',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := '{}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'disparar_notificacao_atividade falhou: %', SQLERRM;
  END;
  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.disparar_notificacao_atividade() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_atividade_pesos_insert ON projeto_transformacao_pesos;
CREATE TRIGGER trg_atividade_pesos_insert AFTER INSERT ON projeto_transformacao_pesos
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_pesos_update ON projeto_transformacao_pesos;
CREATE TRIGGER trg_atividade_pesos_update AFTER UPDATE ON projeto_transformacao_pesos
FOR EACH ROW WHEN (OLD.peso IS DISTINCT FROM NEW.peso)
EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_inscricoes_insert ON projeto_transformacao_inscricoes;
CREATE TRIGGER trg_atividade_inscricoes_insert AFTER INSERT ON projeto_transformacao_inscricoes
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_alunos_gif ON projeto_transformacao_alunos;
CREATE TRIGGER trg_atividade_alunos_gif AFTER UPDATE ON projeto_transformacao_alunos
FOR EACH ROW WHEN (NEW.gif_url IS NOT NULL AND OLD.gif_url IS DISTINCT FROM NEW.gif_url)
EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_semanas_insert ON projeto_transformacao_semanas_cumpridas;
CREATE TRIGGER trg_atividade_semanas_insert AFTER INSERT ON projeto_transformacao_semanas_cumpridas
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_korvil_users_insert ON korvil_users;
CREATE TRIGGER trg_atividade_korvil_users_insert AFTER INSERT ON korvil_users
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_pedidos_insert ON pedidos;
CREATE TRIGGER trg_atividade_pedidos_insert AFTER INSERT ON pedidos
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_omfome_pedidos_insert ON omfome_pedidos;
CREATE TRIGGER trg_atividade_omfome_pedidos_insert AFTER INSERT ON omfome_pedidos
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_matriculas_insert ON korvil_cursos_matriculas;
CREATE TRIGGER trg_atividade_matriculas_insert AFTER INSERT ON korvil_cursos_matriculas
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_avaliacoes_insert ON avaliacoes;
CREATE TRIGGER trg_atividade_avaliacoes_insert AFTER INSERT ON avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_perguntas_insert ON perguntas;
CREATE TRIGGER trg_atividade_perguntas_insert AFTER INSERT ON perguntas
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_arquivos_insert ON arquivos;
CREATE TRIGGER trg_atividade_arquivos_insert AFTER INSERT ON arquivos
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_kai_activity_insert ON kai_activity;
CREATE TRIGGER trg_atividade_kai_activity_insert AFTER INSERT ON kai_activity
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_atividade_loja_products_update ON loja_products;
CREATE TRIGGER trg_atividade_loja_products_update AFTER UPDATE ON loja_products
FOR EACH ROW EXECUTE FUNCTION public.registrar_atividade();

DROP TRIGGER IF EXISTS trg_disparar_atividade ON atividade_eventos;
CREATE TRIGGER trg_disparar_atividade AFTER INSERT ON atividade_eventos
FOR EACH ROW EXECUTE FUNCTION public.disparar_notificacao_atividade();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'notificar-atividade-tick') THEN
    PERFORM cron.schedule(
      'notificar-atividade-tick',
      '30 seconds',
      $cron$
      SELECT net.http_post(
        url := 'https://odzkohspsdxpolsydtbt.supabase.co/functions/v1/notificar-atividade',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body := '{}'::jsonb
      );
      $cron$
    );
  END IF;
END $$;
