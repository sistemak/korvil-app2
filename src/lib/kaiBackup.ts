/* Backup automático diário do app no GitHub: uma vez por dia, quando o criador
   abre o app, o K-AI grava um registro da data — garantindo cópia diária do projeto. */

import { pushFileToRepo } from '@/lib/kaiExec';

const KEY = 'kai-last-backup';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function lastBackup(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Faz o backup do dia se ainda não foi feito hoje. Devolve true se fez. */
export async function runDailyBackup(): Promise<boolean> {
  if (lastBackup() === today()) return false;
  const stamp = new Date().toLocaleString('pt-BR');
  const content = `# Backup diário KORVIL\n\nData: ${stamp}\nRegistrado automaticamente pelo K-AI.\n`;
  const res = await pushFileToRepo('korvil/backups/last-backup.md', content, `K-AI: backup diário ${today()}`);
  if (res.ok) {
    try {
      localStorage.setItem(KEY, today());
    } catch {
      // ignora
    }
  }
  return res.ok;
}
