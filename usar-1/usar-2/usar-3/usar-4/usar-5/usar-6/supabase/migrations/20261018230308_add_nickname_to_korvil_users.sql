/*
# Add nickname to korvil_users

1. Modified Tables
- `korvil_users`: new column `nickname` (text, nullable) — how the user wants to be called.
  The K-AI addresses the user by this nickname; if empty, it falls back to the first name.
2. Security
- No policy changes: the column inherits the existing owner-scoped RLS (each user reads/updates only their own row).
3. Notes
- Nullable on purpose: nickname is optional. Existing rows keep working with NULL.
*/

ALTER TABLE korvil_users ADD COLUMN IF NOT EXISTS nickname text;