import { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import {
  enablePhoneNotifications,
  hasPhoneNotifications,
  isPhonePushSupported,
} from '@/lib/pushNotifications';

export default function PhoneNotificationsButton() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    hasPhoneNotifications().then(setEnabled).catch(() => setEnabled(false));
  }, []);

  const handleEnable = async () => {
    setBusy(true);
    setMessage(null);
    const error = await enablePhoneNotifications();
    setBusy(false);
    if (error) {
      setMessage(error);
      return;
    }
    setEnabled(true);
    setMessage('Notificações ativadas neste celular.');
  };

  if (!isPhonePushSupported()) {
    return (
      <p className="px-4 py-3 text-xs text-zinc-400">
        Para receber notificações no celular, instale o app na tela inicial e abra por ele.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={handleEnable}
        disabled={busy || enabled}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-cyan-300 hover:bg-cyan-500/10 transition-colors disabled:opacity-60"
      >
        {enabled ? <BellRing size={16} /> : <Bell size={16} />}
        {enabled ? 'Notificações do celular ativadas' : busy ? 'Ativando...' : 'Ativar notificações no celular'}
      </button>
      {message && <p className="px-4 pb-3 text-xs text-zinc-400">{message}</p>}
    </div>
  );
}
