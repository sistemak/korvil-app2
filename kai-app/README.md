# K-AI App - Bolt-like com Supabase

Gemini + GROQ + Pollinations juntos via Supabase Edge Functions

## Backend Supabase
- POST /functions/v1/k-ai -> Gemini planeja + GROQ codifica + Pollinations imagem/texto
- POST /functions/v1/publish -> commita no GitHub com GH_TOKEN / REPO_TOKEN

## Secrets (Supabase Dashboard > Edge Functions > Secrets)
GEMINI_API_KEY / GROQ_API_KEY / GH_TOKEN / REPO_TOKEN

## Deploy das funcoes
supabase link --project-ref vbckzfvqarcjadqxmdqc
supabase functions deploy k-ai
supabase functions deploy publish

## Tabelas
Ver supabase/migrations/criar_tabelas.sql
