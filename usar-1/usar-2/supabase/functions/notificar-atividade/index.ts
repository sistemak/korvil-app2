// Envia notificações push para os celulares dos ADMs.
// GET devolve a chave pública que o navegador usa para se inscrever.
// POST pega os eventos pendentes em atividade_eventos, marca como enviados e
// dispara a notificação para cada celular inscrito. Chamada pelo banco logo após
// cada evento e, a cada 30 segundos, pelo relógio do banco (pega o que falhou).

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function createVapidKeys(): Promise<{ publicKey: string; privateKey: string }> {
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const point = new Uint8Array([4, ...fromBase64Url(jwk.x!), ...fromBase64Url(jwk.y!)]);
  return { publicKey: toBase64Url(point), privateKey: jwk.d! };
}

// deno-lint-ignore no-explicit-any
async function loadVapidKeys(admin: any): Promise<{ publicKey: string; privateKey: string }> {
  const { data, error } = await admin
    .from("push_vapid")
    .select("public_key, private_key")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return { publicKey: data.public_key, privateKey: data.private_key };

  const keys = await createVapidKeys();
  const { error: insertError } = await admin
    .from("push_vapid")
    .insert({ id: 1, public_key: keys.publicKey, private_key: keys.privateKey });
  if (insertError) {
    const { data: existing } = await admin
      .from("push_vapid")
      .select("public_key, private_key")
      .eq("id", 1)
      .maybeSingle();
    if (!existing) throw new Error(insertError.message);
    return { publicKey: existing.public_key, privateKey: existing.private_key };
  }
  return keys;
}

// deno-lint-ignore no-explicit-any
async function dispatchPending(admin: any, keys: { publicKey: string; privateKey: string }): Promise<number> {
  const { data: pending, error: pendingError } = await admin
    .from("atividade_eventos")
    .select("id")
    .is("enviado_at", null)
    .order("created_at", { ascending: true })
    .limit(50);
  if (pendingError) throw new Error(pendingError.message);
  if (!pending || pending.length === 0) return 0;

  const { data: claimed, error: claimError } = await admin
    .from("atividade_eventos")
    .update({ enviado_at: new Date().toISOString() })
    .in("id", pending.map((e: { id: string }) => e.id))
    .is("enviado_at", null)
    .select("id, titulo, corpo, url");
  if (claimError) throw new Error(claimError.message);
  if (!claimed || claimed.length === 0) return 0;

  const { data: subs, error: subsError } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, keys");
  if (subsError) throw new Error(subsError.message);

  webpush.setVapidDetails("mailto:korvil.tp@gmail.com", keys.publicKey, keys.privateKey);

  for (const ev of claimed) {
    const payload = JSON.stringify({ title: ev.titulo, body: ev.corpo, url: ev.url, tag: ev.id });
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          { TTL: 60 * 60 * 24, urgency: "high" },
        );
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("push falhou", status, (err as Error).message);
        }
      }
    }
  }
  return claimed.length;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const keys = await loadVapidKeys(admin);

    if (req.method === "GET") return json({ publicKey: keys.publicKey });
    if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

    const sent = await dispatchPending(admin, keys);
    return json({ processed: sent });
  } catch (err) {
    console.error(err);
    return json({ error: "Não foi possível processar as notificações" }, 500);
  }
});
