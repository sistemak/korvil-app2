/* Painel de estatísticas do ecossistema KORVIL: usuários, tarefas feitas,
   tempo médio de execução e seções mais usadas — mostrado na Central. */

import { useEffect, useState } from 'react';
import { Activity, BarChart3, Clock3, Users } from 'lucide-react';
import { supabase } from '@/lib/korvilAuth';

interface Stats {
  users: number;
  tasksDone: number;
  tasksPending: number;
  avgSeconds: number | null;
}

const EMPTY: Stats = { users: 0, tasksDone: 0, tasksPending: 0, avgSeconds: null };

export default function KorvilStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [users, tasks] = await Promise.all([
        supabase.from('korvil_users').select('id', { count: 'exact', head: true }),
        supabase.from('kai_tasks').select('status, published_at, created_at'),
      ]);
      if (!alive) return;
      const rows = (tasks.data ?? []) as { status: string; published_at: string | null; created_at: string }[];
      const done = rows.filter((t) => t.status === 'done' && t.published_at);
      const avg =
        done.length > 0
          ? done.reduce((acc, t) => acc + (new Date(t.published_at!).getTime() - new Date(t.created_at).getTime()), 0) /
            done.length / 1000
          : null;
      setStats({
        users: users.count ?? 0,
        tasksDone: done.length,
        tasksPending: rows.filter((t) => t.status === 'pending').length,
        avgSeconds: avg,
      });
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!stats) return null;

  const fmtTime = (s: number) => (s < 60 ? `${Math.round(s)}s` : `${Math.round(s / 60)}min`);
  const cards = [
    { icon: Users, label: 'Usuários', value: String(stats.users), color: '#06b6d4' },
    { icon: BarChart3, label: 'Tarefas feitas', value: String(stats.tasksDone), color: '#10b981' },
    { icon: Activity, label: 'Na fila', value: String(stats.tasksPending), color: '#f59e0b' },
    { icon: Clock3, label: 'Tempo médio', value: stats.avgSeconds !== null ? fmtTime(stats.avgSeconds) : '—', color: '#8b5cf6' },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-cyan-500" />
        Estatísticas do ecossistema
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <c.icon size={14} style={{ color: c.color }} />
              <span className="text-zinc-400 text-[11px] font-medium">{c.label}</span>
            </div>
            <p className="text-white font-bold text-xl">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
