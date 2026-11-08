/* Personalidade JARVIS do K-AI v42: varia as respostas conforme contexto, hora, tela e tom.
   Motor de entendimento melhorado: reconhece mais intenções, data dinâmica, contexto de tela. */

export type Address = string;

let userName: string | null = null;
export function setKaiUserName(name: string | null) {
  userName = name;
}

let creatorMode = false;
export function setKaiCreatorMode(v: boolean) {
  creatorMode = v;
}

let currentScreen = 'Central Korvil';
export function setKaiScreen(screen: string) {
  currentScreen = screen;
}
export function getKaiScreen(): string {
  return currentScreen;
}

export function pickAddress(kind: 'valorizacao' | 'auxilio' | 'formal'): Address {
  if (creatorMode) {
    if (kind === 'formal') return 'Say Korvil';
    return 'K-RIADOR';
  }
  if (kind === 'valorizacao') return userName ?? 'criador';
  if (kind === 'auxilio') return userName ?? 'chefe';
  return userName ?? 'chefe';
}

/** Converte a escrita para a pronúncia correta na voz (TTS fala mal grafias especiais). */
const PRONUNCIATION: Array<[RegExp, string]> = [
  [/K-RIADOR/gi, 'Criador'],
  [/Say Korvil/gi, 'Sai'],
  [/\bK-?AI\b/g, 'Ka-i'],
  [/K-ALMA/gi, 'Ké-Alma'],
  [/K-TP/gi, 'Kê-Tê-Pê'],
  [/K-AFORTUNADO/gi, 'Kê-Afortunado'],
  [/KORVIL/gi, 'Korvil'],
  [/SISTEMA K/gi, 'Sistema Kê'],
  [/K-OMFOME/gi, 'Kê-Omfome'],
];

export function speechText(text: string): string {
  let out = text;
  for (const [re, spoken] of PRONUNCIATION) out = out.replace(re, spoken);
  return out;
}

const SAUDACOES: Record<'manha' | 'tarde' | 'noite', string[]> = {
  manha: [
    'Bom dia', 'Bom dia, ótimo te ver', 'Olá, bom dia', 'Bom dia! Sistema ligado e pronto',
    'Bom dia! Já está em movimento, vejo', 'Bom dia. Que a jornada de hoje seja forte',
  ],
  tarde: [
    'Boa tarde', 'Boa tarde, tudo em ordem', 'Olá, boa tarde', 'Boa tarde! Estava aguardando você',
    'Boa tarde. Energia renovada pra continuar', 'Boa tarde, tudo sob controle por aqui',
  ],
  noite: [
    'Boa noite', 'Boa noite, ainda acordado', 'Olá, boa noite', 'Boa noite! Noite produtiva, então',
    'Boa noite. Sistema rodando mesmo a esta hora', 'Boa noite. Estou aqui, sempre',
  ],
};

const lastSpoken = new Map<string, string>();
export function pickVaried<T>(key: string, items: T[]): T {
  if (items.length === 1) return items[0];
  const last = lastSpoken.get(key);
  let choice = items[Math.floor(Math.random() * items.length)];
  let guard = 0;
  while (choice === last && guard < 8) {
    choice = items[Math.floor(Math.random() * items.length)];
    guard++;
  }
  lastSpoken.set(key, typeof choice === 'string' ? (choice as string) : String(choice));
  return choice;
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  const part = h < 12 ? 'manha' : h < 18 ? 'tarde' : 'noite';
  return pickVaried('greeting', SAUDACOES[part]);
}

const READY = [
  (a: string) => `Estou sempre à sua disposição, ${a}.`,
  (a: string) => `Pronto, ${a}. Sistemas operando em plena capacidade.`,
  (a: string) => `Sempre acordado, ${a}. O que precisamos fazer?`,
  (a: string) => `À disposição, ${a}. Todos os sistemas nominais.`,
  (a: string) => `Aqui, ${a}. Diga o que precisa.`,
  (a: string) => `No aguardo do seu comando, ${a}.`,
  (a: string) => `Online e operante, ${a}. Pode mandar.`,
];

export function readyReply(kind: 'valorizacao' | 'auxilio' | 'formal' = 'valorizacao'): string {
  const a = pickAddress(kind);
  const f = pickVaried('ready', READY);
  return f(a);
}

const CONFIRM = [
  (a: string, what: string) => `Posso confirmar, ${a}? Você quer que eu ${what}.`,
  (a: string, what: string) => `Posso executar agora, ${a}? ${capitalize(what)}.`,
  (a: string, what: string) => `Entendido. Posso criar isso, ${a}? ${capitalize(what)}.`,
  (a: string, what: string) => `Vou fazer: ${what}. Confirma, ${a}?`,
];

export function confirmRequest(what: string, kind: 'valorizacao' | 'auxilio' | 'formal' = 'auxilio'): string {
  const a = pickAddress(kind);
  const f = pickVaried('confirm', CONFIRM);
  return f(a, what.trim());
}

/* Whispers contextuais — usa a tela atual, hora e eventos reais do app. */
const WHISPER_POOL: Array<(screen: string, g: string) => string> = [
  (s, g) => `${g}.`,
  (s, g) => `${g}. Você está na ${s}. Tudo funcionando.`,
  (s, g) => `${g}. Precisa de algo?`,
  (s) => `Se quiser, posso verificar o repositório agora — estamos na ${s}.`,
  () => `Lembre que pode me chamar dizendo "KAI".`,
  () => `Posso gerar uma proposta de evolução agora. Diga "evoluir" ou abra o menu.`,
  () => `Tem tarefas pendentes? Abra o menu e confira em "Tarefas".`,
  (s) => `Na ${s}, tudo sob controle. Pode pedir o que quiser.`,
  () => `Quer que eu melhore algo no app? Abra "Evolução K-AI" no menu.`,
  () => `Já conferi os provedores de IA — Groq, Gemini e Pollinations prontos.`,
];

export function contextualWhisper(screen: string): string {
  const g = greeting();
  return pickVaried('whisper', WHISPER_POOL.map((fn) => fn(screen, g)));
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------- Motor de entendimento ----------

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function isGreetingOnly(clean: string): boolean {
  return /^(oi+|ola|eai|e ai|opa|hey|hi|bom dia|boa tarde|boa noite|fala|salve|e aí)[\s!,.]*(kai|ka-i|k-ai)?[\s!,.*]*$/.test(clean);
}

function isWhoAmI(clean: string): boolean {
  return /(quem (sou )?eu|sabe quem eu sou|meu nome|me conhece|quem estou falando)/.test(clean);
}

function isWhoAreYou(clean: string): boolean {
  return /(quem (e|es|era) voce|o que (e )?voce|quem es tu|voce e o que|se apresente|fale de voce|qual seu nome|quem te criou|quem fez voce|quem criou voce)/.test(clean);
}

function isCapabilities(clean: string): boolean {
  return /(o que (voce )?(pode|sabe) fazer|suas funcoes|como pode ajudar|para que serve|o que faz)/.test(clean);
}

function isHowAreYou(clean: string): boolean {
  return /(como (vai|esta|esta voce|ande)|tudo bem|tudo bom|beleza|como vai voce)/.test(clean);
}

/** Reconhece pedido de clima/tempo. */
function isWeather(clean: string): boolean {
  return /(clima|tempo|temperatura|vai chover|previsao|previsão)/.test(clean) && !/\bhora\b/.test(clean);
}

/** Reconhece pedido de status do sistema. */
function isStatus(clean: string): boolean {
  return /\b(status|sistema|sistemas|tudo funcionando|online|operando)\b/.test(clean) && !isHowAreYou(clean);
}

/** Reconhece "obrigado". */
function isThanks(clean: string): boolean {
  return /\b(obrigado|obrigada|valeu|show|perfeito|top|massa|mano|ai sim)\b/.test(clean);
}

/** Reconhece pedido de ajuda. */
function isHelp(clean: string): boolean {
  return /^(ajuda|help|socorro|\?)$/.test(clean) || /(o que eu (posso|posso) (fazer|pedir)|comandos|atalhos)/.test(clean);
}

/** Contas simples: "quanto é 12*3", "5 mais 5". */
function tryMath(raw: string): string | null {
  const clean = raw
    .toLowerCase()
    .replace(/quanto (e|eh|da|vale)\s*/g, '')
    .replace(/\bmais\b|\bsoma\b|\bplus\b|\be\b(?=\s*\d)/g, '+')
    .replace(/\bmenos\b|\bsubtrai/g, '-')
    .replace(/\bvezes\b|\bmultiplicado por\b|\bx\b/g, '*')
    .replace(/\bdividido por\b|\bsobre\b/g, '/')
    .replace(/[?!]/g, '')
    .trim();
  if (!/^[\d\s+\-*/().,]+$/.test(clean)) return null;
  if (!/[+\-*/]/.test(clean)) return null;
  try {
    const val = Function(`"use strict"; return (${clean.replace(/,/g, '.')})`)() as number;
    if (typeof val !== 'number' || !isFinite(val)) return null;
    return `O resultado é ${Math.round(val * 1000) / 1000}, ${pickAddress('auxilio')}.`;
  } catch {
    return null;
  }
}

/** Data dinâmica — sempre correta, não hardcoded. */
function formatDatePT(d: Date): string {
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

export interface ReplyResult {
  text: string;
  confirm?: string;
  isCommand?: boolean;
}

export function buildReply(input: string): ReplyResult {
  const clean = norm(input.trim());
  const isQuestion = /\?/.test(input) || /^(quem|qual|quais|quanto|quanta|quantos|quantas|como|por que|porque|porquê|onde|quando|o que|qual e)/.test(clean);

  // Comandos slash — tratados pelo handler de comandos, não aqui.
  if (/^\//.test(clean)) {
    return { text: '', isCommand: true };
  }

  if (isGreetingOnly(clean)) {
    return { text: `${greeting()}, ${pickAddress('valorizacao')}! Como posso ajudar?` };
  }
  if (/\b(acordado|ta ai|esta ai|esta acordado|presente|on|to ai|tô ai)\b/.test(clean)) {
    return { text: readyReply('valorizacao') };
  }
  if (isThanks(clean)) {
    const thanks = [
      `Sempre às ordens, ${pickAddress('auxilio')}.`,
      `Disponha, ${pickAddress('auxilio')}.`,
      `Por isso estou aqui, ${pickAddress('valorizacao')}.`,
      `O prazer é meu, ${pickAddress('auxilio')}.`,
    ];
    return { text: pickVaried('thanks', thanks) };
  }
  if (isWhoAmI(clean) && isWhoAreYou(clean)) {
    const eu = creatorMode
      ? `Você é ${pickAddress('formal')}, o K-RIADOR — criador e ADM do Sistema Korvil, com Acesso Total a todos os sistemas.`
      : `Você é ${userName ?? 'um usuário'} do Sistema Korvil.`;
    return { text: `Sou a K-AI v42, sua inteligência artificial pessoal — operando todos os sistemas da Central Korvil, pronta pra executar suas ordens e te orientar em tempo real. ${eu}` };
  }
  if (isWhoAmI(clean)) {
    const a = pickAddress('formal');
    if (creatorMode) {
      return { text: `Você é ${a}, o K-RIADOR — criador e ADM do Sistema Korvil. Acesso Total confirmado, todos os sistemas respondendo ao seu comando.` };
    }
    return { text: `Você é ${userName ?? a}, usuário do Sistema Korvil. ${userName ? '' : 'Me diga seu nome no perfil para eu te chamar corretamente.'}` };
  }
  if (isWhoAreYou(clean)) {
    const criou = /quem te criou|quem fez voce|quem criou voce/.test(clean);
    const base = 'Sou a K-AI v42, sua inteligência artificial pessoal — cuido de toda a Central Korvil, executo suas ordens, falo com você por voz e texto, evoluo sozinha a cada 5 minutos e mantenho todos os sistemas operando em plena capacidade.';
    return { text: criou ? `${base} Fui criada por você, ${pickAddress('formal')} — sempre à disposição, como seu assistente pessoal.` : base };
  }
  if (isCapabilities(clean)) {
    return {
      text: `Como seu assistente pessoal, posso: conversar por voz ou texto, responder dúvidas, fazer contas, informar horas e data, receber e executar tarefas, tocar música no YouTube, ligar, mandar WhatsApp e email, programar despertador, abrir apps, e operar o app diretamente quando você mandar como ADM. A cada 5 minutos eu mesma proponho melhorias — você aprova com SIM ou NÃO na notificação. Comandos rápidos: /status, /limpar, /backup, /evoluir, /tarefas.`,
    };
  }
  if (isHowAreYou(clean)) {
    return { text: `Todos os sistemas operando em plena capacidade, ${pickAddress('valorizacao')}. Pronto pra receber seus comandos. E você?` };
  }
  if (isStatus(clean)) {
    const screen = getKaiScreen();
    return { text: `Status: todos os sistemas nominais. Você está na ${screen}. Provedores de IA: Groq, Gemini e Pollinations ativos. Evolução autônoma rodando a cada 5 minutos. Tudo sob controle, ${pickAddress('valorizacao')}.` };
  }
  if (isHelp(clean)) {
    return {
      text: `Posso te ajudar com: conversar (voz e texto), tarefas, contas, horas, data, tocar música, ligar, WhatsApp, email, despertador, abrir apps, e evoluir o app sozinha. Comandos: /status /limpar /backup /evoluir /tarefas. Ou diga "KAI" em voz alta pra falar comigo. O que precisa, ${pickAddress('auxilio')}?`,
    };
  }
  if (isWeather(clean)) {
    return { text: `Não tenho sensor de clima conectado ainda, ${pickAddress('auxilio')}. Mas posso abrir a previsão pra você — quer que eu abra o Google Maps ou um site de clima?` };
  }
  if (/\b(hora|horas|que horas|q horas)\b/.test(clean)) {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const spoken = m === 0 ? `${h} horas em ponto` : `${h} horas e ${m} minutos`;
    return { text: `Agora são ${spoken}, ${pickAddress('auxilio')}.` };
  }
  if (/\b(dia|data|hoje|que dia|q dia)\b/.test(clean)) {
    return { text: `Hoje é ${formatDatePT(new Date())}, ${pickAddress('auxilio')}.` };
  }
  const math = tryMath(clean);
  if (math) return { text: math };

  if (/^(cria|criar|adiciona|adicionar|faz|atualiza|muda|troca|melhora|melhorar)\b/.test(clean)) {
    return { text: confirmRequest(input) };
  }

  if (isQuestion) {
    return {
      text: `Boa pergunta, ${pickAddress('auxilio')}. Minha rede de conhecimento ainda está sendo ligada ao Sistema — por enquanto eu respondo com precisão sobre o Korvil, sobre você, horas, datas, contas, clima e status do sistema. Sua dúvida ficou anotada.`,
    };
  }
  return { text: `Entendido, ${pickAddress('auxilio')}. Se for uma ordem, diga o que devo fazer; se for dúvida, pergunte direto que eu respondo.` };
}
