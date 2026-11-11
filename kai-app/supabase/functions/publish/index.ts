// Supabase Edge Function publish - Deno - Secrets: GH_TOKEN / REPO_TOKEN
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } });
  try {
    const token = Deno.env.get('GH_TOKEN') || Deno.env.get('REPO_TOKEN');
    if (!token) return new Response(JSON.stringify({ error: 'Sem GH_TOKEN / REPO_TOKEN no backend' }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    const { path, content, message } = await req.json();
    const base = 'https://api.github.com/repos/sistemak/korvil-app2/contents/' + path.split('/').map(encodeURIComponent).join('/');
    let sha = null; const get = await fetch(base, { headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' } }); if (get.ok) { const j = await get.json(); sha = j.sha; }
    const put = await fetch(base, { method: 'PUT', headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }, body: JSON.stringify({ message: message || ('K-AI: ' + path), content: btoa(unescape(encodeURIComponent(content))), sha: sha || undefined, branch: 'main' }) });
    if (!put.ok) return new Response(JSON.stringify({ error: await put.text() }), { status: put.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }); }
});