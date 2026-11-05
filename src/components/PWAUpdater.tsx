import { useEffect, useState, useCallback } from 'react';

const REPO = 'sistemak/korvil-app';
const CHECK_INTERVAL = 10_000;

export default function PWAUpdater() {
  const [newVersion, setNewVersion] = useState(false);
  const [lastSha, setLastSha] = useState<string | null>(null);

  const checkForUpdate = useCallback(async () => {
    try {
      const res = await fetch(`https://api.github.com/repos/${REPO}/commits/main`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      const sha: string | undefined = data?.sha;
      if (!sha) return;

      if (lastSha === null) {
        setLastSha(sha);
        return;
      }
      if (sha !== lastSha) {
        setLastSha(sha);
        setNewVersion(true);
      }
    } catch {
      // offline: ignora, tenta de novo no próximo ciclo
    }
  }, [lastSha]);

  useEffect(() => {
    checkForUpdate();
    const id = setInterval(checkForUpdate, CHECK_INTERVAL);
    return () => clearInterval(id);
  }, [checkForUpdate]);

  useEffect(() => {
    if (!newVersion) return;
    const t = setTimeout(() => {
      navigator.serviceWorker?.getRegistration()?.then((reg) => {
        reg?.waiting?.postMessage('SKIP_WAITING');
        setTimeout(() => window.location.reload(), 500);
      }).catch(() => window.location.reload());
    }, 1500);
    return () => clearTimeout(t);
  }, [newVersion]);

  // Atualização silenciosa: recarrega sozinho, sem aviso na tela.
  if (!newVersion) return null;
  return null;
}
