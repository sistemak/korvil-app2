/* Modo criador: identifica o dono e executa ações reais no celular. */

export const CREATOR_KEY = 'korvil_device_id';

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(CREATOR_KEY);
    if (!id) {
      id = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(CREATOR_KEY, id);
    }
    return id;
  } catch {
    return 'dev-unknown';
  }
}

// O criador é a conta ADM oficial (korvil.p@gmail.com). Quem entra pelo link /criador
// recebe o modo criador somente se também estiver logado com a conta ADM.
export function isCreator(): boolean {
  try {
    if (localStorage.getItem(CREATOR_KEY) === 'creator-sistemak') {
      try {
        const raw = localStorage.getItem('korvil-auth');
        if (raw) {
          const session = JSON.parse(raw) as { user?: { email?: string } };
          if (isAdminEmail(session?.user?.email)) return true;
        }
      } catch {
        // sessão ilegível: não é criador
      }
    }
    return false;
  } catch {
    return false;
  }
}

export function markAsCreator() {
  localStorage.setItem(CREATOR_KEY, 'creator-sistemak');
}

/** Conta de administrador oficial do KORVIL. */
export const ADMIN_EMAIL = 'korvil.p@gmail.com';

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

export interface ActionResult {
  ok: boolean;
  spoken: string;
}

/** Executa ações nativas do celular via links e APIs do navegador. */
export async function runCreatorAction(text: string): Promise<ActionResult | null> {
  const lower = text.toLowerCase();

  // WhatsApp: abre o app com a mensagem pronta.
  const wa = lower.match(/whatsa?pp\s+(?:para\s+)?(\S+)\s+(.+)/);
  if (wa) {
    const msg = encodeURIComponent(text.slice(text.indexOf(wa[2])));
    window.location.href = `https://wa.me/?text=${msg}`;
    return { ok: true, spoken: 'Abrindo o WhatsApp, criador.' };
  }

  // Ligação.
  const tel = lower.match(/liga(r)?\s+(?:para\s+)?([\d()\s+-]{8,})/);
  if (tel) {
    window.location.href = `tel:${tel[2].replace(/[^\d+]/g, '')}`;
    return { ok: true, spoken: 'Fazendo a ligação, criador.' };
  }

  // YouTube.
  const yt = text.match(/(?:youtube|you tube)\s+(.+)/i);
  if (yt) {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(yt[1])}`,
      '_blank'
    );
    return { ok: true, spoken: `Buscando "${yt[1].trim()}" no YouTube, criador.` };
  }

  // Despertador / lembrete com notificação.
  const alarm = text.match(/(?:desperta|acorda)\s+(?:me\s+)?(?:as|às)?\s*(\d{1,2})(?:[:h](\d{2}))?/i);
  if (alarm) {
    const h = parseInt(alarm[1], 10);
    const m = alarm[2] ? parseInt(alarm[2], 10) : 0;
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        const target = new Date();
        target.setHours(h, m, 0, 0);
        if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
        const delay = target.getTime() - Date.now();
        setTimeout(() => {
          new Notification('K-AI', { body: 'Está na hora, criador!' });
        }, Math.min(delay, 2_147_000_000));
        return {
          ok: true,
          spoken: `Despertador programado para ${h}:${String(m).padStart(2, '0')}, criador.`,
        };
      }
      return { ok: false, spoken: 'Preciso da permissão de notificações para o despertador.' };
    } catch {
      return { ok: false, spoken: 'Notificações não disponíveis neste navegador.' };
    }
  }

  // Email.
  const mail = text.match(/e-?mail\s+(?:para\s+)?(\S+@\S+)/);
  if (mail) {
    window.location.href = `mailto:${mail[1]}?subject=${encodeURIComponent('Mensagem do K-AI')}`;
    return { ok: true, spoken: 'Abrindo o email, criador.' };
  }

  // Compartilhar.
  if (/\bcompartilha\b/.test(lower)) {
    const shareText = text.replace(/compartilha(r)?/i, '').trim();
    try {
      await navigator.share({ text: shareText });
      return { ok: true, spoken: 'Compartilhado, criador.' };
    } catch {
      return { ok: false, spoken: 'Compartilhamento cancelado.' };
    }
  }

  return null;
}
