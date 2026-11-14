import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Menu, X, LayoutDashboard, Brain, Database, Grid3x3,
  Upload, Search, Download, Eye, Trash2, FolderInput, FileImage, FileVideo,
  FileAudio, FileText, Music, Loader2, CheckCircle2, AlertCircle, Archive,
} from 'lucide-react';
import JSZip from 'jszip';
import { supabase } from '@/lib/korvilAuth';
import { SECTIONS } from '@/lib/korvilData';

/* ──────────────────────────────────────────────────────────────
   S.O.K — SISTEMA OPERACIONAL KORVIL
   K-B.D: gerenciador de arquivos (Telegram KBD group + Supabase via edge function)
   O bot token fica no servidor (edge function sok-files).
   ────────────────────────────────────────────────────────────── */

const SETORES_SOK = [
  { id: 'KORVIL', label: 'KORVIL', email: 'korvil.p@gmail.com', logo: '/icons/icon-192.png' },
  { id: 'SISTEMA_K', label: 'SISTEMA K', email: 'sistemak.srv@gmail.com', logo: '/sistema-k.png' },
  { id: 'K_TP', label: 'K-TP', email: 'korvil.tp@gmail.com', logo: '/k-tp.png' },
  { id: 'K_AFORTUNADO', label: 'K-AFORTUNADO', email: 'kafortunado@gmail.com', logo: '/k-afortunado.png' },
  { id: 'K_ALMA', label: 'K-ALMA', email: 'kalmacdc@gmail.com', logo: '/k-alma.png' },
];

type MenuTab = 'painel' | 'k-ai' | 'k-bd' | 'k-or';

type Pasta = 'IMAGENS' | 'VIDEOS' | 'MUSICAS' | 'AUDIOS' | 'DOCUMENTOS';
const PASTAS: Pasta[] = ['IMAGENS', 'VIDEOS', 'MUSICAS', 'AUDIOS', 'DOCUMENTOS'];

interface Arquivo {
  id: string;
  nome: string;
  tipo: string;
  file_id_telegram: string;
  tamanho: number;
  setor: string;
  pasta?: string | null;
  message_id?: number | null;
  data_criacao: string;
}

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sok-files`;

/* ── helpers ── */

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function pastaOf(a: Arquivo): Pasta {
  if (a.pasta && PASTAS.includes(a.pasta as Pasta)) return a.pasta as Pasta;
  const t = (a.tipo || '').toLowerCase();
  const n = (a.nome || '').toLowerCase();
  const ext = n.split('.').pop() ?? '';
  if (/jpg|jpeg|png|webp|gif/.test(ext) || t.startsWith('image/')) return 'IMAGENS';
  if (/mp4|mov|avi|mkv/.test(ext) || t.startsWith('video/')) return 'VIDEOS';
  if (/mp3|wav|ogg|opus|m4a/.test(ext) || t.startsWith('audio/')) {
    return /ogg|opus|voice/.test(n) ? 'AUDIOS' : 'MUSICAS';
  }
  return 'DOCUMENTOS';
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    Authorization: `Bearer ${token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  };
}

async function downloadFile(url: string, filename: string) {
  const resp = await fetch(url);
  const blob = await resp.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

const PASTA_META: Record<Pasta, { icon: typeof FileImage; color: string; label: string }> = {
  IMAGENS: { icon: FileImage, color: '#06b6d4', label: 'Imagens' },
  VIDEOS: { icon: FileVideo, color: '#a855f7', label: 'Vídeos' },
  MUSICAS: { icon: Music, color: '#10b981', label: 'Músicas' },
  AUDIOS: { icon: FileAudio, color: '#f59e0b', label: 'Áudios' },
  DOCUMENTOS: { icon: FileText, color: '#3b82f6', label: 'Documentos' },
};

/* ── logo bar ── */

function LogoBar({ setorAtivo, onSelect }: { setorAtivo: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 py-4 px-4 bg-black/60 border-b border-cyan-500/20 overflow-x-auto shrink-0">
      {SETORES_SOK.map((s) => {
        const active = setorAtivo === s.id;
        return (
          <button key={s.id} onClick={() => onSelect(s.id)} className="flex flex-col items-center gap-1.5 shrink-0 transition-all">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center bg-black transition-all ${
                active ? 'ring-2 ring-cyan-400 scale-105' : 'ring-1 ring-zinc-700 opacity-50 hover:opacity-80'
              }`}
              style={active ? { boxShadow: '0 0 20px #00E5FF, 0 0 40px #00E5FF66' } : undefined}
            >
              <img src={s.logo} alt={s.label} className="w-full h-full object-contain" onError={(e) => ((e.target as HTMLImageElement).src = '/logokai.png')} />
            </div>
            <span className={`text-[9px] sm:text-[10px] font-bold transition-colors ${active ? 'text-cyan-300' : 'text-zinc-500'}`}>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── side menu ── */

function SideMenu({ open, onClose, activeTab, onSelect }: { open: boolean; onClose: () => void; activeTab: MenuTab; onSelect: (tab: MenuTab) => void }) {
  const items: { id: MenuTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'painel', label: 'Painel', icon: LayoutDashboard },
    { id: 'k-ai', label: 'K-AI', icon: Brain },
    { id: 'k-bd', label: 'K-B.D', icon: Database },
    { id: 'k-or', label: 'K-O.R', icon: Grid3x3 },
  ];
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/70 z-[11000]" onClick={onClose} />}
      <div className={`fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0f] border-r border-cyan-500/20 z-[11001] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <span className="text-cyan-300 font-bold text-sm tracking-wider">S.O.K MENU</span>
          <button onClick={onClose} className="p-1.5 hover:text-cyan-400 transition"><X size={18} className="text-zinc-400" /></button>
        </div>
        <nav className="flex-1 py-2">
          {items.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-all ${
                  active ? 'bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-400' : 'text-zinc-400 hover:text-cyan-300 hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

/* ── Painel tab ── */

function PainelTab({ setorAtivo }: { setorAtivo: string }) {
  const [counts, setCounts] = useState<Record<Pasta, number>>({ IMAGENS: 0, VIDEOS: 0, MUSICAS: 0, AUDIOS: 0, DOCUMENTOS: 0 });
  const [total, setTotal] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.from('arquivos').select('tipo, nome, tamanho, pasta').eq('setor', setorAtivo);
      if (!alive || !data) return;
      const rows = data as { tipo: string; nome: string; tamanho: number; pasta?: string }[];
      const c: Record<Pasta, number> = { IMAGENS: 0, VIDEOS: 0, MUSICAS: 0, AUDIOS: 0, DOCUMENTOS: 0 };
      for (const r of rows) {
        const p = (r.pasta && PASTAS.includes(r.pasta as Pasta) ? r.pasta : pastaOf({ nome: r.nome, tipo: r.tipo } as Arquivo)) as Pasta;
        c[p]++;
      }
      setCounts(c);
      setTotal(rows.length);
      setTotalBytes(rows.reduce((acc, r) => acc + Number(r.tamanho || 0), 0));
    })();
    return () => { alive = false; };
  }, [setorAtivo]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-black text-xl mb-1">Painel Geral</h2>
        <p className="text-zinc-400 text-sm">Visão geral do setor <span className="text-cyan-300 font-semibold">{setorAtivo}</span></p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900/60 border border-cyan-500/20 rounded-2xl p-5 backdrop-blur">
          <p className="text-zinc-400 text-xs font-medium mb-2">Total de Arquivos</p>
          <p className="text-cyan-300 font-black text-3xl">{total}</p>
          <p className="text-zinc-500 text-[10px] mt-1">{formatBytes(totalBytes)} total</p>
        </div>
        {PASTAS.map((p) => {
          const meta = PASTA_META[p];
          return (
            <div key={p} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                <meta.icon size={16} style={{ color: meta.color }} />
                <span className="text-zinc-400 text-xs font-medium">{meta.label}</span>
              </div>
              <p className="text-white font-black text-2xl">{counts[p]}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-sm mb-3">Status do Sistema</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Telegram KBD Group</span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400"><CheckCircle2 size={14} /> Conectado (servidor)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Supabase</span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400"><CheckCircle2 size={14} /> Conectado</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Setor ativo</span>
            <span className="text-cyan-300 font-semibold">{setorAtivo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── K-AI tab (placeholder) ── */

function KAITab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-black text-xl mb-1">K-AI</h2>
        <p className="text-zinc-400 text-sm">Painel de inteligência artificial do S.O.K</p>
      </div>
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center">
        <Brain size={48} className="text-cyan-500/40 mx-auto mb-4" />
        <p className="text-zinc-500 text-sm">K-AI em breve</p>
      </div>
    </div>
  );
}

/* ── K-O.R tab (placeholder) ── */

function KORTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-black text-xl mb-1">K-O.R</h2>
        <p className="text-zinc-400 text-sm">Aplicativos do ecossistema Korvil</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SECTIONS.map((s) => (
          <div key={s.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-black flex items-center justify-center shrink-0">
              <img src={s.logo} alt={s.name} className="w-full h-full object-contain" onError={(e) => ((e.target as HTMLImageElement).src = '/logokai.png')} />
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-semibold text-sm">{s.name}</h4>
              <p className="text-zinc-400 text-xs truncate">{s.tagline}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── K-B.D tab — file manager ── */

type FilterCat = 'all' | Pasta;

function KBDTab({ setorAtivo }: { setorAtivo: string }) {
  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterCat>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState('');
  const [previewPasta, setPreviewPasta] = useState<Pasta>('DOCUMENTOS');
  const [dragOver, setDragOver] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchArquivos = useCallback(async () => {
    setLoading(true);
    const headers = await authHeaders();
    const resp = await fetch(`${EDGE_URL}?action=list&setor=${encodeURIComponent(setorAtivo)}`, { headers });
    const json = await resp.json();
    if (resp.ok && json.pastas) {
      const all: Arquivo[] = [];
      for (const p of PASTAS) {
        const arr = (json.pastas[p]?.arquivos ?? []) as Arquivo[];
        all.push(...arr);
      }
      setArquivos(all);
    } else {
      // fallback to direct supabase
      const { data } = await supabase.from('arquivos').select('*').eq('setor', setorAtivo).order('data_criacao', { ascending: false });
      setArquivos((data as unknown as Arquivo[]) ?? []);
    }
    setLoading(false);
  }, [setorAtivo]);

  useEffect(() => { fetchArquivos(); }, [fetchArquivos]);

  const filtered = arquivos.filter((a) => {
    if (filter !== 'all' && pastaOf(a) !== filter) return false;
    if (search && !a.nome.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts: Record<FilterCat, number> = {
    all: arquivos.length,
    IMAGENS: 0, VIDEOS: 0, MUSICAS: 0, AUDIOS: 0, DOCUMENTOS: 0,
  };
  for (const a of arquivos) counts[pastaOf(a)]++;

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    setUploadMsg(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('setor', setorAtivo);
        fd.append('document', file, file.name);
        const headers = await authHeaders();
        const resp = await fetch(`${EDGE_URL}?action=upload`, { method: 'POST', headers, body: fd });
        const json = await resp.json();
        if (!resp.ok || json.error) throw new Error(json.error || 'Erro no upload');
      }
      setUploadMsg({ type: 'ok', text: `${files.length} arquivo(s) enviado(s) com sucesso!` });
      await fetchArquivos();
    } catch (err) {
      setUploadMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erro no upload' });
    }
    setUploading(false);
    setTimeout(() => setUploadMsg(null), 4000);
  };

  const resolveFileUrl = async (fileId: string): Promise<string> => {
    const r = await fetch(`${EDGE_URL}?action=file-url&file_id=${encodeURIComponent(fileId)}`, { headers: await authHeaders() });
    const json = await r.json();
    if (!r.ok || json.error) throw new Error(json.error || 'Erro ao obter URL');
    return json.url as string;
  };

  const handleDownload = async (a: Arquivo) => {
    setActionLoading(a.id + '-dl');
    try {
      const url = await resolveFileUrl(a.file_id_telegram);
      await downloadFile(url, a.nome);
    } catch (err) {
      setUploadMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erro no download' });
    }
    setActionLoading(null);
  };

  const handlePreview = async (a: Arquivo) => {
    setActionLoading(a.id + '-view');
    try {
      const url = await resolveFileUrl(a.file_id_telegram);
      setPreviewUrl(url);
      setPreviewName(a.nome);
      setPreviewPasta(pastaOf(a));
    } catch (err) {
      setUploadMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erro ao visualizar' });
    }
    setActionLoading(null);
  };

  const handleDelete = async (a: Arquivo) => {
    if (!confirm(`Deletar "${a.nome}"?`)) return;
    setActionLoading(a.id + '-del');
    const { error } = await supabase.from('arquivos').delete().eq('id', a.id);
    if (error) setUploadMsg({ type: 'err', text: error.message });
    else await fetchArquivos();
    setActionLoading(null);
  };

  const handleMoveSetor = async (a: Arquivo, novoSetor: string) => {
    if (novoSetor === a.setor) return;
    setActionLoading(a.id + '-move');
    const { error } = await supabase.from('arquivos').update({ setor: novoSetor }).eq('id', a.id);
    if (error) setUploadMsg({ type: 'err', text: error.message });
    else await fetchArquivos();
    setActionLoading(null);
  };

  const handleDownloadZip = async () => {
    if (filtered.length === 0) return;
    setActionLoading('zip');
    try {
      const zip = new JSZip();
      for (const a of filtered) {
        const url = await resolveFileUrl(a.file_id_telegram);
        const resp = await fetch(url);
        const blob = await resp.blob();
        zip.file(a.nome, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `arquivos_${setorAtivo}_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      setUploadMsg({ type: 'err', text: err instanceof Error ? err.message : 'Erro ao criar ZIP' });
    }
    setActionLoading(null);
  };

  const catCards: { id: FilterCat; label: string; icon: typeof FileImage; count: number; color: string }[] = [
    { id: 'all', label: 'Todos', icon: Archive, count: counts.all, color: '#00E5FF' },
    ...PASTAS.map((p) => ({ id: p as FilterCat, label: PASTA_META[p].label, icon: PASTA_META[p].icon, count: counts[p], color: PASTA_META[p].color })),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white font-black text-xl mb-1">K-B.D — Banco de Dados</h2>
        <p className="text-zinc-400 text-sm">Gerenciador de arquivos do setor <span className="text-cyan-300 font-semibold">{setorAtivo}</span></p>
      </div>

      {/* category cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {catCards.map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`bg-zinc-900/60 border rounded-2xl p-4 text-left transition-all ${active ? 'border-cyan-400 shadow-[0_0_12px_#00E5FF44]' : 'border-zinc-800 hover:border-zinc-600'}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <c.icon size={16} style={{ color: c.color }} />
                <span className="text-zinc-300 text-xs font-semibold">{c.label}</span>
              </div>
              <p className="text-white font-black text-xl">{c.count}</p>
            </button>
          );
        })}
      </div>

      {/* search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar arquivos..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-cyan-500/50 focus:outline-none"
        />
      </div>

      {/* drag-and-drop upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length > 0) void handleUpload(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragOver ? 'border-cyan-400 bg-cyan-500/5 shadow-[0_0_20px_#00E5FF33]' : 'border-zinc-700 hover:border-cyan-500/50 hover:bg-zinc-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files && e.target.files.length > 0) void handleUpload(e.target.files); e.target.value = ''; }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="text-cyan-400 animate-spin" />
            <p className="text-cyan-300 text-sm font-semibold">Enviando para Telegram KBD...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-cyan-400/70" />
            <p className="text-white text-sm font-semibold">Solte arquivos do setor {setorAtivo} aqui ou clique para upload</p>
            <p className="text-zinc-500 text-xs">Upload via Telegram KBD · Setor: {setorAtivo}</p>
          </div>
        )}
      </div>

      {uploadMsg && (
        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${uploadMsg.type === 'ok' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'}`}>
          {uploadMsg.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {uploadMsg.text}
        </div>
      )}

      {/* file grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 size={28} className="text-cyan-400 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><Archive size={40} className="text-zinc-700 mx-auto mb-3" /><p className="text-zinc-500 text-sm">Nenhum arquivo encontrado</p></div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">{filtered.length} arquivo(s)</span>
            <button
              onClick={handleDownloadZip}
              disabled={actionLoading === 'zip'}
              className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold px-4 py-2 rounded-lg hover:bg-violet-500/20 transition disabled:opacity-40"
            >
              {actionLoading === 'zip' ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />}
              Baixar ZIP
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((a) => {
              const p = pastaOf(a);
              const meta = PASTA_META[p];
              return (
                <div key={a.id} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 hover:border-cyan-500/30 transition group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}22`, color: meta.color }}>
                      <meta.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate" title={a.nome}>{a.nome}</p>
                      <p className="text-zinc-500 text-[10px] mt-0.5">{meta.label} · {formatBytes(Number(a.tamanho))} · {formatDate(a.data_criacao)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => handlePreview(a)} disabled={actionLoading === a.id + '-view'} className="flex items-center gap-1 bg-zinc-800 hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-300 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition disabled:opacity-40">
                      {actionLoading === a.id + '-view' ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />} Visualizar
                    </button>
                    <button onClick={() => handleDownload(a)} disabled={actionLoading === a.id + '-dl'} className="flex items-center gap-1 bg-zinc-800 hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-300 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition disabled:opacity-40">
                      {actionLoading === a.id + '-dl' ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Baixar
                    </button>
                    <button onClick={() => handleDelete(a)} disabled={actionLoading === a.id + '-del'} className="flex items-center gap-1 bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-300 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition disabled:opacity-40">
                      {actionLoading === a.id + '-del' ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5">
                    <FolderInput size={12} className="text-zinc-500" />
                    <select value={a.setor} onChange={(e) => handleMoveSetor(a, e.target.value)} disabled={actionLoading === a.id + '-move'} className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500/50">
                      {SETORES_SOK.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* preview modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[12000] bg-black/90 backdrop-blur flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm font-semibold truncate">{previewName}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadFile(previewUrl, previewName)} className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-500/30 transition">
                  <Download size={14} /> Baixar
                </button>
                <button onClick={() => setPreviewUrl(null)} className="p-1.5 hover:text-red-400 transition"><X size={18} className="text-zinc-300" /></button>
              </div>
            </div>
            <div className="bg-black border border-cyan-500/20 rounded-2xl overflow-hidden flex items-center justify-center max-h-[80vh]">
              {previewPasta === 'IMAGENS' ? (
                <img src={previewUrl} alt={previewName} className="max-h-[80vh] object-contain" />
              ) : previewPasta === 'VIDEOS' ? (
                <video src={previewUrl} controls className="max-h-[80vh] w-full" />
              ) : previewPasta === 'MUSICAS' || previewPasta === 'AUDIOS' ? (
                <audio src={previewUrl} controls className="w-full p-8" />
              ) : (
                <div className="p-12 text-center">
                  <FileText size={48} className="text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm mb-4">Pré-visualização não disponível para este tipo</p>
                  <a href={previewUrl} download={previewName} className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 text-sm font-bold px-4 py-2 rounded-lg hover:bg-cyan-500/30 transition">
                    <Download size={16} /> Baixar arquivo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── main SOK component ── */

export default function SOKMain({ onClose }: { onClose: () => void }) {
  const [setorAtivo, setSetorAtivo] = useState<string>(() => {
    try { return localStorage.getItem('setorAtivo') || 'KORVIL'; } catch { return 'KORVIL'; }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MenuTab>('painel');

  const handleSetor = (id: string) => {
    setSetorAtivo(id);
    try { localStorage.setItem('setorAtivo', id); } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black text-white flex flex-col">
      <div className="flex items-center justify-between px-3 sm:px-4 h-14 border-b border-cyan-500/20 bg-black shrink-0">
        <button onClick={() => setMenuOpen(true)} className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-cyan-400 hover:bg-zinc-800/60 rounded-lg transition" aria-label="Menu S.O.K">
          <Menu size={22} />
        </button>
        <button onClick={onClose} className="flex items-center gap-1.5 text-zinc-400 hover:text-cyan-300 text-sm transition">
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>

      <div className="text-center py-5 px-4 bg-black shrink-0">
        <h1 className="text-white font-black text-2xl sm:text-3xl tracking-wider">S.O.K SISTEMA OPERACIONAL KORVIL</h1>
      </div>

      <LogoBar setorAtivo={setorAtivo} onSelect={handleSetor} />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} activeTab={activeTab} onSelect={setActiveTab} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full">
        {activeTab === 'painel' && <PainelTab setorAtivo={setorAtivo} />}
        {activeTab === 'k-ai' && <KAITab />}
        {activeTab === 'k-bd' && <KBDTab setorAtivo={setorAtivo} />}
        {activeTab === 'k-or' && <KORTab />}
      </div>
    </div>
  );
}
