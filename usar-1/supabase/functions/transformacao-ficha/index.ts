import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Campo = [string, string];
type Secao = { titulo: string; campos: Campo[] };
type Ficha = { status: string; secoes: Secao[] };

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isTexto(valor: unknown, max: number): valor is string {
  return typeof valor === "string" && valor.length <= max;
}

function validarEdicao(entrada: unknown, atual: Ficha): Ficha | null {
  if (!entrada || typeof entrada !== "object") return null;
  const { status, secoes } = entrada as { status?: unknown; secoes?: unknown };
  if (!isTexto(status, 60) || !Array.isArray(secoes)) return null;
  if (secoes.length !== atual.secoes.length) return null;

  const novas: Secao[] = [];
  for (let i = 0; i < atual.secoes.length; i++) {
    const origem = atual.secoes[i];
    const nova = secoes[i] as { titulo?: unknown; campos?: unknown };
    if (!nova || nova.titulo !== origem.titulo || !Array.isArray(nova.campos)) return null;
    if (nova.campos.length !== origem.campos.length) return null;

    const campos: Campo[] = [];
    for (let j = 0; j < origem.campos.length; j++) {
      const par = nova.campos[j] as unknown;
      if (!Array.isArray(par) || par[0] !== origem.campos[j][0]) return null;
      if (!isTexto(par[1], 2000)) return null;
      campos.push([origem.campos[j][0], par[1]]);
    }
    novas.push({ titulo: origem.titulo, campos });
  }
  return { status: status as string, secoes: novas };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (req.method === "POST") {
      const body = await req.json().catch(() => null);
      const id = typeof body?.aluno_id === "string" ? body.aluno_id.trim() : "";
      if (!id || id.length > 64) return json({ ok: false, error: "Dados inválidos" }, 400);

      const { data, error } = await supabase
        .from("projeto_transformacao_fichas")
        .select("dados")
        .eq("aluno_id", id)
        .maybeSingle();

      if (error) return json({ ok: false, error: "Erro ao buscar ficha" }, 500);
      if (!data) return json({ ok: false, error: "Ficha não encontrada" }, 404);

      const atual = data.dados as Ficha;
      if (String(atual.status ?? "").trim().toUpperCase() !== "ATIVO") {
        return json({ ok: false, error: "Aluno não está ativo" }, 403);
      }

      const validada = validarEdicao(body?.dados, atual);
      if (!validada) return json({ ok: false, error: "Dados inválidos" }, 400);

      const { error: erroUpdate } = await supabase
        .from("projeto_transformacao_fichas")
        .update({ dados: { ...atual, ...validada }, updated_at: new Date().toISOString() })
        .eq("aluno_id", id);

      if (erroUpdate) return json({ ok: false, error: "Erro ao salvar ficha" }, 500);
      return json({ ok: true });
    }

    const url = new URL(req.url);
    const id = (url.searchParams.get("aluno_id") ?? "").trim();
    if (!id || id.length > 64) return json({ ok: false, error: "Dados inválidos" }, 400);

    const { data, error } = await supabase
      .from("projeto_transformacao_fichas")
      .select("dados")
      .eq("aluno_id", id)
      .maybeSingle();

    if (error) return json({ ok: false, error: "Erro ao buscar ficha" }, 500);
    if (!data) return json({ ok: false });

    return json({ ok: true, dados: data.dados });
  } catch (err) {
    return json({ ok: false, error: (err as Error).message }, 500);
  }
});
