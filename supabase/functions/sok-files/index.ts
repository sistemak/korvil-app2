import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const TG_CHANNEL = Deno.env.get("TELEGRAM_CHANNEL_ID") ?? "";

/* KBD group with topic threads per setor */
const KBD = {
  GROUP: -1004309623076,
  TOPICS: {
    GENERAL: 1,
    KORVIL: 2,
    K_ALMA: 4,
    K_AFORTUNADO: 5,
    K_TP: 6,
    SISTEMA_K: 7,
  } as Record<string, number>,
};

const SETORES_VALIDOS = ["KORVIL", "SISTEMA_K", "K_TP", "K_AFORTUNADO", "K_ALMA"];

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

interface ArquivoRow {
  id?: string;
  nome: string;
  tipo: string;
  file_id_telegram: string;
  tamanho: number;
  setor: string;
  pasta?: string | null;
  message_id?: number | null;
}

function getPasta(nome: string, mime: string): string {
  const n = (nome || "").toLowerCase();
  const ext = n.split(".").pop() ?? "";
  if (/jpg|jpeg|png|webp|gif/.test(ext) || mime.startsWith("image/")) return "IMAGENS";
  if (/mp4|mov|avi|mkv/.test(ext) || mime.startsWith("video/")) return "VIDEOS";
  if (/mp3|wav|ogg|opus|m4a/.test(ext) || mime.startsWith("audio/")) {
    return /ogg|opus|voice/.test(n) ? "AUDIOS" : "MUSICAS";
  }
  return "DOCUMENTOS";
}

function validarSetor(setor: string): string {
  const s = (setor || "").toUpperCase();
  if (SETORES_VALIDOS.includes(s)) return s;
  return "KORVIL";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    // ── list: files for a setor ──
    if (action === "list") {
      const setor = validarSetor(url.searchParams.get("setor") ?? "");
      const { data, error } = await supabase
        .from("arquivos")
        .select("*")
        .eq("setor", setor)
        .order("data_criacao", { ascending: false });
      if (error) return json({ error: error.message }, 500);

      // group by pasta
      const pastas: Record<string, typeof data> = {
        IMAGENS: [], VIDEOS: [], MUSICAS: [], AUDIOS: [], DOCUMENTOS: [],
      };
      for (const row of data ?? []) {
        const p = (row as { pasta?: string }).pasta ?? getPasta((row as { nome: string }).nome, (row as { tipo: string }).tipo);
        if (pastas[p]) pastas[p].push(row);
        else pastas.DOCUMENTOS.push(row);
      }
      return json({
        setor,
        thread_id: KBD.TOPICS[setor],
        total: (data ?? []).length,
        pastas: {
          IMAGENS: { qtd: pastas.IMAGENS.length, arquivos: pastas.IMAGENS },
          MUSICAS: { qtd: pastas.MUSICAS.length, arquivos: pastas.MUSICAS },
          AUDIOS: { qtd: pastas.AUDIOS.length, arquivos: pastas.AUDIOS },
          VIDEOS: { qtd: pastas.VIDEOS.length, arquivos: pastas.VIDEOS },
          DOCUMENTOS: { qtd: pastas.DOCUMENTOS.length, arquivos: pastas.DOCUMENTOS },
        },
      });
    }

    // ── list-all: summary counts for all setores (cached 30s) ──
    if (action === "list-all") {
      const out: Record<string, { thread_id: number; total: number; IMAGENS: number; VIDEOS: number; MUSICAS: number; AUDIOS: number; DOCUMENTOS: number }> = {};
      for (const setor of SETORES_VALIDOS) {
        const { data } = await supabase.from("arquivos").select("tipo, nome, pasta").eq("setor", setor);
        const rows = (data ?? []) as { tipo: string; nome: string; pasta?: string }[];
        const counts = { IMAGENS: 0, VIDEOS: 0, MUSICAS: 0, AUDIOS: 0, DOCUMENTOS: 0 };
        for (const r of rows) {
          const p = r.pasta ?? getPasta(r.nome, r.tipo);
          if (counts[p as keyof typeof counts] !== undefined) counts[p as keyof typeof counts]++;
        }
        out[setor] = {
          thread_id: KBD.TOPICS[setor],
          total: rows.length,
          ...counts,
        };
      }
      return json(out);
    }

    // ── upload: forward file to Telegram KBD topic thread, then insert row ──
    if (action === "upload" && req.method === "POST") {
      if (!TG_TOKEN) {
        return json({ error: "Telegram não configurado no servidor" }, 500);
      }
      const form = await req.formData();
      const setor = validarSetor(form.get("setor") as string | null ?? "KORVIL");
      const file = form.get("document") as File | null;
      if (!file) {
        return json({ error: "document é obrigatório" }, 400);
      }

      const pasta = getPasta(file.name, file.type || "");
      const threadId = KBD.TOPICS[setor] ?? KBD.TOPICS.KORVIL;
      const caption = `[${setor}][${pasta}] ${file.name}`;

      // send to the KBD group topic thread
      const tgForm = new FormData();
      tgForm.append("chat_id", String(KBD.GROUP));
      tgForm.append("message_thread_id", String(threadId));
      tgForm.append("caption", caption);
      if (pasta === "IMAGENS") {
        tgForm.append("photo", file, file.name);
      } else {
        tgForm.append("document", file, file.name);
      }

      const endpoint = pasta === "IMAGENS" ? "sendPhoto" : "sendDocument";
      const tgResp = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/${endpoint}`, {
        method: "POST",
        body: tgForm,
      });
      const tgJson = await tgResp.json();
      if (!tgJson.ok) {
        return json({ error: tgJson.description || "Erro no upload Telegram" }, 502);
      }

      const result = tgJson.result;
      const doc = result?.document ?? result?.audio ?? result?.video ?? result?.photo?.[result.photo.length - 1];
      const file_id = doc?.file_id;
      if (!file_id) {
        return json({ error: "file_id não encontrado na resposta do Telegram" }, 502);
      }
      const messageId = result?.message_id ?? null;

      const row: ArquivoRow = {
        nome: file.name,
        tipo: file.type || "documento",
        file_id_telegram: file_id,
        tamanho: doc?.file_size ?? file.size,
        setor,
        pasta,
        message_id: messageId,
      };
      const { data, error } = await supabase.from("arquivos").insert(row).select().single();
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, data, setor, pasta });
    }

    // ── file-url: resolve a Telegram file_path into a download URL ──
    if (action === "file-url") {
      if (!TG_TOKEN) {
        return json({ error: "Telegram não configurado no servidor" }, 500);
      }
      const file_id = url.searchParams.get("file_id");
      if (!file_id) {
        return json({ error: "file_id obrigatório" }, 400);
      }
      const tgResp = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getFile?file_id=${file_id}`);
      const tgJson = await tgResp.json();
      if (!tgJson.ok) {
        return json({ error: tgJson.description || "Erro ao obter file_path" }, 502);
      }
      const fileUrl = `https://api.telegram.org/file/bot${TG_TOKEN}/${tgJson.result.file_path}`;
      return json({ url: fileUrl });
    }

    return json({ error: "ação inválida" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "erro interno" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
