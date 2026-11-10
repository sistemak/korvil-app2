/* Menu lateral do K-AI: Tarefas, Configurações e atalhos externos. */
import { useState, useEffect } from 'react';
import { X, Sparkles, Zap, 【entity-Github¦canonical_name=GitHub】, ListTodo, FlaskConical, CalendarClock, Settings, ChevronDown, Clapperboard, Brain, Folder, File, ArrowLeft, Save, ExternalLink } from 'lucide-react';

export type KaiTarget = 'tasks' | 'laboratorio' | 'programacoes' | 'settings' | 'bolt' | '【entity-github¦canonical_name=GitHub】' | 'keditor' | 'evolucao';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (target: KaiTarget) => void;
}

// ===== CONEXÃO SUPABASE - SEM TOKEN NA TELA =====
// O REPO_TOKEN fica como segredo no Supabase (supabase secrets set REPO_TOKEN=...)
// O painel NUNCA pede token, só chama a Edge Function korvil-master
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

async function callKorvil(action: string, body: any) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/korvil-master`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ action, ...body }),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text, error: text }; }
}

const REPOS = [
  { full: 'sistemak/korvil-app2', site: 'https://korvil-app-operating-j27q.bolt.host' },
  { full: 'sistemak/korvil-app', site: 'https://sistemak.github.io/korvil-app/' },
  { full: 'sistemak/korvil-appp', site: 'https://sistemak.github.io/korvil-appp/' },
  { full: 'sistemak/korvil-app567', site: 'https://sistemak.github.io/korvil-app567/' },
  { full: 'sistemak/korvil-central-home-439077f0', site: 'https://sistemak.github.io/korvil-central-home-439077f0/' },
  { full: 'sistemak/korvil-app1', site: 'https://sistemak.github.io/korvil-app1/' },
  { full: 'sistemak/korvil-app2-main', site: 'https://sistemak.github.io/korvil-app2-main/' },
  { full: 'sistemak/korvil-central-home', site: 'https://sistemak.github.io/korvil-central-home/' },
  { full: 'korvilp/korvilp-sudo', site: 'https://korvilp.github.io/korvilp-sudo/' },
];

// ===== CLONE GITHUB + VS CODE =====
function GithubClone({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'github' | 'vscode'>('github');
  const [repo, setRepo] = useState(REPOS[0].full);
  const [path, setPath] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFile, setOpenFile] = useState<{ path: string; content: string; sha?: string } | null>(null);
  const [editing, setEditing] = useState('');
  const [commitMsg, setCommitMsg] = useState('Update via KORVIL');
  const [commitStatus, setCommitStatus] = useState('');
  const [readme, setReadme] = useState('');

  const site = REPOS.find((r) => r.full === repo)?.site || '';

  async function loadRepo(newRepo: string, newPath: string) {
    setLoading(true);
    setError('');
    setOpenFile(null);
    const data = await callKorvil('list', { repo: newRepo, path: newPath });
    if (Array.isArray(data)) {
      setFiles(data);
      // README na raiz
      if (newPath === '') {
        const rm = data.find((f: any) => f.name?.toLowerCase() === 'readme.md');
        if (rm?.download_url) {
          try {
            const r = await fetch(rm.download_url);
            setReadme(await r.text());
          } catch { setReadme(''); }
        } else setReadme('');
      }
    } else {
      setFiles([]);
      setError(typeof data === 'object' ? (data.message || data.error || 'Erro ao carregar. Confira se a função korvil-master está publicada e o segredo REPO_TOKEN setado.') : String(data));
    }
    setLoading(false);
  }

  useEffect(() => { loadRepo(repo, ''); }, []);
  useEffect(() => { loadRepo(repo, path); }, [repo, path]);

  async function openItem(item: any) {
    if (item.type === 'dir') {
      setPath(item.path);
      return;
    }
    setCommitStatus('');
    if (item.download_url) {
      const r = await fetch(item.download_url);
      const txt = await r.text();
      setOpenFile({ path: item.path, content: txt, sha: item.sha });
      setEditing(txt);
    } else {
      const d = await callKorvil('list', { repo, path: item.path });
      const content = d?.content ? atob(d.content.replace(/\n/g, '')) : '';
      setOpenFile({ path: item.path, content, sha: d?.sha });
      setEditing(content);
    }
  }

  async function doCommit() {
    if (!openFile) return;
    setCommitStatus('Commitando...');
    const res = await callKorvil('commit', { repo, path: openFile.path, content: editing, message: commitMsg });
    if (res?.commit?.sha || res?.content?.sha) {
      setCommitStatus(`✅ Commit feito! ${String(res?.commit?.sha || res?.content?.sha).slice(0, 7)}`);
      loadRepo(repo, path);
    } else {
      setCommitStatus(`❌ Erro: ${res?.message || res?.error || JSON.stringify(res).slice(0, 200)}`);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0d1117] text-[#e6edf3] flex flex-col">
      {/* TOPO - SEM TOKEN */}
      <div className="h-14 px-3 flex items-center gap-2 border-b border-zinc-800 bg-black flex-wrap">
        <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded"><X size={18} /></button>
        <div className="flex bg-zinc-900 rounded-lg p-1">
          <button onClick={() => setMode('github')} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${mode === 'github' ? 'bg-white text-black' : 'text-zinc-300'}`}>GitHub</button>
          <button onClick={() => setMode('vscode')} className={`px-3 py-1.5 rounded-md text-sm font-semibold ${mode === 'vscode' ? 'bg-white text-black' : 'text-zinc-300'}`}>VS Code</button>
        </div>
        <select value={repo} onChange={(e) => { setRepo(e.target.value); setPath(''); }} className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-sm max-w-[200px]">
          {REPOS.map((r) => <option key={r.full} value={r.full}>{r.full}</option>)}
        </select>
        <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer" className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm flex items-center gap-1">Abrir no GitHub <ExternalLink size={12} /></a>
        <a href={site} target="_blank" rel="noreferrer" className="px-3 py-2 bg-cyan-600 rounded-lg text-sm">Abrir Site</a>
        <span className="text-[11px] text-emerald-400 ml-auto hidden md:block">● Conectado via Supabase • Sem token na tela</span>
      </div>

      {error && <div className="p-3 bg-red-500/10 text-red-400 text-sm">{error}</div>}
      {commitStatus && <div className="p-2 px-3 text-sm bg-zinc-900 border-b border-zinc-800">{commitStatus}</div>}

      {/* MODO GITHUB */}
      {mode === 'github' && (
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-blue-400 font-semibold">{repo.split('/')[0]} / <b>{repo.split('/')[1]}</b></span>
            <span className="text-xs border border-zinc-700 rounded-full px-2 py-0.5">Public</span>
            <span className="text-xs border border-zinc-700 rounded-full px-2 py-0.5">main</span>
            {path && <button onClick={() => setPath(path.split('/').slice(0, -1).join('/'))} className="flex items-center gap-1 text-sm text-cyan-300"><ArrowLeft size={14} /> Voltar</button>}
            <span className="text-xs text-zinc-500">{path || '/'}</span>
          </div>
          {loading ? <p className="text-zinc-400">Carregando...</p> : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              {files.map((f: any) => (
                <button key={f.path} onClick={() => openItem(f)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-900 text-left border-b border-zinc-800/50 last:border-0">
                  {f.type === 'dir' ? <Folder size={16} className="text-cyan-400" /> : <File size={16} className="text-zinc-400" />}
                  <span className="text-sm">{f.name}</span>
                  <span className="ml-auto text-xs text-zinc-500">{f.type === 'file' ? `${Math.round((f.size || 0) / 1024)} KB` : ''}</span>
                </button>
              ))}
              {files.length === 0 && !loading && <p className="p-4 text-zinc-500 text-sm">Nenhum arquivo. Verifique a função no Supabase.</p>}
            </div>
          )}
          {readme && (
            <div className="mt-4 border border-zinc-800 rounded-xl p-4">
              <h3 className="font-bold mb-2">README.md</h3>
              <pre className="whitespace-pre-wrap text-sm text-zinc-300">{readme.slice(0, 4000)}</pre>
            </div>
          )}
          <div className="mt-4 text-sm text-zinc-400">
            <b className="text-white">About</b>
            <div><a href={site} target="_blank" rel="noreferrer" className="text-cyan-300">{site}</a></div>
            <div className="text-xs mt-1">Site oficial do Bolt para korvil-app2 • 【entity-GitHub Pages¦canonical_name=GitHub】 como espelho</div>
          </div>
        </div>
      )}

      {/* MODO VS CODE */}
      {mode === 'vscode' && (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r border-zinc-800 overflow-auto p-2">
            <p className="text-xs font-bold text-zinc-400 px-2 py-1">EXPLORER — {repo.split('/')[1]}</p>
            {path && <button onClick={() => setPath(path.split('/').slice(0, -1).join('/'))} className="flex items-center gap-1 text-xs text-cyan-300 px-2 py-1"><ArrowLeft size={12} /> Voltar</button>}
            {files.map((f: any) => (
              <button key={f.path} onClick={() => openItem(f)} className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800 rounded text-left text-sm">
                {f.type === 'dir' ? <Folder size={14} className="text-yellow-400" /> : <File size={14} className="text-zinc-400" />} {f.name}
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            {openFile ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 text-sm">
                  <File size={14} /> {openFile.path}
                  <input value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)} className="ml-auto bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs w-48" placeholder="Mensagem do commit" />
                  <button onClick={doCommit} className="flex items-center gap-1 bg-emerald-600 px-3 py-1.5 rounded-lg text-sm font-semibold"><Save size={14} /> Commit</button>
                </div>
                <textarea value={editing} onChange={(e) => setEditing(e.target.value)} className="flex-1 bg-[#0d1117] p-3 font-mono text-[13px] outline-none resize-none" spellCheck={false} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">Clique em um arquivo para abrir e editar. Depois clique em Commit.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function KAIRightMenu({ open, onClose, onSelect }: Props) {
  const [kaiExpanded, setKaiExpanded] = useState(false);
  const [programsExpanded, setProgramsExpanded] = useState(false);
  const [showGithub, setShowGithub] = useState(false);

  const submenu = [
    { label: 'Tarefas', icon: ListTodo, target: 'tasks' as const },
    { label: 'Laboratório', icon: FlaskConical, target: 'laboratorio' as const },
    { label: 'Programações', icon: CalendarClock, target: 'programacoes' as const },
    { label: 'Evolução K-AI', icon: Brain, target: 'evolucao' as const },
  ];

  return (
    <>
      {showGithub && <GithubClone onClose={() => setShowGithub(false)} />}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-[94] transition-opacity duration-300" onClick={onClose} />
      )}
      <aside className={`fixed top-0 right-0 bottom-0 w-64 bg-[#0a0a0a] border-l border-zinc-800 z-[95] shadow-2xl transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-800">
          <span className="text-cyan-300 font-bold text-sm flex items-center gap-2"><Sparkles size={14} /> Menu </span>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition"><X size={18} /></button>
        </div>
        <nav className="p-3 space-y-2">
          <div>
            <button onClick={() => setKaiExpanded((e) => !e)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold">
              <Sparkles size={16} className="text-cyan-400" /> K-AI <ChevronDown size={16} className={`ml-auto text-zinc-500 transition-transform duration-200 ${kaiExpanded ? 'rotate-180' : ''}`} />
            </button>
            {kaiExpanded && (
              <div className="mt-1.5 ml-3 pl-3 border-l border-zinc-800 space-y-1.5 animate-[whisperIn_0.2s_ease-out]">
                {submenu.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.target} onClick={() => onSelect(item.target)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/50 transition text-[13px] font-medium"><Icon size={14} /> {item.label}</button>
                  );
                })}
                <div>
                  <button onClick={() => setProgramsExpanded((e) => !e)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/50 transition text-[13px] font-medium"><Clapperboard size={14} /> PROGRAMAS <ChevronDown size={14} className={`ml-auto text-zinc-500 transition-transform duration-200 ${programsExpanded ? 'rotate-180' : ''}`} /></button>
                  {programsExpanded && (
                    <div className="mt-1 ml-3 pl-3 border-l border-zinc-800/60 space-y-1">
                      <button onClick={() => onSelect('keditor')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-cyan-300 hover:bg-zinc-800/50 transition text-[12px] font-medium"><Clapperboard size={12} /> K-EDITOR</button>
                    </div>
                  )}
                </div>
                <button onClick={() => onSelect('settings')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/50 transition text-[13px] font-medium"><Settings size={14} /> Configurações</button>
              </div>
            )}
          </div>
          <button onClick={() => onSelect('bolt')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold"><Zap size={16} /> Bolt</button>
          {/* GITHUB AGORA ABRE O CLONE DENTRO DO APP, SEM SAIR E SEM TOKEN */}
          <button onClick={() => setShowGithub(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-200 hover:bg-zinc-800/60 transition text-sm font-semibold"><Github size={16} /> GitHub</button>
        </nav>
        <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-zinc-600">Acesso exclusivo: <span className="text-cyan-400">sistemak</span></div>
      </aside>
    </>
  );
}
