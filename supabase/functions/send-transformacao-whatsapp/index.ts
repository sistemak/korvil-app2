// Envia a inscrição do Projeto Transformação para o WhatsApp do K-TP (5513997690898)
// pelo servidor, sem depender do navegador do usuário.
// Tenta WhatsApp Cloud API se WHATSAPP_TOKEN existir; senão, salva em whatsapp_outbox.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DESTINATARIO = "5513997690898";
const WHATSAPP_API_VERSION = Deno.env.get("WHATSAPP_API_VERSION") ?? "v22.0";
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_ID") ?? Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";

interface InscricaoPayload {
  nome?: string;
  cpf?: string;
  data_nascimento?: string;
  genero?: string;
  whatsapp?: string;
  email?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  objetivos?: string[];
  nivel?: string;
  respostas?: { pergunta: string; resposta: string }[];
  plano?: { nome: string; tipo: string; freq: number; valor: number; mat: number };
  dias?: string[];
  hora?: string;
  total?: number;
  data_envio?: string;
  idade?: string;
  [k: string]: unknown;
}

function montarMensagem(d: InscricaoPayload): string {
  const plano = d.plano;
  const mod = plano?.tipo?.includes("pres") ? "PRESENCIAL" : "ONLINE";
  const tipoPlano = plano
    ? `${plano.freq === 1 ? "Aula Avulsa" : "Mensal"} ${mod} ${plano.freq}x`
    : "—";
  const obj = (d.objetivos ?? []).join(" | ");
  const resp = (d.respostas ?? [])
    .map((r) => `${r.pergunta}: ${r.resposta}`)
    .join("\n");
  const total = d.total ?? 0;
  const valor = plano?.valor ?? 0;
  const mat = plano?.mat ?? 0;
  const dias = (d.dias ?? []).join(", ");
  const hora = d.hora ?? "—";
  const dataNasc = d.data_nascimento
    ? String(d.data_nascimento).split("-").reverse().join("/")
    : "—";

  return (
    `🔥 NOVA INSCRIÇÃO - PROJETO TRANSFORMAÇÃO\n\n` +
    `1. DADOS DO PLANO\n` +
    `Modalidade: ${mod}\n` +
    `Tipo de Plano: ${tipoPlano}\n` +
    `Dias: ${dias}\n` +
    `Horário: ${hora}\n` +
    `Frequência: ${plano?.freq ?? 0}x na semana\n` +
    `Valor Mensal: R$${valor},00\n` +
    `Matrícula: R$${mat},00\n` +
    `Total 1º Pagamento: R$${total},00\n\n` +
    `2. DADOS PESSOAIS\n` +
    `Nome: ${d.nome ?? "—"}\n` +
    `CPF: ${d.cpf ?? "—"}\n` +
    `Data Nascimento: ${dataNasc}\n` +
    `Idade: ${d.idade ?? "—"}\n` +
    `Gênero: ${d.genero ?? "—"}\n` +
    `WhatsApp: ${d.whatsapp ?? "—"}\n` +
    `Email: ${d.email ?? "—"}\n\n` +
    `3. ENDEREÇO\n` +
    `CEP: ${d.cep ?? "—"}\n` +
    `Rua: ${d.rua ?? "—"}\n` +
    `Número: ${d.numero ?? "—"}\n` +
    `Bairro: ${d.bairro ?? "—"}\n` +
    `Cidade: ${d.cidade ?? "—"}\n\n` +
    `4. ANAMNESE - OBJETIVOS\n` +
    `Objetivos em Prioridade: ${obj}\n` +
    `Nível de Atividade: ${d.nivel ?? "—"}\n\n` +
    `5. ANAMNESE - HISTÓRICO\n` +
    `${resp}\n\n` +
    `STATUS: ATIVO`
  );
}

function createSupabaseClient() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return {
    url,
    serviceKey,
  };
}

async function salvarOutbox(mensagem: string, payload: InscricaoPayload, erro?: string) {
  const { url, serviceKey } = createSupabaseClient();
  if (!url || !serviceKey) {
    console.log("[send-transformacao-whatsapp] SUPABASE_URL/SERVICE_ROLE ausentes; não foi possível salvar outbox.");
    return;
  }
  try {
    const res = await fetch(`${url}/rest/v1/whatsapp_outbox`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        destinatario: DESTINATARIO,
        mensagem,
        payload,
        status: "pending",
        origem: "transformacao",
        tentativas: 0,
        erro: erro ?? null,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      console.log(`[send-transformacao-whatsapp] Erro ao salvar outbox: ${res.status} ${t.slice(0, 300)}`);
    } else {
      console.log("[send-transformacao-whatsapp] Mensagem salva em whatsapp_outbox (fallback).");
    }
  } catch (e) {
    console.log(`[send-transformacao-whatsapp] Exceção ao salvar outbox: ${e instanceof Error ? e.message : String(e)}`);
  }
}

async function enviarWhatsAppCloudApi(mensagem: string): Promise<{ ok: boolean; error?: string }> {
  const token = Deno.env.get("WHATSAPP_TOKEN");
  const phoneNumberId = WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return { ok: false, error: "WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID não configurados" };
  }
  try {
    const res = await fetch(
      `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: DESTINATARIO,
          type: "text",
          text: { body: mensagem },
        }),
      },
    );
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: `WhatsApp Cloud API respondeu ${res.status}: ${t.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Use POST" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as InscricaoPayload & { teste?: boolean };
    const mensagem = body.teste
      ? "Teste TRANSFORMAÇÃO 🚀"
      : montarMensagem(body);

    const resultado = await enviarWhatsAppCloudApi(mensagem);

    if (resultado.ok) {
      return new Response(
        JSON.stringify({ ok: true, enviado: true, via: "whatsapp_cloud_api" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fallback: salva na outbox para envio posterior e loga no console.
    console.log(`[send-transformacao-whatsapp] Envio direto falhou: ${resultado.error}. Salvando em outbox.`);
    await salvarOutbox(mensagem, body, resultado.error);

    return new Response(
      JSON.stringify({
        ok: true,
        enviado: false,
        via: "outbox",
        message: "Mensagem enfileirada em whatsapp_outbox (WHATSAPP_TOKEN não configurado).",
        error: resultado.error,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro inesperado";
    console.log(`[send-transformacao-whatsapp] Erro: ${msg}`);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
