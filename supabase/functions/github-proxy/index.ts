const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GH_OWNER = "sistemak";
const GH_REPO = "korvil-app";

// O repositório é público: todas as leituras usam a API pública do GitHub, sem token.
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // /github-proxy/repo  -> metadados do repositório
    // /github-proxy/tree/<branch> -> árvore completa de arquivos
    // /github-proxy/contents/<path> -> lista/conteúdo de arquivos e pastas
    const route = url.pathname.replace(/^\/github-proxy\/?/, "");

    let ghUrl: string;
    if (!route || route === "repo") {
      ghUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}`;
    } else if (route.startsWith("tree/")) {
      ghUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/git/trees/${route.slice(5)}`;
    } else if (route.startsWith("contents/")) {
      const path = route.slice("contents/".length).replace(/^\/+/, "");
      ghUrl = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Rota inválida. Use /repo, /tree/<branch> ou /contents/<caminho>" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ghRes = await fetch(ghUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "korvil-app",
      },
    });

    const body = await ghRes.text();
    return new Response(body, {
      status: ghRes.status,
      headers: {
        ...corsHeaders,
        "Content-Type": ghRes.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro inesperado" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
