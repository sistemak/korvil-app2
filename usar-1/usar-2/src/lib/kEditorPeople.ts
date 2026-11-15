export interface RecognizedPerson {
  id: string;
  name: string;
  role: 'aluno' | 'treinador';
  snapshot: string;
  createdAt: string;
}

const STORAGE_KEY = 'k-editor-people';
const SNAPSHOT_SIZE = 160;

export function loadPeople(): RecognizedPerson[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePeople(people: RecognizedPerson[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    return true;
  } catch {
    return false;
  }
}

export function captureSnapshot(el: HTMLVideoElement | HTMLImageElement, clientX: number, clientY: number): string {
  const isVideo = el instanceof HTMLVideoElement;
  const vw = isVideo ? el.videoWidth : el.naturalWidth;
  const vh = isVideo ? el.videoHeight : el.naturalHeight;
  if (!vw || !vh) return '';
  const rect = el.getBoundingClientRect();
  const scale = Math.max(rect.width / vw, rect.height / vh);
  const offX = (rect.width - vw * scale) / 2;
  const offY = (rect.height - vh * scale) / 2;
  const cx = Math.min(vw, Math.max(0, (clientX - rect.left - offX) / scale));
  const cy = Math.min(vh, Math.max(0, (clientY - rect.top - offY) / scale));
  const side = Math.min(vw, vh) * 0.35;
  const sx = Math.max(0, Math.min(vw - side, cx - side / 2));
  const sy = Math.max(0, Math.min(vh - side, cy - side / 2));
  const canvas = document.createElement('canvas');
  canvas.width = SNAPSHOT_SIZE;
  canvas.height = SNAPSHOT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(el, sx, sy, side, side, 0, 0, SNAPSHOT_SIZE, SNAPSHOT_SIZE);
  return canvas.toDataURL('image/jpeg', 0.85);
}
