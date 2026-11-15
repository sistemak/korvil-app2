import { useState } from 'react';
import { X, ChevronRight, ArrowLeft, Film, Megaphone, Dumbbell, Loader2, Undo2 } from 'lucide-react';
import type { AutocutReport } from '@/lib/kEditorAutocut';

type Sector = 'sistema-k' | 'ktp' | 'k-afortunado' | 'k-alma';
type Step = 'sectors' | 'ktp-models' | 'ktp-projects' | 'ktp-actions';

const SECTORS: { id: Sector; label: string; enabled: boolean }[] = [
  { id: 'sistema-k', label: 'SISTEMA K', enabled: false },
  { id: 'ktp', label: 'K-TP', enabled: true },
  { id: 'k-afortunado', label: 'K-AFORTUNADO', enabled: false },
  { id: 'k-alma', label: 'K-ALMA', enabled: false },
];

interface Props {
  hasVideo: boolean;
  busy: boolean;
  progress: number;
  error: string;
  canUndo: boolean;
  onUndo: () => void;
  recognitionOn: boolean;
  onToggleRecognition: () => void;
  onRunTreinos: () => Promise<AutocutReport | null>;
  onRunDivulgacao: () => void;
  onClose: () => void;
}

export default function KEditorAutocutPanel({ hasVideo, busy, progress, error, canUndo, onUndo, recognitionOn, onToggleRecognition, onRunTreinos, onRunDivulgacao, onClose }: Props) {
  const [step, setStep] = useState<Step>('sectors');
  const [notice, setNotice] = useState('');

  const back = () => {
    if (step === 'ktp-actions') setStep('ktp-projects');
    else if (step === 'ktp-projects') setStep('ktp-models');
    else if (step === 'ktp-models') setStep('sectors');
  };

  const onTreinos = async () => {
    setNotice('');
    if (!hasVideo) { setNotice('Importe um vídeo na timeline antes de usar o Autocut Treinos.'); return; }
    const report = await onRunTreinos();
    if (report) setNotice(`Autocut aplicado. ${report.cutSeconds.toFixed(1)}s removidos de ${report.totalSeconds.toFixed(1)}s.`);
  };

  return (
    <div className="fixed inset-0 z-[84] flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative w-full rounded-t-3xl border-t border-zinc-700 bg-[#17181b] max-h-[75vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-800 bg-[#17181b] px-4 py-3 z-10">
          <div className="flex items-center gap-2">
            {step !== 'sectors' && (
              <button onClick={back} aria-label="Voltar" className="text-zinc-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center"><ArrowLeft size={18} /></button>
            )}
            <h3 className="text-base font-bold text-white">K-AI Autocut</h3>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-zinc-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-3">
          <button onClick={onToggleRecognition} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold min-h-[48px] ${recognitionOn ? 'border-cyan-400 bg-cyan-400/10 text-white' : 'border-zinc-700 bg-[#1b1c1f] text-zinc-300'}`}>
            <span>Reconhecimento de Pessoas</span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${recognitionOn ? 'bg-cyan-400 text-black' : 'bg-zinc-700 text-zinc-300'}`}>{recognitionOn ? 'Ligado' : 'Desligado'}</span>
          </button>
          {recognitionOn && <p className="text-[11px] text-zinc-400">Feche este painel e toque em uma pessoa no vídeo para cadastrar.</p>}

          {step === 'sectors' && SECTORS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => sector.enabled ? setStep('ktp-models') : setNotice(`${sector.label}: Em breve.`)}
              className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-[#1b1c1f] px-4 py-3.5 text-left text-sm font-semibold text-zinc-100 hover:border-cyan-400 min-h-[48px]"
            >
              <span>{sector.label}</span>
              {sector.enabled ? <ChevronRight size={16} className="text-zinc-500" /> : <span className="text-[11px] font-semibold text-zinc-500">Em breve</span>}
            </button>
          ))}

          {step === 'ktp-models' && (
            <button onClick={() => setStep('ktp-projects')} className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-[#1b1c1f] px-4 py-3.5 text-left text-sm font-semibold text-zinc-100 hover:border-cyan-400 min-h-[48px]">
              <span className="flex items-center gap-2"><Film size={16} className="text-cyan-400" /> Modelos Autocut</span>
              <ChevronRight size={16} className="text-zinc-500" />
            </button>
          )}

          {step === 'ktp-projects' && (
            <button onClick={() => setStep('ktp-actions')} className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-[#1b1c1f] px-4 py-3.5 text-left text-sm font-semibold text-zinc-100 hover:border-cyan-400 min-h-[48px]">
              <span>Projeto TRANSFORMAÇÃO</span>
              <ChevronRight size={16} className="text-zinc-500" />
            </button>
          )}

          {step === 'ktp-actions' && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={onTreinos} disabled={busy} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-[#1b1c1f] py-5 text-sm font-semibold text-zinc-100 hover:border-cyan-400 disabled:opacity-50 min-h-[48px]">
                {busy ? <Loader2 size={20} className="animate-spin text-cyan-400" /> : <Dumbbell size={20} className="text-cyan-400" />}
                Treinos
              </button>
              <button onClick={onRunDivulgacao} disabled={busy} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-[#1b1c1f] py-5 text-sm font-semibold text-zinc-100 hover:border-cyan-400 disabled:opacity-50 min-h-[48px]">
                <Megaphone size={20} className="text-zinc-400" />
                Divulgação
              </button>
              {canUndo && (
                <button onClick={onUndo} disabled={busy} className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-zinc-800 border border-zinc-700 py-3 text-sm font-semibold text-zinc-200 hover:border-red-400 disabled:opacity-50 min-h-[48px]">
                  <Undo2 size={16} /> Desfazer Autocut
                </button>
              )}
            </div>
          )}

          {busy && (
            <div className="space-y-1">
              <p className="text-xs text-zinc-300">Analisando vídeo... {Math.round(progress * 100)}%</p>
              <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden"><div className="h-full bg-cyan-400 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} /></div>
            </div>
          )}
          {error && <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
          {notice && <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">{notice}</p>}
        </div>
      </div>
    </div>
  );
}
