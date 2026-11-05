/*
# Create ficha de inscrição table for Projeto Transformação students

1. New Tables
- `projeto_transformacao_fichas`
  - `aluno_id` (text, primary key): the student ID used to log in (for example `mag1`).
  - `dados` (jsonb, not null): the full registration form of the student, grouped in the same sections as the registration message (plan, personal data, address, anamnesis, answers and status).
  - `updated_at` (timestamptz): last time the form was saved.

2. Security
- Row level security is enabled and NO policies are created, so the browser (anon and authenticated roles) cannot read or write this table directly.
- Only the server-side edge function (service_role) can read these forms, and it returns one student's form at a time.

3. Important notes
- This migration only creates the table; the student data is inserted separately.
- Re-running this migration is safe: the table and grants use IF NOT EXISTS / idempotent statements.
*/

CREATE TABLE IF NOT EXISTS projeto_transformacao_fichas (
  aluno_id text PRIMARY KEY,
  dados jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projeto_transformacao_fichas ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON projeto_transformacao_fichas TO service_role;
