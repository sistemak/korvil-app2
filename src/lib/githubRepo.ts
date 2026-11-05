// Acesso direto à API pública do GitHub — o repo sistemak/korvil-app é público,
// então nenhuma leitura precisa de token. A API do GitHub aceita CORS no navegador.

const API = 'https://api.github.com/repos/sistemak/korvil-app';
const REPO_FULL = 'sistemak/korvil-app';
const HEADERS: HeadersInit = { Accept: 'application/vnd.github+json' };

export interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
}

export interface RepoInfo {
  name: string;
  full_name: string;
  description?: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
}

function decodeBase64Utf8(b64: string): string {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function fetchRepoTree(): Promise<RepoFile[]> {
  const res = await fetch(`${API}/git/trees/main?recursive=1`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data?.tree)) throw new Error('Resposta inesperada do GitHub');
  // A API de árvore usa 'tree'/'blob' em vez de 'dir'/'file'.
  return (data.tree as Array<{ path: string; type: string; size?: number }>).map((f) => ({
    name: f.path.split('/').pop() ?? f.path,
    path: f.path,
    type: f.type === 'tree' ? ('dir' as const) : ('file' as const),
    size: f.size,
  }));
}

export async function fetchRepoInfo(): Promise<RepoInfo | null> {
  try {
    const res = await fetch(API, { headers: HEADERS });
    if (!res.ok) return null;
    return (await res.json()) as RepoInfo;
  } catch {
    return null;
  }
}

export async function fetchFileContent(downloadUrl: string): Promise<string> {
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`Não foi possível abrir o arquivo (${res.status})`);
  return res.text();
}

export async function fetchFileByPath(path: string): Promise<string> {
  return fetchFileContent(`https://raw.githubusercontent.com/${REPO_FULL}/main/${path.split('/').map(encodeURIComponent).join('/')}`);
}

export async function fetchReadme(): Promise<string | null> {
  try {
    const res = await fetch(`${API}/readme`, { headers: HEADERS });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data?.content !== 'string' || !data?.encoding) return null;
    return data.encoding === 'base64' ? decodeBase64Utf8(data.content) : data.content;
  } catch {
    return null;
  }
}
