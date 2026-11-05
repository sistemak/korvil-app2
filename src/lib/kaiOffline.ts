/* Modo offline: ordens ditas sem internet ficam salvas no aparelho e são
   sincronizadas sozinhas quando a conexão volta. */

export interface OfflineOrder {
  id: string;
  text: string;
  when: number;
}

const KEY = 'kai-offline-orders';
const MAX = 30;

export function loadOfflineOrders(): OfflineOrder[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as OfflineOrder[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOfflineOrder(text: string): OfflineOrder {
  const o: OfflineOrder = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text,
    when: Date.now(),
  };
  const all = loadOfflineOrders();
  try {
    localStorage.setItem(KEY, JSON.stringify([o, ...all].slice(0, MAX)));
  } catch {
    // storage cheio: ignora
  }
  return o;
}

export function removeOfflineOrder(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(loadOfflineOrders().filter((o) => o.id !== id)));
  } catch {
    // ignora
  }
}

export function countOfflineOrders(): number {
  return loadOfflineOrders().length;
}

/** Envia todas as ordens salvas para o cérebro do K-AI; devolve quantas foram. */
export async function flushOfflineOrders(
  send: (text: string) => Promise<boolean>
): Promise<number> {
  const orders = loadOfflineOrders();
  let sent = 0;
  for (const o of orders) {
    const ok = await send(o.text);
    if (!ok) break; // sem rede de novo: para e mantém o resto
    removeOfflineOrder(o.id);
    sent++;
  }
  return sent;
}

/** Liga o sincronizador automático: assim que a internet volta, envia as ordens. */
export function startOfflineSync(send: (text: string) => Promise<boolean>): () => void {
  const flush = () => {
    if (navigator.onLine) void flushOfflineOrders(send);
  };
  window.addEventListener('online', flush);
  flush();
  return () => window.removeEventListener('online', flush);
}
