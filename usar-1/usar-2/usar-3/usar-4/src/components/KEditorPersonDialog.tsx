import { useState } from 'react';
import { X } from 'lucide-react';
import type { RecognizedPerson } from '@/lib/kEditorPeople';

interface Props {
  snapshot: string;
  onSave: (name: string, role: RecognizedPerson['role']) => boolean;
  onCancel: () => void;
}

export default function KEditorPersonDialog({ snapshot, onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<RecognizedPerson['role']>('aluno');
  const [error, setError] = useState('');

  const submit = () => {
    if (!name.trim()) { setError('Digite o nome da pessoa.'); return; }
    if (!onSave(name.trim(), role)) { setError('Não foi possível salvar agora. Libere espaço no navegador e tente de novo.'); return; }
  };

  return (
    <div className="fixed inset-0 z-[86] flex items-center justify-center bg-black/70 px-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-[#17181b] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-bold text-white">Reconhecer pessoa</p>
          <button onClick={onCancel} aria-label="Fechar" className="text-zinc-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center"><X size={20} /></button>
        </div>
        <div className="mb-4 flex justify-center">
          <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-cyan-400 bg-black">
            {snapshot && <img src={snapshot} alt="" className="h-full w-full object-cover" />}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-zinc-400">Nome</label>
            <input value={name} onChange={(e) => { setName(e.target.value); setError(''); }} placeholder="Ex: Hellem" className="w-full rounded-lg border border-zinc-700 bg-[#1b1c1f] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-zinc-400">Função</label>
            <div className="grid grid-cols-2 gap-2">
              {(['aluno', 'treinador'] as const).map((r) => (
                <button key={r} onClick={() => setRole(r)} className={`rounded-lg border py-2.5 text-sm font-semibold capitalize ${role === r ? 'border-cyan-400 bg-cyan-400/15 text-white' : 'border-zinc-700 text-zinc-400'}`}>{r === 'aluno' ? 'Aluno' : 'Treinador'}</button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-300">{error}</p>}
          <button onClick={submit} className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-bold text-white min-h-[48px]">Salvar</button>
        </div>
      </div>
    </div>
  );
}
