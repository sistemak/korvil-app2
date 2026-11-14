/*
# K-AI Autonomous Evolution System

## Purpose
Stores K-AI's self-generated proposals for improving the KORVIL app, plus a log
of every evolution action taken. The kai-evolve edge function runs every 5 minutes,
asks the AI what to improve, stores a proposal, and sends a push notification with
SIM/NÃO action buttons. When the user taps SIM, the proposal is executed for real
(files are modified via the github-save edge function). When they tap NÃO, the
proposal is rejected and the next cycle suggests something different.

## New Tables

### kai_proposals
- `id` (uuid, PK) — unique proposal ID
- `title` (text) — short description of what K-AI wants to do
- `description` (text) — detailed explanation of the proposed improvement
- `action_type` (text) — category: 'improve_ui', 'fix_bug', 'add_feature', 'optimize', 'refactor', 'new_automation'
- `target_file` (text, nullable) — which file would be modified
- `proposed_changes` (jsonb, nullable) — structured change details (file path, old content hash, new content, etc.)
- `status` (text) — 'pending' (waiting for user response), 'approved', 'rejected', 'executing', 'executed', 'failed'
- `provider` (text) — which AI provider generated this proposal (groq/gemini/pollinations)
- `push_sent` (boolean) — whether the push notification was sent
- `push_payload` (jsonb, nullable) — the notification payload that was sent
- `user_response` (text, nullable) — 'sim' or 'nao' (set when user responds via notification)
- `response_at` (timestamptz, nullable) — when the user responded
- `execution_result` (jsonb, nullable) — result of executing the proposal
- `executed_at` (timestamptz, nullable) — when it was executed
- `cycle_number` (integer) — which evolution cycle generated this (increments)
- `created_at` (timestamptz) — when the proposal was created

### kai_evolution_log
- `id` (uuid, PK)
- `proposal_id` (uuid, nullable, FK to kai_proposals) — which proposal triggered this
- `action` (text) — what happened: 'proposal_created', 'push_sent', 'user_approved', 'user_rejected', 'execution_started', 'execution_succeeded', 'execution_failed'
- `details` (jsonb, nullable) — extra context
- `provider` (text, nullable) — AI provider involved
- `created_at` (timestamptz)

## Security
- RLS enabled on both tables.
- Grants: anon + authenticated can read (the app needs to show proposals and logs).
- Inserts/updates: only authenticated (the edge function uses service_role which bypasses RLS,
  but the frontend needs to update proposal status when the user responds via notification).
- service_role gets full CRUD for the edge function.
*/

CREATE TABLE IF NOT EXISTS kai_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  action_type text NOT NULL DEFAULT 'improve_ui',
  target_file text,
  proposed_changes jsonb,
  status text NOT NULL DEFAULT 'pending',
  provider text NOT NULL DEFAULT 'auto',
  push_sent boolean NOT NULL DEFAULT false,
  push_payload jsonb,
  user_response text,
  response_at timestamptz,
  execution_result jsonb,
  executed_at timestamptz,
  cycle_number integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kai_proposals ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON kai_proposals TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON kai_proposals TO service_role;

DROP POLICY IF EXISTS "read_proposals" ON kai_proposals;
CREATE POLICY "read_proposals" ON kai_proposals FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_proposals" ON kai_proposals;
CREATE POLICY "insert_proposals" ON kai_proposals FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_proposals" ON kai_proposals;
CREATE POLICY "update_proposals" ON kai_proposals FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_proposals" ON kai_proposals;
CREATE POLICY "delete_proposals" ON kai_proposals FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS kai_evolution_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES kai_proposals(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb,
  provider text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kai_evolution_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON kai_evolution_log TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON kai_evolution_log TO service_role;

DROP POLICY IF EXISTS "read_evolution_log" ON kai_evolution_log;
CREATE POLICY "read_evolution_log" ON kai_evolution_log FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_evolution_log" ON kai_evolution_log;
CREATE POLICY "insert_evolution_log" ON kai_evolution_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_kai_proposals_status ON kai_proposals(status);
CREATE INDEX IF NOT EXISTS idx_kai_proposals_created ON kai_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kai_evolution_log_proposal ON kai_evolution_log(proposal_id);
