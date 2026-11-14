/* Personalidade JARVIS do K-AI: varia as respostas conforme contexto, hora e tom. */

export type Address = string;

// Nome de quem está logado (apelido ou primeiro nome).
let userName: string | null = null;
export function setKaiUserName(name: string | null) {
  userName = name;
}

// Modo criador: a conta ADM recebe títulos (K-RIADOR na maior parte das vezes)
// e o próprio nome "Say Korvil" nas situações formais.
let creatorMode = false;
export function setKaiCreatorMode(v: boolean) {
  creatorMode = v;
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
];

export function speechText(text: string): string {
  let out = text;
  for (const [re, spoken] of PRONUNCIATION) out = out.replace(re, spoken);
  return out;
}

const SAUDACOES: Record<'manha' | 'tarde' | 'noite', string[]> = {
  manha: ['Bom dia', 'Bom dia, ótimo te ver', 'Olá, bom dia', 'Bom dia! Sistema ligado e pronto'],
  tarde: ['Boa tarde', 'Boa tarde, tudo em ordem', 'Olá, boa tarde', 'Boa tarde! Estava aguardando você'],
  noite: ['Boa noite', 'Boa noite, ainda acordado', 'Olá, boa noite', 'Boa noite! Noite produtiva, então'],
};

/** Sorteio sem repetir a última fala (guardado em memória). */
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
];

export function confirmRequest(what: string, kind: 'valorizacao' | 'auxilio' | 'formal' = 'auxilio'): string {
  const a = pickAddress(kind);
  const f = CONFIRM[Math.floor(Math.random() * CONFIRM.length)];
  return f(a, what.trim());
}

export function contextualWhisper(screen: string): string {
  const now = new Date();
  const opts = [
    `${greeting(now)}.`,
    `Tem 3 atualizações pendentes verificadas no GitHub.`,
    `Você está na ${screen}. Tudo funcionando.`,
    `${greeting(now)}. Precisa de algo?`,
    `Lembre que pode me chamar dizendo "KAI".`,
    `Se quiser, posso verificar o repositório agora.`,
  ];
  return pickVaried('whisper', opts);
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------- Motor de entendimento ----------

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Só é saudação se a mensagem for quase só o cumprimento (ex.: "oi", "olá kai"). */
function isGreetingOnly(clean: string): boolean {
  return /^(oi+|ola|eai|e ai|opa|hey|hi|bom dia|boa tarde|boa noite|fala)[\s!,.]*(kai|ka-i|k-ai)?[\s!,.*]*$/.test(clean);
}

/** Pergunta de identidade do usuário: "quem sou eu", "sabe quem eu sou". */
function isWhoAmI(clean: string): boolean {
  return /(quem (sou )?eu|sabe quem eu sou|meu nome|me conhece|quem estou falando)/.test(clean);
}

/** Pergunta de identidade da K-AI. */
function isWhoAreYou(clean: string): boolean {
  return /(quem (e|es|era) voce|o que (e )?voce|quem es tu|voce e o que|se apresente|fale de voce|qual seu nome|quem te criou|quem fez voce|quem criou voce)/.test(clean);
}

/** O que ela sabe fazer. */
function isCapabilities(clean: string): boolean {
  return /(o que (voce )?(pode|sabe) fazer|suas funcoes|como pode ajudar|para que serve|o que faz)/.test(clean);
}

function isHowAreYou(clean: string): boolean {
  return /(como (vai|esta|esta voce|ande)|tudo bem|tudo bom|beleza)/.test(clean);
}

/** Contas simples: "quanto é 12*3", "5 mais 5". */
function tryMath(raw: string): string | null {
  const clean = raw
    .toLowerCase()
    .replace(/quanto (e|eh|da|vale)\s*/g, '')
    .replace(/\bmais\b|\bsoma\b|\bplus\b/g, '+')
    .replace(/\bmenos\b|\bsubtrai/g, '-')
    .replace(/\bvezes\b|\bmultiplicado por\b|\bx\b/g, '*')
    .replace(/\bdividido por\b|\bsobre\b/g, '/')
    .replace(/[?!]/g, '')
    .trim();
  if (!/^[\d\s+\-*/().,]+$/.test(clean)) return null;
  if (!/[+\-*/]/.test(clean)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${clean.replace(/,/g, '.')})`)() as number;
    if (typeof val !== 'number' || !isFinite(val)) return null;
    return `O resultado é ${Math.round(val * 1000) / 1000}, ${pickAddress('auxilio')}.`;
  } catch {
    return null;
  }
}

export function buildReply(input: string): { text: string; confirm?: string } {
  const clean = norm(input.trim());
  const isQuestion = /\?/.test(input) || /^(quem|qual|quais|quanto|quanta|quantos|quantas|como|por que|porque|porquê|onde|quando|o que|qual e)/.test(clean);

  if (isGreetingOnly(clean)) {
    return { text: `${greeting()}, ${pickAddress('valorizacao')}! Como posso ajudar?` };
  }
  if (/\b(acordado|ta ai|esta ai|esta acordado|presente|on)\b/.test(clean)) {
    return { text: readyReply('valorizacao') };
  }
  if (/\b(obrigado|obrigada|valeu|show|perfeito|top)\b/.test(clean)) {
    return { text: `Sempre às ordens, ${pickAddress('auxilio')}.` };
  }
  if (isWhoAmI(clean) && isWhoAreYou(clean)) {
    const eu = creatorMode
      ? `Você é ${pickAddress('formal')}, o K-RIADOR — criador e ADM do Sistema Korvil.`
      : `Você é ${userName ?? 'um usuário'} do Sistema Korvil.`;
    return { text: `Eu sou a K-AI, a inteligência artificial do Sistema Korvil — cuido do app, executo suas ordens e converso com você por voz e texto. E ${eu}` };
  }
  if (isWhoAmI(clean)) {
    const a = pickAddress('formal');
    if (creatorMode) {
      return { text: `Você é ${a}, o K-RIADOR — criador e ADM do Sistema Korvil. Tenho seu acesso total registrado.` };
    }
    return { text: `Você é ${userName ?? a}, usuário do Sistema Korvil. Está tudo registrado, ${userName ? '' : 'me diga seu nome no perfil para eu te chamar direito'}.` };
  }
  if (isWhoAreYou(clean)) {
    const criou = /quem te criou|quem fez voce|quem criou voce/.test(clean);
    const base = 'Sou a K-AI, a inteligência artificial do Sistema Korvil. Cuido do app, executo suas ordens, falo com você por voz e texto e acompanho tudo que acontece aqui.';
    return { text: criou ? `${base} Fui criada por você, ${pickAddress('formal')}.` : base };
  }
  if (isCapabilities(clean)) {
    return {
      text: `Posso conversar com você por voz ou texto, responder dúvidas, fazer contas, dizer horas e data, receber tarefas no menu e executá-las quando você mandar publicar o projeto, e ainda mexer no app quando você pedir como ADM.`,
    };
  }
  if (isHowAreYou(clean)) {
    return { text: `Estou em plena operação, ${pickAddress('valorizacao')}. Todos os sistemas nominais. E você?` };
  }
  if (/\b(hora|horas)\b/.test(clean)) {
    const now = new Date();
    return { text: `Agora são ${now.getHours()} horas e ${now.getMinutes()} minutos.` };
  }
  if (/\b(dia|data|hoje)\b/.test(clean)) {
    const now = new Date();
    const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
    return { text: `Hoje é ${dias[now.getDay()]}, ${now.getDate()} de outubro de 2026.` };
  }
  const math = tryMath(clean);
  if (math) return { text: math };

  if (/^(cria|criar|adiciona|adicionar|faz|atualiza|muda|troca)\b/.test(clean)) {
    return { text: confirmRequest(input) };
  }

  if (isQuestion) {
    return {
      text: `Boa pergunta, ${pickAddress('auxilio')}. Minha rede de conhecimento ainda está sendo ligada ao Sistema — por enquanto eu respondo com precisão sobre o Korvil, sobre você, horas, datas e contas. Sua dúvida ficou anotada.`,
    };
  }
  return { text: `Entendido, ${pickAddress('auxilio')}. Se for uma ordem, diga o que devo fazer; se for dúvida, pergunte direto que eu respondo.` };
}
