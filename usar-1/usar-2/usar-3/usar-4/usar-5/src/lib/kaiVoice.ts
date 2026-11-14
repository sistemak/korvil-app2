/* Engine de voz do K-AI: síntese (fala), bip e escuta contínua com palavra de ativação. */

/* eslint-disable @typescript-eslint/no-explicit-any */

let audioCtx: AudioContext | null = null;

export function playBip() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    const ctx = audioCtx;
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 950;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // áudio indisponível: segue sem bip
  }
}

let speaking = false;

export function isSpeaking() {
  return speaking;
}

let chosenVoice: SpeechSynthesisVoice | null = null;

function selectMaleVoice(): SpeechSynthesisVoice | null {
  const synth = window.speechSynthesis;
  if (!synth) return null;
  const voices = synth.getVoices();
  const br = voices.filter((v) => /pt[-_]BR/i.test(v.lang));
  if (br.length === 0) return null;
  // Nomes masculinos conhecidos do pt-BR (Chrome/Android: "...male...", Daniel, Ricardo, Felipe, Thiago).
  const maleNames = /male|daniel|ricardo|felipe|thiago|homem|joaquim|ant(o|ô)nio/i;
  const femaleNames = /female|luciana|maria|fernanda|mulher|francisca|joana|vitoria|vitória/i;
  const byName = br.find((v) => maleNames.test(v.name) && !femaleNames.test(v.name));
  if (byName) return byName;
  const notFemale = br.find((v) => !femaleNames.test(v.name));
  if (notFemale) return notFemale;
  return br[0];
}

// A pronúncia fica dentro do motor de fala: qualquer texto que a K-AI falar
// soa "Kai", mesmo que o chamador esqueça de converter.
function speakable(text: string): string {
  return text.replace(/\bK-?AI\b/g, 'Kai');
}

export function speak(rawText: string) {
  try {
    const synth = window.speechSynthesis;
    const text = speakable(rawText);
    if (!synth || !text) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = 1.0;
    utter.pitch = 0.55; // tom mais grave = voz de homem
    utter.onstart = () => (speaking = true);
    utter.onend = () => (speaking = false);
    utter.onerror = () => (speaking = false);

    const pick = () => {
      if (!chosenVoice) chosenVoice = selectMaleVoice();
      if (chosenVoice) utter.voice = chosenVoice;
      synth.speak(utter);
    };

    if (synth.getVoices().length === 0) {
      let done = false;
      const once = () => {
        if (done) return;
        done = true;
        pick();
      };
      synth.addEventListener('voiceschanged', once, { once: true });
      setTimeout(once, 400);
    } else {
      pick();
    }
  } catch {
    // síntese indisponível
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
    speaking = false;
  } catch {
    // ignora
  }
}

const WAKE_RE = /\b(kai|cai|k-ai|kay)\b/i;

export interface WakeHandlers {
  onWake: () => void;
  onCommand: (text: string) => void;
  onSilence?: () => void;
}

/** Escuta contínua do microfone. Detecta "KAI", toca bip e coleta o pedido seguinte. */
export class WakeListener {
  private rec: any = null;
  private active = false;
  private armed = false;
  private deadline = 0;
  private commandBuf = '';
  private tickTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private handlers: WakeHandlers) {}

  start(): boolean {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return false;
    if (this.active) return true;
    this.active = true;
    this.spawn();
    return true;
  }

  stop() {
    this.active = false;
    if (this.tickTimer) clearTimeout(this.tickTimer);
    try {
      this.rec?.stop();
    } catch {
      // ignora
    }
  }

  private spawn() {
    if (!this.active) return;
    try {
      const SR =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'pt-BR';
      rec.onresult = (e: any) => this.onResult(e);
      rec.onend = () => {
        if (this.active) setTimeout(() => this.spawn(), 300);
      };
      rec.onerror = (e: any) => {
        if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
          this.active = false;
        }
      };
      rec.start();
      this.rec = rec;
    } catch {
      if (this.active) setTimeout(() => this.spawn(), 1000);
    }
  }

  private onResult(e: any) {
    let finalText = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += ` ${e.results[i][0].transcript} `;
    }
    finalText = finalText.trim();
    if (!finalText) return;

    const now = Date.now();
    if (!this.armed) {
      if (WAKE_RE.test(finalText)) {
        this.armed = true;
        this.commandBuf = '';
        this.deadline = now + 3000;
        playBip();
        this.handlers.onWake();
        this.watch();
      }
    } else {
      const cmd = finalText.replace(WAKE_RE, ' ').trim();
      if (cmd) this.commandBuf += `${cmd} `;
      this.deadline = now + 2000; // 2s de silêncio encerram o pedido
    }
  }

  private watch() {
    if (this.tickTimer) clearTimeout(this.tickTimer);
    const tick = () => {
      if (!this.armed) return;
      const left = this.deadline - Date.now();
      if (left <= 0) {
        this.armed = false;
        const cmd = this.commandBuf.trim();
        this.commandBuf = '';
        if (cmd) this.handlers.onCommand(cmd);
        else this.handlers.onSilence?.();
        return;
      }
      this.tickTimer = setTimeout(tick, Math.min(200, left));
    };
    this.tickTimer = setTimeout(tick, 200);
  }
}
