/*
# Create K-EDITOR project drafts

1. New Tables
- `k_editor_projects`
- `id`: project identifier.
- `user_id`: signed-in owner, filled from the session.
- `name`: project title.
- `thumbnail_url`: optional selected cover or media preview.
- `duration_seconds`: current timeline duration.
- `project_data`: JSON document containing clips, text, audio, effects and editor settings.
- `created_at`, `updated_at`: draft timestamps.

2. Security
- Row-level security is enabled.
- Only the signed-in owner can read, create, update, or delete their drafts.
- No media credentials or social passwords are stored.

3. Important Notes
- The project document is isolated from the K-TP Transformação project data.
- Media files remain local until a dedicated media-storage flow is connected.
*/

CREATE TABLE IF NOT EXISTS public.k_editor_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Novo Projeto',
  thumbnail_url text,
  duration_seconds numeric NOT NULL DEFAULT 0,
  project_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS k_editor_projects_user_updated_idx
  ON public.k_editor_projects(user_id, updated_at DESC);

ALTER TABLE public.k_editor_projects ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.k_editor_projects TO authenticated;

DROP POLICY IF EXISTS "select_own_k_editor_projects" ON public.k_editor_projects;
CREATE POLICY "select_own_k_editor_projects" ON public.k_editor_projects
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_k_editor_projects" ON public.k_editor_projects;
CREATE POLICY "insert_own_k_editor_projects" ON public.k_editor_projects
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_k_editor_projects" ON public.k_editor_projects;
CREATE POLICY "update_own_k_editor_projects" ON public.k_editor_projects
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_k_editor_projects" ON public.k_editor_projects;
CREATE POLICY "delete_own_k_editor_projects" ON public.k_editor_projects
  FOR DELETE TO authenticated USING (auth.uid() = user_id);