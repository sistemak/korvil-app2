// K-AI App - Config Supabase - SEM CHAVE SECRETA AQUI
// Secrets ficam no Supabase Edge Functions: GEMINI_API_KEY, GROQ_API_KEY, GH_TOKEN, REPO_TOKEN
// Aqui vai SO a chave publishable (publica, segura pro front)
window.SUPABASE_URL='https://vbckzfvqarcjadqxmdqc.supabase.co';
window.SUPABASE_ANON_KEY='sb_publishable_wLgarwd2MbIyT0ZSRvk6AA_bVH68AvD';
window.REPO_OWNER='sistemak';
window.REPO_NAME='korvil-app2';
window.KAI_BACKEND_GERAR=window.SUPABASE_URL+'/functions/v1/k-ai';
window.KAI_BACKEND_PUBLICAR=window.SUPABASE_URL+'/functions/v1/publish';