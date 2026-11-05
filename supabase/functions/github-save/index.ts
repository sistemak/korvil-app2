const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GH_OWNER = "sistemak";
const GH_REPO = "korvil-app";
const BRANCH = "main";

interface SaveBody {
  path?: string;
  content?: string;
  message?: string;
}

// Grava um arquivo no repositório usando GH_TOKEN guardado como segredo do servidor.
// O token nunca vai para o navegador.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Use POST com { path, content, message }" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const token = Deno.env.get("GH_TOKEN");
  if (!token || token === "dummy") {
    return new Response(
      JSON.stringify({ error: "GH_TOKEN não configurado no servidor", disabled: true }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: SaveBody;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "JSON inválido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const path = (body.path ?? "").replace(/^\/+/, "").trim();
  const content = body.content ?? "";
  const message = (body.message ?? `K-AI: atualiza ${path}`).slice(0, 200);

  if (!path || !path.includes(".") || path.includes("..")) {
    return new Response(
      JSON.stringify({ error: "Caminho de arquivo inválido" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  if (content.length > 400_000) {
    return new Response(
      JSON.stringify({ error: "Arquivo muito grande (máx. 400 KB)" }),
      { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    // Descobre o sha atual do arquivo (obrigatório para sobrescrever).
    let sha: string | undefined;
    const headRes = await fetch(
      `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodeURI(path)}?ref=${BRANCH}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "korvil-app",
        },
      },
    );
    if (headRes.status === 200) {
      const head = await headRes.json();
      sha = head?.sha;
    } else if (headRes.status !== 404) {
      return new Response(
        JSON.stringify({ error: `GitHub respondeu ${headRes.status} ao ler o arquivo` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const putRes = await fetch(
      `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${encodeURI(path)}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "korvil-app",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          content: btoa(unescape(encodeURIComponent(content))),
          branch: BRANCH,
          ...(sha ? { sha } : {}),
        }),
      },
    );

    const putBody = await putRes.text();
    return new Response(putBody, {
      status: putRes.status,
      headers: {
        ...corsHeaders,
        "Content-Type": putRes.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
