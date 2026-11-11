# Deploy Supabase

1. Instale CLI: npm i -g supabase
2. supabase login
3. supabase link --project-ref vbckzfvqarcjadqxmdqc
4. supabase functions deploy k-ai
5. supabase functions deploy publish
6. Confira Secrets em Dashboard > Edge Functions > Secrets: GEMINI_API_KEY, GROQ_API_KEY, GH_TOKEN, REPO_TOKEN
7. Rode SQL em supabase/migrations/criar_tabelas.sql no SQL Editor

NUNCA coloque sb_secret no front ou no GitHub. No front vai SO sb_publishable.
