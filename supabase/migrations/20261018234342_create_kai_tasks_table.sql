/*
# Create kai_tasks table

1. New Tables
- `kai_tasks`: recurring/one-off tasks dictated by the user to the K-AI assistant.
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to the authenticated user, references auth.users)
  - `title` (text, not null): the task description, e.g. "todo dia atualização do sistema X"
  - `status` (text, not null, default 'pending'): 'pending' = waiting to be published, 'done' = already processed on publish
  - `result` (text, nullable): what happened when the task was published/processed
  - `published_at` (timestamptz, nullable): when the task was actually executed via publish
  - `created_at` (timestamptz, not null, default now())
2. Security
- Enable RLS on `kai_tasks`.
- Owner-scoped CRUD: each authenticated user sees and manages only their own tasks.
3. Notes
- Tasks are saved immediately when created; they only take effect on the app when the user clicks "Publicar projeto".
*/

CREATE TABLE IF NOT EXISTS kai_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  result text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kai_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_kai_tasks" ON kai_tasks;
CREATE POLICY "select_own_kai_tasks" ON kai_tasks FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_kai_tasks" ON kai_tasks;
CREATE POLICY "insert_own_kai_tasks" ON kai_tasks FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_kai_tasks" ON kai_tasks;
CREATE POLICY "update_own_kai_tasks" ON kai_tasks FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_kai_tasks" ON kai_tasks;
CREATE POLICY "delete_own_kai_tasks" ON kai_tasks FOR DELETE
TO authenticated USING (auth.uid() = user_id);