/*
# Create K-EDITOR social accounts

1. New Tables
- `k_editor_social_accounts`
- `id`: unique account record identifier.
- `user_id`: signed-in Korvil user who owns the connection.
- `platform`: social network identifier.
- `username`: display name returned by the connection flow.
- `status`: connection status managed by the integration.
- `created_at`, `updated_at`: audit timestamps.

2. Security
- Row-level security is enabled.
- Only the signed-in owner can read, create, update, or delete their own account rows.
- The browser never stores social-network passwords in this table.

3. Important Notes
- This table stores account metadata only. Real OAuth tokens must be kept server-side by the future social publishing integration.
- Existing project and Transformação tables are not modified.
*/

CREATE TABLE IF NOT EXISTS public.k_editor_social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'youtube', 'kwai', 'facebook', 'other')),
  username text NOT NULL,
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'pending', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS k_editor_social_accounts_user_id_idx
  ON public.k_editor_social_accounts(user_id);

ALTER TABLE public.k_editor_social_accounts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.k_editor_social_accounts TO authenticated;

DROP POLICY IF EXISTS "select_own_k_editor_accounts" ON public.k_editor_social_accounts;
CREATE POLICY "select_own_k_editor_accounts" ON public.k_editor_social_accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_k_editor_accounts" ON public.k_editor_social_accounts;
CREATE POLICY "insert_own_k_editor_accounts" ON public.k_editor_social_accounts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_k_editor_accounts" ON public.k_editor_social_accounts;
CREATE POLICY "update_own_k_editor_accounts" ON public.k_editor_social_accounts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_k_editor_accounts" ON public.k_editor_social_accounts;
CREATE POLICY "delete_own_k_editor_accounts" ON public.k_editor_social_accounts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);