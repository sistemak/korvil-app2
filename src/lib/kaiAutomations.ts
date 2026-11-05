/* Automações do K-AI (Programações > Automações > Lembretes):
   salvamento automático no banco + cópia no aparelho, agendamento e execução real
   dos envios (WhatsApp, Email, Ligação) na hora programada. */

import { supabase } from '@/lib/korvilAuth';
import { notifyAndSpeak } from '@/lib/kaiNotify';
import { speak, playBip } from '@/lib/kaiVoice';
import { speechText, pickAddress } from '@/lib/kaiPersonality';

export type Channel = 'whatsapp' | 'email' | 'sms' | 'call';
export type RepeatMode = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type AutoStatus = 'pending' | 'sent' | 'failed';

export interface KaiAutomation {
  id: string;
  title?: string | null;
  channels: Channel[];
  same_message: boolean;
  message: string;
  messages_by_channel: Partial<Record<Channel, string>>;
  wa_from: string;
  wa_to: string;
  wa_to_name: string;
  email_from: string;
  email_to: string;
  sms_from: string;
  sms_to: string;
  sms_to_name: string;
  call_from: string;
  call_to: string;
  call_to_name: string;
  scheduled_at: string | null;
  repeat: RepeatMode;
  weekdays: number[];
  voice_call: boolean;
  status: AutoStatus;
  last_error: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export function emptyAutomation(): KaiAutomation {
  return {
    id: '',
    title: '',
    channels: [],
    same_message: true,
    message: '',
    messages_by_channel: {},
    wa_from: '',
    wa_to: '',
    wa_to_name: '',
    email_from: '',
    email_to: '',
    sms_from: '',
    sms_to: '',
    sms_to_name: '',
    call_from: '',
    call_to: '',
    call_to_name: '',
    scheduled_at: null,
    repeat: 'once',
    weekdays: [],
    voice_call: false,
    status: 'pending',
    last_error: null,
    sent_at: null,
    created_at: '',
    updated_at: '',
  };
}

const LOCAL_KEY = 'kai-automations-cache';

function saveLocal(list: KaiAutomation[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    // storage cheio: banco é a fonte da verdade
  }
}

export async function listAutomations(): Promise<KaiAutomation[]> {
  const { data, error } = await supabase
    .from('kai_automations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  const list = (data ?? []) as KaiAutomation[];
  saveLocal(list);
  return list;
}

export async function loadLocalAutomations(): Promise<KaiAutomation[]> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as KaiAutomation[]) : [];
  } catch {
    return [];
  }
}

/** Cria ou atualiza (salvamento automático a cada digitação). */
export async function saveAutomation(a: KaiAutomation): Promise<KaiAutomation> {
  const payload = {
    title: a.title || null,
    channels: a.channels,
    same_message: a.same_message,
    message: a.message,
    messages_by_channel: a.messages_by_channel,
    wa_from: a.wa_from,
    wa_to: a.wa_to,
    wa_to_name: a.wa_to_name,
    email_from: a.email_from,
    email_to: a.email_to,
    sms_from: a.sms_from,
    sms_to: a.sms_to,
    sms_to_name: a.sms_to_name,
    call_from: a.call_from,
    call_to: a.call_to,
    call_to_name: a.call_to_name,
    scheduled_at: a.scheduled_at,
    repeat: a.repeat,
    weekdays: a.weekdays,
    voice_call: a.voice_call,
    status: a.status,
    updated_at: new Date().toISOString(),
  };

  if (!a.id) {
    const { data, error } = await supabase
      .from('kai_automations')
      .insert(payload)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data as KaiAutomation;
  }
  const { data, error } = await supabase
    .from('kai_automations')
    .update(payload)
    .eq('id', a.id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as KaiAutomation;
}

export async function deleteAutomation(id: string): Promise<void> {
  const { error } = await supabase.from('kai_automations').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Duplicar: cria uma cópia pendente com novo id. */
export async function duplicateAutomation(a: KaiAutomation): Promise<KaiAutomation> {
  const copy: KaiAutomation = {
    ...a,
    id: '',
    status: 'pending',
    sent_at: null,
    last_error: null,
    title: a.title ? `${a.title} (cópia)` : 'Cópia',
  };
  return saveAutomation(copy);
}

/* ---------------- Execução dos envios ---------------- */

function channelLabel(c: Channel): string {
  return { whatsapp: 'WhatsApp', email: 'Email', sms: 'SMS', call: 'Ligação' }[c];
}

/** Executa a automação agora: dispara cada canal escolhido. */
export async function executeAutomation(a: KaiAutomation): Promise<boolean> {
  playBip();
  const results: string[] = [];
  const fails: string[] = [];

  const msgFor = (c: Channel) =>
    a.same_message ? a.message : (a.messages_by_channel[c] ?? '');

  for (const c of a.channels) {
    const m = msgFor(c);
    try {
      if (c === 'whatsapp') {
        const digits = (a.wa_to || '').replace(/[^\d]/g, '');
        const text = encodeURIComponent(m);
        const number = digits.length >= 10 ? `${digits}` : '';
        window.open(
          number
            ? `https://wa.me/${number}?text=${text}`
            : `https://wa.me/?text=${text}`,
          '_blank'
        );
        results.push(channelLabel(c));
      } else if (c === 'email') {
        window.location.href = `mailto:${a.email_to}?subject=${encodeURIComponent(
          'Lembrete do K-AI'
        )}&body=${encodeURIComponent(m)}`;
        results.push(channelLabel(c));
      } else if (c === 'sms') {
        window.location.href = `sms:${a.sms_to}?body=${encodeURIComponent(m)}`;
        results.push(channelLabel(c));
      } else if (c === 'call') {
        window.location.href = `tel:${a.call_to}`;
        results.push(channelLabel(c));
      }
    } catch {
      fails.push(channelLabel(c));
    }
  }

  const ok = results.length > 0;
  const chanTxt = results.join(', ');

  // Avisa você: notificação + voz.
  if (ok) {
    const who = a.wa_to_name || a.call_to_name || a.sms_to_name || a.email_to || 'destinatário';
    const spoken = `Automação enviada para ${who} via ${chanTxt}, ${pickAddress('valorizacao')}.`;
    notifyAndSpeak(
      'K-AI',
      `Automação enviada para ${who} via ${chanTxt}`,
      `${window.location.origin}/?automacao=${a.id}`
    );
    speak(speechText(spoken));
  } else {
    notifyAndSpeak('K-AI', `Automação falhou: ${fails.join(', ')}`);
    speak(speechText('A automação falhou. Pode tentar de novo?'));
  }

  // Marca no banco.
  await supabase
    .from('kai_automations')
    .update({
      status: ok ? 'sent' : 'failed',
      sent_at: ok ? new Date().toISOString() : null,
      last_error: ok ? null : `Falhou: ${fails.join(', ')}`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', a.id);

  // Repetição: reagenda a próxima ocorrência.
  if (ok && a.repeat !== 'once') {
    const next = nextOccurrence(a);
    if (next) {
      await supabase
        .from('kai_automations')
        .update({ scheduled_at: next, status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', a.id);
    }
  }

  return ok;
}

/** Próxima ocorrência conforme a repetição. */
function nextOccurrence(a: KaiAutomation): string | null {
  const base = a.scheduled_at ? new Date(a.scheduled_at) : new Date();
  const next = new Date(base);
  switch (a.repeat) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly': {
      // Próximo dia escolhido (ou mesma semana seguinte).
      const days = a.weekdays.length ? a.weekdays : [base.getDay()];
      for (let i = 1; i <= 7; i++) {
        const cand = new Date(base);
        cand.setDate(base.getDate() + i);
        if (days.includes(cand.getDay())) {
          return cand.toISOString();
        }
      }
      next.setDate(next.getDate() + 7);
      break;
    }
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return null;
  }
  return next.toISOString();
}

/* ---------------- Agendador (roda no app aberto) ---------------- */

let timer: ReturnType<typeof setInterval> | null = null;

/** Liga o relógio: a cada minuto verifica o que venceu e executa. */
export function startAutomationScheduler(): () => void {
  if (timer) return () => {};
  timer = setInterval(checkDue, 30_000);
  void checkDue();
  return () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export async function checkDue(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('kai_automations')
      .select('*')
      .eq('status', 'pending')
      .not('scheduled_at', 'is', null)
      .lte('scheduled_at', new Date().toISOString());
    if (error) return 0;
    const due = (data ?? []) as KaiAutomation[];
    if (due.length === 0) return 0;

    // O servidor (relógio 24h) é quem envia de verdade. Aqui, no app, avisamos você
    // com notificação + voz sobre o que o servidor já processou e fazemos os
    // canais de dispositivo (WhatsApp, ligação) abrirem no aparelho.
    for (const a of due) {
      const { data: fresh } = await supabase
        .from('kai_automations')
        .select('status')
        .eq('id', a.id)
        .maybeSingle();
      if (fresh && (fresh as { status: string }).status === 'sent') {
        const who = a.wa_to_name || a.call_to_name || a.sms_to_name || a.email_to || 'destinatário';
        notifyAndSpeak(
          'K-AI',
          `Automação enviada para ${who}`,
          `${window.location.origin}/?automacao=${a.id}`
        );
      } else if (!fresh || (fresh as { status: string }).status === 'pending') {
        // Servidor ainda não rodou: executa local pra não perder o horário.
        await executeAutomation(a);
      }
    }
    return due.length;
  } catch {
    return 0;
  }
}
