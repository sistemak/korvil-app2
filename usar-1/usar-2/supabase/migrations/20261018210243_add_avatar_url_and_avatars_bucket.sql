/*
# Profile photo for KORVIL users

1. Modified Tables
- `korvil_users`: add `avatar_url` (text, nullable) — public URL of the user's profile photo.

2. Storage
- Create bucket `avatars` (public read) if it does not exist.
- RLS on `storage.objects` for the `avatars` bucket:
  - Public read of avatars (the photos are shown in the account icon).
  - Authenticated users can upload/update/delete ONLY inside their own folder `avatars/<auth.uid>/...`.

3. Security
- No data removed; nullable column only.
*/

ALTER TABLE korvil_users ADD COLUMN IF NOT EXISTS avatar_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read (photos appear in the account icon across the app)
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');

-- Owner-scoped writes: only inside avatars/<uid>/ folder
DROP POLICY IF EXISTS "Owner insert avatars" ON storage.objects;
CREATE POLICY "Owner insert avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owner update avatars" ON storage.objects;
CREATE POLICY "Owner update avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Owner delete avatars" ON storage.objects;
CREATE POLICY "Owner delete avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);