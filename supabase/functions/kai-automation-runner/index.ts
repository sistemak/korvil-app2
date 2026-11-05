// Executor automático das automações do K-AI (Programações > Automações > Lembretes).
// Roda no servidor 24h: processa tudo que venceu, envia email de verdade (se houver
// RESEND_API_KEY), dispara WhatsApp via Evolution API (se houver) e registra o status.
// O relógio do banco (pg_cron) acorda esta função a cada minuto.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AutomationRow {
  id: string;
  user_id: string;
  title: string | null;
  channels: string[];
  same_message: boolean;
  message: string;
  messages_by_channel: Record<string, string>;
  email_from: string;
  email_to: string;
  wa_to: string;
  wa_to_name: string;
  sms_to: string;
  call_to: string;
  call_to_name: string;
  scheduled_at: string | null;
  repeat: string;
  weekdays: number[];
}

function msgFor(a: AutomationRow, channel: string): string {
  return a.same_message ? a.message : (a.messages_by_channel?.[channel] ?? a.message);
}

function nextOccurrence(a: AutomationRow): string | null {
  const base = a.scheduled_at ? new Date(a.scheduled_at) : new Date();
  const next = new Date(base);
  switch (a.repeat) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly": {
      const days = a.weekdays?.length ? a.weekdays : [base.getDay()];
      for (let i = 1; i <= 7; i++) {
        const cand = new Date(base);
        cand.setDate(base.getDate() + i);
        if (days.includes(cand.getDay())) return cand.toISOString();
      }
      next.setDate(next.getDate() + 7);
      break;
    }
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return null;
  }
  return next.toISOString();
}

async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key || key === "dummy") return { ok: false, error: "RESEND_API_KEY não configurada" };
  const fromRaw = Deno.env.get("EMAIL_FROM");
  const from = (fromRaw && fromRaw !== "dummy") ? fromRaw : "K-AI <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text: body }),
  });
  if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
  return { ok: true };
}

async function sendWhatsApp(
  phone: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  const base = Deno.env.get("EVOLUTION_API_URL");
  const key = Deno.env.get("EVOLUTION_API_KEY");
  const instanceRaw = Deno.env.get("EVOLUTION_INSTANCE");
  const instance = (instanceRaw && instanceRaw !== "dummy") ? instanceRaw : "korvil";
  if (!base || !key || base === "dummy" || key === "dummy") return { ok: false, error: "Evolution API não configurada" };
  const url = `${base.replace(/\/+$/, "")}/message/sendText/${instance}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({ number: phone, text: body }),
  });
  if (!res.ok) return { ok: false, error: `Evolution ${res.status}: ${(await res.text()).slice(0, 200)}` };
  return { ok: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Pega as automações vencidas e pendentes direto do banco.
    const now = new Date().toISOString();
    const qRes = await fetch(
      `${supabaseUrl}/rest/v1/kai_automations?select=*&status=eq.pending&scheduled_at=lte.${encodeURIComponent(now)}`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      }
    );
    if (!qRes.ok) {
      return new Response(JSON.stringify({ error: `Falha ao consultar: ${qRes.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const due = (await qRes.json()) as AutomationRow[];
    const results: Array<{ id: string; ok: boolean; channels: string[]; error?: string }> = [];

    for (const a of due) {
      // Marca como "processando" pra não rodar duas vezes.
      await fetch(`${supabaseUrl}/rest/v1/kai_automations?id=eq.${a.id}`, {
        method: "PATCH",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ status: "sent", updated_at: now }),
      });

      const sent: string[] = [];
      const errors: string[] = [];

      for (const c of a.channels ?? []) {
        const body = msgFor(a, c);
        if (c === "email" && a.email_to) {
          const r = await sendEmail(
            a.email_to,
            a.title ? `Lembrete do K-AI: ${a.title}` : "Lembrete do K-AI",
            body
          );
          r.ok ? sent.push("Email") : errors.push(`Email: ${r.error}`);
        } else if (c === "whatsapp" && a.wa_to) {
          const digits = a.wa_to.replace(/\D/g, "");
          const r = await sendWhatsApp(digits, body);
          r.ok ? sent.push("WhatsApp") : errors.push(`WhatsApp: ${r.error}`);
        }
        // SMS e ligação exigem app nativo / provedor de voz: ficam registrados como
        // pendentes de dispositivo — a notificação vai pelo app quando abrir.
      }

      const ok = sent.length > 0;
      const next = ok ? nextOccurrence(a) : null;
      await fetch(`${supabaseUrl}/rest/v1/kai_automations?id=eq.${a.id}`, {
        method: "PATCH",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          status: ok ? (next ? "pending" : "sent") : "failed",
          sent_at: ok ? new Date().toISOString() : null,
          scheduled_at: next ?? a.scheduled_at,
          last_error: errors.length ? errors.join("; ").slice(0, 500) : null,
          updated_at: new Date().toISOString(),
        }),
      });

      results.push({
        id: a.id,
        ok,
        channels: sent,
        error: errors.length ? errors.join("; ") : undefined,
      });
    }

    return new Response(JSON.stringify({ processed: due.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
