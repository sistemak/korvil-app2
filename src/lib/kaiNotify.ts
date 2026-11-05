/* Notificações do K-AI: avisa no celular quando uma tarefa é feita, fala a mensagem em voz
   e abre o app na tarefa ao tocar na notificação. */

import { speak } from '@/lib/kaiVoice';

export function taskMessage(title: string, ok: boolean): string {
  return ok ? `Tarefa concluída: ${title}` : `Falhou: ${title}`;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  try {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const res = await Notification.requestPermission();
    return res === 'granted';
  } catch {
    return false;
  }
}

/** Mostra a notificação da tarefa, fala a mensagem em voz alta e o toque abre o app na tarefa. */
export async function notifyTaskDone(taskId: string, title: string, ok: boolean): Promise<void> {
  const body = taskMessage(title, ok);
  const url = `${window.location.origin}/?tarefa=${encodeURIComponent(taskId)}&falar=${encodeURIComponent(body)}`;
  speak(body);
  await notifyAndSpeak('K-AI', body, url);
}

/** Notificação + voz juntas: tudo que o K-AI fala no modo ilimitado sai com as duas. */
export async function notifyAndSpeak(title: string, body: string, url?: string): Promise<void> {
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: `kai-${Date.now()}`,
        data: { url: url ?? window.location.origin },
      });
      return;
    }
    const n = new Notification(title, { body, icon: '/icons/icon-192.png' });
    n.onclick = () => {
      window.focus();
      if (url) window.location.href = url;
    };
  } catch {
    // sem permissão: só a voz
  }
}
