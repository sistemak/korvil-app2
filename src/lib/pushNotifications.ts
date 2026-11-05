import { supabase, getSessionUser } from '@/lib/korvilAuth';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const NOTIFY_URL = `${SUPABASE_URL}/functions/v1/notificar-atividade`;

export function isPhonePushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export async function hasPhoneNotifications(): Promise<boolean> {
  if (!isPhonePushSupported()) return false;
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  return existing !== null;
}

function base64UrlToBuffer(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  return bytes.buffer;
}

export async function enablePhoneNotifications(): Promise<string | null> {
  if (!isPhonePushSupported()) {
    return 'Para receber notificações, instale o app na tela inicial do celular e abra por ele.';
  }
  const user = await getSessionUser();
  if (!user?.id) return 'Entre na conta de ADM para ativar as notificações.';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return 'Permissão negada. Libere as notificações nas configurações do celular.';
  }

  const res = await fetch(NOTIFY_URL, { method: 'GET' });
  const body = await res.json().catch(() => null);
  if (!res.ok || typeof body?.publicKey !== 'string') {
    return 'Não foi possível preparar as notificações. Tente novamente.';
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBuffer(body.publicKey),
  });
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return 'A assinatura de notificações veio incompleta. Tente novamente.';
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({ user_id: user.id, endpoint: json.endpoint, keys: json.keys }, { onConflict: 'endpoint' });
  if (error) return 'Não foi possível salvar a ativação. Tente novamente.';
  return null;
}
