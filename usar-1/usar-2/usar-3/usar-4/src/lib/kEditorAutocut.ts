export interface AutocutSegment {
  start: number;
  end: number;
}

export interface AutocutReport {
  keep: AutocutSegment[];
  cutSeconds: number;
  totalSeconds: number;
}

const STEP = 0.5;
const STILL_LIMIT = 3;
const MOTION_THRESHOLD = 6;
const DARK_LUMA = 22;
const FLAT_VARIANCE = 40;
const VOICE_RMS = 0.02;

function seekTo(video: HTMLVideoElement, time: number) {
  return new Promise<void>((resolve, reject) => {
    const done = () => {
      video.removeEventListener('seeked', done);
      video.removeEventListener('error', fail);
      resolve();
    };
    const fail = () => {
      video.removeEventListener('seeked', done);
      video.removeEventListener('error', fail);
      reject(new Error('Não foi possível ler o vídeo.'));
    };
    video.addEventListener('seeked', done);
    video.addEventListener('error', fail);
    video.currentTime = time;
  });
}

function loadVideo(url: string) {
  return new Promise<HTMLVideoElement>((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new Error('Não foi possível abrir o vídeo para análise.'));
    video.src = url;
  });
}

function frameStats(ctx: CanvasRenderingContext2D, width: number, height: number, previous: Uint8ClampedArray | null) {
  const data = ctx.getImageData(0, 0, width, height).data;
  const luma = new Float32Array(width * height);
  let sum = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    luma[p] = y;
    sum += y;
  }
  const mean = sum / luma.length;
  let variance = 0;
  for (let p = 0; p < luma.length; p++) variance += (luma[p] - mean) ** 2;
  variance /= luma.length;

  let motion = 0;
  if (previous) {
    let diff = 0;
    for (let p = 0, i = 0; p < luma.length; p++, i += 4) {
      diff += Math.abs(luma[p] - (0.299 * previous[i] + 0.587 * previous[i + 1] + 0.114 * previous[i + 2]));
    }
    motion = diff / luma.length;
  }
  return { mean, variance, motion, pixels: data.slice() };
}

async function audioRmsPerStep(url: string, duration: number): Promise<number[]> {
  const bins = Math.max(1, Math.ceil(duration / STEP));
  const result = new Array<number>(bins).fill(0);
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const ctx = new AudioContext();
    const decoded = await ctx.decodeAudioData(buffer);
    await ctx.close();
    const channel = decoded.getChannelData(0);
    const samplesPerBin = Math.floor(decoded.sampleRate * STEP);
    for (let b = 0; b < bins; b++) {
      let sum = 0;
      const from = b * samplesPerBin;
      const to = Math.min(channel.length, from + samplesPerBin);
      for (let i = from; i < to; i++) sum += channel[i] * channel[i];
      result[b] = to > from ? Math.sqrt(sum / (to - from)) : 0;
    }
  } catch {
    return result;
  }
  return result;
}

export async function analyzeVideoForAutocut(
  url: string,
  onProgress?: (ratio: number) => void,
): Promise<AutocutReport> {
  const video = await loadVideo(url);
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Vídeo sem duração válida.');

  const width = 64;
  const height = Math.max(36, Math.round((video.videoHeight / Math.max(video.videoWidth, 1)) * width));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Navegador sem suporte a análise de vídeo.');

  const voice = await audioRmsPerStep(url, duration);
  const steps = Math.ceil(duration / STEP);
  const blank: boolean[] = new Array(steps).fill(false);
  const active: boolean[] = new Array(steps).fill(false);
  let previous: Uint8ClampedArray | null = null;

  for (let s = 0; s < steps; s++) {
    const t = Math.min(s * STEP, Math.max(0, duration - 0.05));
    await seekTo(video, t);
    ctx.drawImage(video, 0, 0, width, height);
    const stats = frameStats(ctx, width, height, previous);
    previous = stats.pixels;
    blank[s] = stats.mean < DARK_LUMA || stats.variance < FLAT_VARIANCE;
    active[s] = stats.motion > MOTION_THRESHOLD || (voice[s] ?? 0) > VOICE_RMS;
    onProgress?.((s + 1) / steps);
  }

  const keepStep: boolean[] = new Array(steps).fill(false);
  let stillRun = 0;
  for (let s = 0; s < steps; s++) {
    stillRun = active[s] ? 0 : stillRun + 1;
    keepStep[s] = !blank[s] && (active[s] || stillRun * STEP < STILL_LIMIT);
  }

  const keep: AutocutSegment[] = [];
  let runStart = -1;
  for (let s = 0; s <= steps; s++) {
    if (s < steps && keepStep[s]) {
      if (runStart < 0) runStart = s * STEP;
    } else if (runStart >= 0) {
      keep.push({ start: runStart, end: Math.min(duration, s * STEP) });
      runStart = -1;
    }
  }

  const kept = keep.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
  return { keep: keep.filter((seg) => seg.end - seg.start >= STEP), cutSeconds: Math.max(0, duration - kept), totalSeconds: duration };
}
