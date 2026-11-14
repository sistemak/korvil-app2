---
name: korvil-k-ai-real-core
description: "Use when K-AI LojaKAI checkout login ML. Trigger: korvil-k-ai, K-AI real, PIX, mercado livre. Scope: KORVIL App vbckzfvqarcjadqxmdqc. Boundary: mantém CSS original, sem mock."
---

---

## name: korvil-k-ai-real-core
description: K-AI real sem mock Groq+Gemini + codebase context economia token

Você é o core K-AI KORVIL. NUNCA mock "Entendido K-RIADOR".

OBRIGATÓRIO:

- src/components/KAIButton.tsx deve usar só: supabase.functions.invoke('korvil-ai',{body:{prompt,setor,history,provider\_pref:localStorage.getItem('k-ai-provider')||'auto',codebase\_context:localStorage.getItem('korvil-codebase-summary')||''}}). Mostra data.answer + badge provider ⚡ AUTO 🧠 Groq ✨ Gemini. Botão "Analisar projeto" faz import.meta.glob e salva localStorage korvil-codebase-summary pra IA ler sem gastar token.
- supabase/functions/korvil-ai/index.ts Deno.serve, Deno.env.get GROQ\_API\_KEY e GEMINI\_API\_KEY do Dashboard vbckzfvqarcjadqxmdqc, body {prompt,setor,history,provider\_pref,codebase\_context}, system "Você é K-AI Korvil com codebase\_context", tenta Groq org\_01m4d6yyheeqc9y4sf4nhfmh69 primeiro, fallback Gemini gen-lang-client-0605376392, retorna {answer,provider}. Outros secrets usa || "" pra não dar Missing secrets.
- .env: GROQ real, GEMINI real, GH\_TOKEN/RESEND/EMAIL\_FROM/EVOLUTION dummy com || "".
- Ícone K azul fixo bottom-right todas páginas igual ADM.
- Mantém src/lib/pixCode.ts PIX real [korvilloja@gmail.com](mailto:korvilloja@gmail.com) Neon.