import { useState } from 'react';
import { X, Pencil, Trash2, Plus } from 'lucide-react';
import type { RecognizedPerson } from '@/lib/kEditorPeople';

interface Props {
  people: RecognizedPerson[];
  onChange: (people: RecognizedPerson[]) => boolean;
  onApply: (person: RecognizedPerson) => void;
  onClose: () => void;
}

export default function KEditorPeopleSettings({ people, onChange, onApply, onClose }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftRole, setDraftRole] = useState<RecognizedPerson['role']>('aluno');
  const [error, setError] = useState('');

  const startEdit = (person: RecognizedPerson) => {
    setEditingId(person.id);
    setDraftName(person.name);
    setDraftRole(person.role);
    setError('');
  };

  const saveEdit = () => {
    if (!draftName.trim()) { setError('O nome não pode ficar vazio.'); return; }
    const updated = people.map((p) => (p.id === editingId ? { ...p, name: draftName.trim(), role: draftRole } : p));
    if (!onChange(updated)) { setError('Não foi possível salvar agora.'); return; }
    setEditingId(null);
  };

  const remove = (id: string) => {
    if (!onChange(people.filter((p) => p.id !== id))) setError('Não foi possível excluir agora.');
  };

  return (
    <div className="fixed inset-0 z-[86] flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#17181b] p-5 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-white">Configurações</p>
            <p className="text-xs text-zinc-400">Pessoas Reconhecidas</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-zinc-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center"><X size={20} /></button>
        </div>

        {people.length === 0 && (
          <p className="py-8 text-center text-sm text-zinc-500">Nenhuma pessoa reconhecida ainda. Ative o Reconhecimento de Pessoas no K-AI Autocut e toque em uma pessoa no vídeo.</p>
        )}

        <div className="space-y-2">
          {people.map((person) => (
            <div key={person.id} className="rounded-xl border border-zinc-700 bg-[#1b1c1f] p-3">
              {editingId === person.id ? (
                <div className="space-y-2">
                  <input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-[#111214] px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" />
                  <div className="grid grid-cols-2 gap-2">
                    {(['aluno', 'treinador'] as const).map((r) => (
                      <button key={r} onClick={() => setDraftRole(r)} className={`rounded-lg border py-2 text-xs font-semibold ${draftRole === r ? 'border-cyan-400 text-white' : 'border-zinc-700 text-zinc-400'}`}>{r === 'aluno' ? 'Aluno' : 'Treinador'}</button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex-1 rounded-lg bg-cyan-500 py-2 text-xs font-bold text-white">Salvar</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 rounded-lg bg-zinc-800 py-2 text-xs font-bold text-zinc-200">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-zinc-600 bg-black">
                    {person.snapshot && <img src={person.snapshot} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-100">{person.name}</p>
                    <p className="text-[11px] capitalize text-zinc-500">{person.role === 'aluno' ? 'Aluno' : 'Treinador'}</p>
                  </div>
                  <button onClick={() => onApply(person)} className="flex items-center gap-1 rounded-lg bg-cyan-500 px-2.5 py-2 text-[11px] font-bold text-white min-h-[36px]"><Plus size={13} /> Usar</button>
                  <button onClick={() => startEdit(person)} aria-label="Editar" className="text-zinc-400 hover:text-white min-w-[36px] min-h-[36px] flex items-center justify-center"><Pencil size={15} /></button>
                  <button onClick={() => remove(person.id)} aria-label="Excluir" className="text-zinc-500 hover:text-red-400 min-w-[36px] min-h-[36px] flex items-center justify-center"><Trash2 size={15} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
        {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
      </div>
    </div>
  );
}
