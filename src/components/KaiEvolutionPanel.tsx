/* Painel de Evolução Autônoma do K-AI: mostra propostas, saúde dos provedores,
   configuração de push e histórico de evolução. */

import { useState, useEffect, useCallback } from 'react';
import {
  X, Sparkles, Check, XCircle, Clock, Zap, Activity, RefreshCw,
  Bell, BellOff, Loader2, FileCode, AlertCircle, CheckCircle2,
  Brain, TrendingUp,
} from 'lucide-react';
import {
  listProposals, executeProposal, rejectProposal, triggerEvolutionCycle,
  checkProviderHealth, getEvolutionStats, getProposalIdFromUrl,
  type KaiProposal, type ProviderHealth,
} from '@/lib/kaiEvolution';
import { enablePhoneNotifications, hasPhoneNotifications, isPhonePushSupported } from '@/lib/pushNotifications';

interface Props {
  onClose: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  improve_ui: 'Melhorar UI',
  fix_bug: 'Corrigir Bug',
  add_feature: 'Novo Recurso',
  optimize: 'Otimizar',
  refactor: 'Refatorar',
  new_automation: 'Nova Automação',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Aguardando', color: 'text-amber-400', icon: Clock },
  approved: { label: 'Aprovado', color: 'text-cyan-400', icon: Check },
  rejected: { label: 'Rejeitado', color: 'text-zinc-500', icon: XCircle },
  executing: { label: 'Executando', color: 'text-blue-400', icon: Loader2 },
  executed: { label: 'Executado', color: 'text-green-400', icon: CheckCircle2 },
  failed: { label: 'Falhou', color: 'text-red-400', icon: AlertCircle },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

export default function KaiEvolutionPanel({ onClose }: Props) {
  const [proposals, setProposals] = useState<KaiProposal[]>([]);
  const [health, setHealth] = useState<ProviderHealth | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, executed: 0, rejected: 0, failed: 0 });
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported] = useState(isPhonePushSupported());
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [triggering, setTriggering] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, s] = await Promise.all([listProposals(25), getEvolutionStats()]);
      setProposals(p);
      setStats(s);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    // Check if opened from a notification (?kai-proposal=ID)
    const proposalId = getProposalIdFromUrl();
    if (proposalId) {
      const qs = new URLSearchParams(window.location.search);
      qs.delete('kai-proposal');
      const rest = qs.toString();
      window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));
    }
    // Check push status
    void hasPhoneNotifications().then(setPushEnabled);
    // Check provider health
    void checkProviderHealth().then(setHealth);
  }, [refresh]);

  const handleExecute = useCallback(async (id: string) => {
    setExecuting(id);
    try {
      const result = await executeProposal(id);
      if (result.ok) {
        await refresh();
      } else {
        setError(result.error ?? 'Erro ao executar');
      }
    } finally {
      setExecuting(null);
    }
  }, [refresh]);

  const handleReject = useCallback(async (id: string) => {
    await rejectProposal(id);
    await refresh();
  }, [refresh]);

  const handleTrigger = useCallback(async () => {
    setTriggering(true);
    try {
      const result = await triggerEvolutionCycle();
      if (result.ok) {
        await refresh();
      } else {
        setError(result.error ?? 'Erro ao gerar proposta');
      }
    } finally {
      setTriggering(false);
    }
  }, [refresh]);

  const handleEnablePush = useCallback(async () => {
    setEnablingPush(true);
    setPushMsg(null);
    try {
      const err = await enablePhoneNotifications();
      if (err) {
        setPushMsg(err);
      } else {
        setPushEnabled(true);
        setPushMsg('Notificações push ativadas no celular!');
      }
    } finally {
      setEnablingPush(false);
    }
  }, []);

  const pendingProposal = proposals.find((p) => p.status === 'pending');

  return (
    <div className="fixed inset-0 z-[10002] bg-black/70 flex items-center justify-center p-3" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] bg-[#0a0a0a] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/15 flex items-center justify-center">
              <Brain size={16} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Evolução Autônoma K-AI</h2>
              <p className="text-zinc-500 text-[10px]">O K-AI evolui sozinho a cada 5 minutos</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total', value: stats.total, color: 'text-white' },
              { label: 'Pendentes', value: stats.pending, color: 'text-amber-400' },
              { label: 'Executadas', value: stats.executed, color: 'text-green-400' },
              { label: 'Rejeitadas', value: stats.rejected, color: 'text-zinc-500' },
            ].map((s) => (
              <div key={s.label} className="bg-zinc-900/60 rounded-xl p-2.5 text-center border border-zinc-800">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-zinc-500 text-[9px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Provider Health */}
          <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-cyan-400" />
              <h3 className="text-zinc-200 font-semibold text-xs">Saúde dos Provedores de IA</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Groq', ok: health?.groq.available, icon: 'G' },
                { name: 'Gemini', ok: health?.gemini.available, icon: 'Gm' },
                { name: 'Pollinations', ok: health?.pollinations.available, icon: 'P' },
              ].map((p) => (
                <div key={p.name} className={`rounded-lg p-2 text-center border ${p.ok ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  <p className={`text-sm font-bold ${p.ok ? 'text-green-400' : 'text-red-400'}`}>{p.name}</p>
                  <p className={`text-[9px] ${p.ok ? 'text-green-500/70' : 'text-red-500/70'}`}>
                    {p.ok ? 'Online' : 'Offline'}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-zinc-600 text-[9px] mt-2">
              O K-AI tenta Groq → Gemini → Pollinations. Se um falha, o próximo assume automaticamente.
            </p>
          </div>

          {/* Push notification config */}
          <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {pushEnabled ? <Bell size={14} className="text-cyan-400" /> : <BellOff size={14} className="text-zinc-500" />}
                <div>
                  <h3 className="text-zinc-200 font-semibold text-xs">Notificações Push</h3>
                  <p className="text-zinc-500 text-[10px]">
                    {pushSupported
                      ? pushEnabled
                        ? 'Ativadas — você recebe propostas no celular'
                        : 'Desativadas — ative para receber propostas'
                      : 'Não suportado neste dispositivo'}
                  </p>
                </div>
              </div>
              {pushSupported && !pushEnabled && (
                <button
                  onClick={handleEnablePush}
                  disabled={enablingPush}
                  className="bg-cyan-500 text-black text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-400 transition disabled:opacity-50 flex items-center gap-1"
                >
                  {enablingPush ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
                  Ativar
                </button>
              )}
            </div>
            {pushMsg && (
              <p className={`text-[10px] mt-2 ${pushMsg.includes('ativ') ? 'text-green-400' : 'text-amber-400'}`}>{pushMsg}</p>
            )}
            <div className="mt-2 pt-2 border-t border-zinc-800/60">
              <p className="text-zinc-500 text-[9px]">
                A cada 5 min, o K-AI gera uma proposta e envia push com botões <span className="text-green-400">SIM</span> e <span className="text-red-400">NÃO</span>.
                No Android, os botões aparecem direto na notificação. No iPhone, toque na notificação para abrir aqui.
              </p>
            </div>
          </div>

          {/* Manual trigger */}
          <button
            onClick={handleTrigger}
            disabled={triggering}
            className="w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold text-sm py-2.5 rounded-xl hover:bg-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {triggering ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Gerar proposta agora
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 flex items-center gap-2">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-red-300 text-[11px]">{error}</p>
            </div>
          )}

          {/* Pending proposal — highlight at top */}
          {pendingProposal && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-amber-400" />
                <span className="text-amber-300 font-bold text-xs">Proposta aguardando sua decisão</span>
              </div>
              <ProposalCard
                proposal={pendingProposal}
                onExecute={handleExecute}
                onReject={handleReject}
                executing={executing === pendingProposal.id}
              />
            </div>
          )}

          {/* Proposal history */}
          <div>
            <h3 className="text-zinc-300 font-semibold text-xs mb-2 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-cyan-400" /> Histórico de Propostas
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-cyan-400" />
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-8 text-zinc-600 text-xs">
                <Brain size={28} className="mx-auto mb-2 opacity-40" />
                Nenhuma proposta ainda. O K-AI gera a primeira em até 5 minutos.
              </div>
            ) : (
              <div className="space-y-2">
                {proposals
                  .filter((p) => p.status !== 'pending')
                  .map((p) => {
                    const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.pending;
                    const Icon = cfg.icon;
                    return (
                      <div key={p.id} className="bg-zinc-900/40 rounded-lg p-2.5 border border-zinc-800/60">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-zinc-200 text-xs font-medium truncate">{p.title}</p>
                            <p className="text-zinc-500 text-[10px] mt-0.5 line-clamp-2">{p.description}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[9px] flex items-center gap-1 ${cfg.color}`}>
                                <Icon size={10} className={p.status === 'executing' ? 'animate-spin' : ''} />
                                {cfg.label}
                              </span>
                              <span className="text-zinc-600 text-[9px]">{timeAgo(p.created_at)}</span>
                              <span className="text-zinc-700 text-[9px]">via {p.provider}</span>
                            </div>
                            {p.target_file && (
                              <p className="text-zinc-600 text-[9px] mt-1 flex items-center gap-1">
                                <FileCode size={9} /> {p.target_file}
                              </p>
                            )}
                            {p.execution_result?.error && (
                              <p className="text-red-400/70 text-[9px] mt-1">{p.execution_result.error}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProposalCard({
  proposal, onExecute, onReject, executing,
}: {
  proposal: KaiProposal;
  onExecute: (id: string) => void;
  onReject: (id: string) => void;
  executing: boolean;
}) {
  return (
    <div>
      <p className="text-white text-sm font-semibold">{proposal.title}</p>
      <p className="text-zinc-300 text-xs mt-1">{proposal.description}</p>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span className="bg-cyan-500/15 text-cyan-300 text-[9px] font-semibold px-2 py-0.5 rounded-full">
          {ACTION_LABELS[proposal.action_type] ?? proposal.action_type}
        </span>
        {proposal.target_file && (
          <span className="text-zinc-500 text-[9px] flex items-center gap-1">
            <FileCode size={9} /> {proposal.target_file}
          </span>
        )}
        <span className="text-zinc-600 text-[9px]">via {proposal.provider}</span>
      </div>
      {proposal.proposed_changes?.reasoning && (
        <p className="text-zinc-400 text-[10px] mt-2 italic">{proposal.proposed_changes.reasoning}</p>
      )}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onExecute(proposal.id)}
          disabled={executing}
          className="flex-1 bg-green-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-green-400 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {executing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          SIM, faz
        </button>
        <button
          onClick={() => onReject(proposal.id)}
          disabled={executing}
          className="flex-1 bg-zinc-800 text-zinc-300 text-xs font-bold py-2 rounded-lg hover:bg-zinc-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <XCircle size={14} />
          NÃO, deixa
        </button>
      </div>
    </div>
  );
}
