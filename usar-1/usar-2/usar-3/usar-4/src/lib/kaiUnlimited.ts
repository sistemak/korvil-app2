/* Motor ilimitado do K-AI: interpreta qualquer pedido e executa o que o navegador
   do celular permite de verdade — tocar música no YouTube, ligar, WhatsApp, email,
   despertador, abrir apps, vibrar. O que só app nativo faz (lanterna, volume,
   falar dentro da ligação) o motor reconhece e responde com honestidade. */

import { notifyAndSpeak, ensureNotificationPermission } from '@/lib/kaiNotify';
import { pickAddress } from '@/lib/kaiPersonality';
import { addHistory } from '@/lib/kaiHistory';

export interface UnlimitedResult {
  handled: boolean;   // o motor reconheceu o pedido?
  spoken: string;     // o que a K-AI fala em voz alta
  confirm?: string;   // pedido que precisa de "sim" antes de executar
  pendingAction?: PendingCall; // guardado até o "sim"
}

export interface PendingCall {
  name: string;
  number: string;
  message: string;
}

/* ---------------- YouTube ---------------- */

/** "toca música X no youtube", "toca X" */
function parseYouTube(text: string): string | null {
  const m = text.match(
    /(?:toca|toque|tocar|põe|poe|põr|coloca|colocar|play)\s+(?:a\s+)?(?:m[uú]sica\s+)?(.+?)(?:\s+no\s+youtube|\s+no\s+spotif[yí]|\s+no\s+deezer)?$/i
  );
  if (!m) return null;
  const song = m[1].replace(/^(o |a |um |uma )/i, '').trim();
  if (!song) return null;
  return song;
}

function openYouTubeMusic(song: string): void {
  // Abre a busca direto no YouTube (app se instalado, senão o navegador).
  window.open(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`,
    '_blank'
  );
}

/* ---------------- Ligações ---------------- */

const CONTACTS: Record<string, string> = {
  // Números conhecidos do criador podem ser cadastrados aqui.
};

/** "liga pra joão", "ligar para 11 9..." */
function parseCall(text: string): { name: string; number: string } | null {
  const m = text.match(/liga(?:r)?\s+(?:pra|para|pro|ao|à)\s+(.+)/i);
  if (!m) return null;
  const target = m[1].replace(/\s+e\s+fala.*$/i, '').trim();
  const digits = target.replace(/[^\d+]/g, '');
  if (digits.length >= 8) return { name: target, number: digits };
  const known = CONTACTS[target.toLowerCase()];
  if (known) return { name: target, number: known };
  return null;
}

/** "e fala que ..." — mensagem para a ligação. */
function parseCallMessage(text: string): string {
  const m = text.match(/fala(?:r)?\s+(?:que\s+)?(.+)$/i);
  return m ? m[1].trim() : '';
}

/* ---------------- WhatsApp ---------------- */

/** "manda whatsapp pra X falando Y" */
function parseWhatsApp(text: string): { target: string; message: string } | null {
  const m = text.match(/manda(?:r)?\s+(?:um\s+)?(?:whatsa?pp|zap)\s+(?:pra|para|pro)\s+(.+?)(?:\s+(?:falando|dizendo)\s+(.+))?$/i);
  if (!m) return null;
  return { target: m[1].trim(), message: (m[2] ?? '').trim() };
}

/* ---------------- Email ---------------- */

function parseEmail(text: string): { to: string; subject: string } | null {
  const m = text.match(/manda(?:r)?\s+(?:um\s+)?e-?mail\s+(?:pra|para)\s+(\S+@\S+?)(?:\s+(?:falando|dizendo|com o assunto)\s+(.+))?$/i);
  if (!m) return null;
  return { to: m[1], subject: m[2] ?? 'Mensagem do K-AI' };
}

/* ---------------- Despertador ---------------- */

/** "desperta me às 7", "acorda me 7 e meia" */
function parseAlarm(text: string): { h: number; m: number } | null {
  const m = text.match(/(?:desperta|acorda)\s*(?:me)?\s*(?:as|às)?\s*(\d{1,2})(?:[:h](\d{2}))?(?:\s*(?:e|com)\s*(?:meia|meiuca|trinta))?/i);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  let mMin = m[2] ? parseInt(m[2], 10) : 0;
  if (/meia|meiuca|trinta/i.test(text)) mMin = 30;
  if (h < 0 || h > 23 || mMin > 59) return null;
  return { h, m: mMin };
}

function scheduleAlarm(h: number, m: number): void {
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  const delay = Math.min(target.getTime() - Date.now(), 2_147_000_000);
  setTimeout(() => {
    void notifyAndSpeak('K-AI', 'Está na hora, criador! Despertador do K-AI.');
  }, delay);
}

/* ---------------- Abrir apps / sites ---------------- */

const KNOWN_APPS: Array<[RegExp, string]> = [
  [/whatsa?pp|zap\b/i, 'https://wa.me/'],
  [/youtube/i, 'https://youtube.com'],
  [/instagram|insta\b/i, 'https://instagram.com'],
  [/facebook|face\b/i, 'https://facebook.com'],
  [/google/i, 'https://google.com'],
  [/gmail|e-?mail/i, 'https://mail.google.com'],
  [/maps|mapas/i, 'https://maps.google.com'],
  [/spotify/i, 'https://open.spotify.com'],
  [/github/i, 'https://github.com/sistemak/korvil-app'],
];

function parseOpenApp(text: string): string | null {
  const m = text.match(/(?:abre|abrir|abra)\s+(?:o\s+|a\s+|o\s+app\s+|o\s+site\s+)?(.+)/i);
  if (!m) return null;
  const target = m[1].trim().toLowerCase();
  for (const [re, url] of KNOWN_APPS) {
    if (re.test(target)) return url;
  }
  // Não reconheceu: tenta como site direto.
  if (/^[\w-]+\.[a-z]{2,}$/.test(target)) return `https://${target}`;
  return null;
}

/* ---------------- Ações só nativas (resposta honesta) ---------------- */

const NATIVE_ONLY: Array<[RegExp, string]> = [
  [/lanterna|flashlight/i, 'acender a lanterna'],
  [/volume/i, 'controlar o volume'],
  [/tira (?:uma )?foto|c[aâ]mera/i, 'tirar foto'],
  [/bloqueia|fecha (?:o )?app|fechar aplicativo/i, 'fechar outros apps'],
  [/fala (?:na|dentro da) ligação|falar dentro da chamada/i, 'falar dentro da ligação'],
];

/* ---------------- Motor principal ---------------- */

export function runUnlimited(text: string): UnlimitedResult {
  const t = text.trim();
  const addr = pickAddress('valorizacao');

  // 1. YouTube
  const song = parseYouTube(t);
  if (song) {
    openYouTubeMusic(song);
    const spoken = `Tocando ${song}, ${addr}.`;
    void notifyAndSpeak('K-AI', `Tocando ${song}`, 'https://youtube.com');
    addHistory({ what: t, file: '(ação)', summary: `Tocou música ${song} no YouTube` });
    return { handled: true, spoken };
  }

  // 2. Ligação (com confirmação antes)
  const call = parseCall(t);
  if (call) {
    const message = parseCallMessage(t);
    return {
      handled: true,
      spoken: '',
      confirm: message
        ? `Posso ligar para ${call.name} e falar que ${message}, ${addr}?`
        : `Posso ligar para ${call.name}, ${addr}?`,
      pendingAction: { name: call.name, number: call.number, message },
    };
  }

  // 3. WhatsApp
  const wa = parseWhatsApp(t);
  if (wa) {
    const digits = wa.target.replace(/[^\d+]/g, '');
    if (digits.length >= 10) {
      window.location.href = `https://wa.me/${digits}?text=${encodeURIComponent(wa.message)}`;
    } else {
      window.location.href = `https://wa.me/?text=${encodeURIComponent(`${wa.message}`)}`;
    }
    const spoken = `Abrindo o WhatsApp, ${addr}.`;
    void notifyAndSpeak('K-AI', `WhatsApp para ${wa.target}`);
    addHistory({ what: t, file: '(ação)', summary: `Mandou WhatsApp para ${wa.target}` });
    return { handled: true, spoken };
  }

  // 4. Email
  const mail = parseEmail(t);
  if (mail) {
    window.location.href = `mailto:${mail.to}?subject=${encodeURIComponent(mail.subject)}`;
    const spoken = `Abrindo o email, ${addr}.`;
    void notifyAndSpeak('K-AI', `Email para ${mail.to}`);
    addHistory({ what: t, file: '(ação)', summary: `Email para ${mail.to}` });
    return { handled: true, spoken };
  }

  // 5. Despertador
  const alarm = parseAlarm(t);
  if (alarm) {
    scheduleAlarm(alarm.h, alarm.m);
    const hh = String(alarm.h).padStart(2, '0');
    const mm = String(alarm.m).padStart(2, '0');
    const spoken = `Despertador programado para ${hh}:${mm}, ${addr}.`;
    void notifyAndSpeak('K-AI', spoken);
    addHistory({ what: t, file: '(ação)', summary: `Despertador ${hh}:${mm}` });
    return { handled: true, spoken };
  }

  // 6. Abrir apps e sites
  const appUrl = parseOpenApp(t);
  if (appUrl) {
    window.open(appUrl, '_blank');
    const spoken = `Abrindo, ${addr}.`;
    void notifyAndSpeak('K-AI', spoken);
    addHistory({ what: t, file: '(ação)', summary: `Abriu ${appUrl}` });
    return { handled: true, spoken };
  }

  // 7. Vibração
  if (/vibra|r?tremor/i.test(t)) {
    navigator.vibrate?.([120, 80, 120]);
    const spoken = `Vibrei, ${addr}.`;
    return { handled: true, spoken };
  }

  // 8. Só nativo: resposta honesta
  for (const [re, label] of NATIVE_ONLY) {
    if (re.test(t)) {
      return {
        handled: true,
        spoken: `Para ${label} eu preciso do app Android do Korvil instalado no celular, ${addr}. Pelo navegador eu não consigo.`,
      };
    }
  }

  return { handled: false, spoken: '' };
}
/** Executa a ligação confirmada por voz ("sim"). */
export function executeCall(pending: PendingCall): string {
  window.location.href = `tel:${pending.number}`;
  const spoken = `Ligando para ${pending.name} agora, ${pickAddress('formal')}.`;
  void notifyAndSpeak('K-AI', `Ligação para ${pending.name}`);
  addHistory({
    what: `ligar pra ${pending.name}`,
    file: '(ação)',
    summary: pending.message
      ? `Ligação para ${pending.name}: ${pending.message}`
      : `Ligação para ${pending.name}`,
  });
  return spoken;
}

/** Garante permissão de notificação para o modo ilimitado. */
export async function ensureUnlimitedReady(): Promise<void> {
  await ensureNotificationPermission();
}
