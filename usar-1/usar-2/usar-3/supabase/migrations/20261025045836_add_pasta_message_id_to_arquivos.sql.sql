/*
# Add pasta and message_id columns to arquivos (K-B.D topics)

1. Modified Tables
- `arquivos`
  - `pasta` (text, nullable) — category bucket: IMAGENS, VIDEOS, MUSICAS, AUDIOS, DOCUMENTOS
  - `message_id` (bigint, nullable) — Telegram message ID in the KBD group topic thread

2. Security
- No RLS policy changes; existing policies cover the new columns (no column-level restrictions).

3. Notes
- The KBD group (-1004309623076) uses topics (message threads) per setor.
- `pasta` is derived from filename + mime type at upload time.
- Existing rows get NULL pasta/message_id; the frontend falls back to deriving pasta from `tipo` + `nome`.
*/

ALTER TABLE arquivos
  ADD COLUMN IF NOT EXISTS pasta text,
  ADD COLUMN IF NOT EXISTS message_id bigint;

-- Backfill pasta for existing rows based on tipo
UPDATE arquivos
SET pasta = CASE
  WHEN tipo ~* '^image/' THEN 'IMAGENS'
  WHEN tipo ~* '^video/' THEN 'VIDEOS'
  WHEN tipo ~* '^audio/' THEN
    CASE WHEN nome ~* '\.(ogg|opus)$' OR tipo ~* 'ogg|opus|voice' THEN 'AUDIOS' ELSE 'MUSICAS' END
  ELSE 'DOCUMENTOS'
END
WHERE pasta IS NULL;
