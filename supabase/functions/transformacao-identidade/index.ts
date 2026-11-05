import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const id = typeof body?.id === "string" ? body.id.trim().toLowerCase().replace(/\s+/g, "") : "";
    if (!email || !id) return json({ ok: false, error: "Dados inválidos" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("projeto_transformacao_alunos")
      .select("aluno_id, nome, email, status")
      .eq("aluno_id", id)
      .maybeSingle();

    if (error) return json({ ok: false, error: "Erro ao verificar" }, 500);

    const emailBate = !!data?.email && data.email.trim().toLowerCase() === email;
    if (!data || !emailBate || data.status !== "ativo") {
      return json({ ok: false });
    }

    return json({ ok: true, aluno_id: data.aluno_id, nome: data.nome });
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 500);
  }
});
