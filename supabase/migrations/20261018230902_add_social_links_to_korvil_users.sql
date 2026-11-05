/*
# Add social links to korvil_users

1. Modified Tables
- `korvil_users`: new column `social_links` (jsonb, not null, default '{}'::jsonb).
  Stores a map of social network name -> profile URL, e.g. {"instagram": "https://...", "tiktok": "..."}.
  Lets each user save links for Instagram, TikTok, Facebook, YouTube and others from the profile screen.
2. Security
- No policy changes: the column inherits the existing owner-scoped RLS (each user reads/updates only their own row).
3. Notes
- Default '{}' keeps existing rows working; the app treats a missing network key as "not filled".
*/

ALTER TABLE korvil_users ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb;