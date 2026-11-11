// Supabase Edge Function k-ai - Deno - Secrets: GEMINI_API_KEY, GROQ_API_KEY
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  try {
    const { prompt, nomeProjeto, arquivosAtuais, acao } = await req.json();
    if (!prompt) return new Response(JSON.stringify({ error: 'sem prompt' }), { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    const arquivosTxt = (arquivosAtuais || []).map((f) => 'ARQUIVO ' + f.path + ':\n' + (f.content || '').slice(0, 4000)).join('\n\n');
    const sistema = 'Voce e o K-AI, um gerador de apps tipo Bolt. Responda SEMPRE com 3 blocos: ```html ... ``` depois ```css ... ``` depois ```js ... ```. HTML completo, bonito, responsivo, tema escuro roxo #0b0714 / #a855f7, botoes funcionais em JS puro. Se a acao for editar/corrigir/adicionar, devolva os arquivos COMPLETOS ja editados, nao so o trecho. Nao explique fora dos blocos.';
    const usuario = 'Acao: ' + (acao || 'criar') + ' | Projeto: ' + (nomeProjeto || 'meu-app') + ' | Pedido: ' + prompt + (arquivosTxt ? ' | Arquivos atuais:\n' + arquivosTxt : '');
    let texto = "";
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (groqKey) {
      try { const r = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + groqKey }, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: sistema }, { role: 'user', content: usuario }], temperature: 0.7, max_tokens: 6000 }) }); if (r.ok) { const j = await r.json(); texto = j.choices?.[0]?.message?.content || ''; } } catch (e) { console.log('GROQ falhou', e.message); }
    }
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!texto && geminiKey) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + geminiKey, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: sistema + '\n' + usuario }] }] }) }); if (!r.ok) throw new Error('Gemini ' + r.status); const j = await r.json(); texto = j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    }
    // Pollinations texto sem chave - 3o fallback
    if (!texto) {
      try { const r = await fetch('https://text.pollinations.ai/' + encodeURIComponent(usuario.slice(0, 2000)), { headers: { 'Content-Type': 'application/json' } }); if (r.ok) texto = await r.text(); } catch (e) { console.log('Pollinations texto falhou', e.message); }
    }
    if (!texto) return new Response(JSON.stringify({ error: 'Nenhuma IA respondeu. Confira GEMINI_API_KEY / GROQ_API_KEY nos Secrets.' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    return new Response(JSON.stringify({ texto }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }); }
});