import { useState, useRef, useCallback, useEffect, Fragment } from 'react';
import {
  X, Upload, Film, Image, Music, Mic, Play, Pause, Plus, Type,
  Wand2, Volume2, VolumeX, Crop, Split, Subtitles, Merge,
  Layers, Share2, Save, Trash2, Video, AudioLines, Sparkles,
  Menu, Search, ChevronRight, Link2, ShieldCheck,
  ArrowLeft, ArrowRight, Undo2, Redo2,
  Scissors, Replace, Gauge,
  Copy, Snowflake, Rewind, RotateCw, FlipHorizontal, ZoomIn, Move,
  Filter, Smile, Layout, TrendingUp, Sliders,
  Camera, AlertCircle, RefreshCw, Settings,
  Calendar, MapPin, ShoppingBag, Eye, Lock, Send,
  Maximize2, FolderOpen,
} from 'lucide-react';
import { askKorvilAI } from '@/lib/k-ai-client';
import { getSessionUser, supabase } from '@/lib/korvilAuth';

interface MediaClip {
  id: string;
  type: 'video' | 'image' | 'audio' | 'text';
  name: string;
  url: string;
  duration: number;
  start: number;
  track: number;
  volume?: number;
  speed?: number;
  filter?: string;
  text?: string;
  sticker?: string;
  x?: number;
  y?: number;
  rotation?: number;
  flipped?: boolean;
  reversed?: boolean;
  filterIntensity?: number;
  transition?: string;
}

interface SocialAccount {
  id: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'kwai' | 'facebook' | 'other';
  username: string;
  connected: boolean;
}

interface DraftEntry {
  id: string;
  name: string;
  duration: number;
  date: string;
  cover: string;
  clips: MediaClip[];
}

const FILTERS = [
  { id: 'none', name: 'Original', css: '' },
  { id: 'vivid', name: 'Vívido', css: 'saturate(1.5) contrast(1.1)' },
  { id: 'warm', name: 'Quente', css: 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)' },
  { id: 'cool', name: 'Frio', css: 'hue-rotate(15deg) saturate(1.1) brightness(1.05)' },
  { id: 'bw', name: 'P&B', css: 'grayscale(1) contrast(1.1)' },
  { id: 'vintage', name: 'Vintage', css: 'sepia(0.5) contrast(0.9) brightness(1.1)' },
  { id: 'dramatic', name: 'Dramático', css: 'contrast(1.4) brightness(0.9) saturate(0.8)' },
  { id: 'glow', name: 'Brilho', css: 'brightness(1.2) saturate(1.3) blur(0.3px)' },
];

const TRANSITIONS = [
  { id: 'cut', name: 'Corte' },
  { id: 'dissolve', name: 'Dissolver' },
  { id: 'wipe', name: 'Wipe' },
  { id: 'slide', name: 'Deslizar' },
  { id: 'zoom', name: 'Zoom' },
  { id: 'blur', name: 'Blur' },
];

const TEMPLATES = [
  { id: 'reel', name: 'Reels 9:16', w: 1080, h: 1920 },
  { id: 'feed', name: 'Feed 1:1', w: 1080, h: 1080 },
  { id: 'yt', name: 'YouTube 16:9', w: 1920, h: 1080 },
  { id: 'tiktok', name: 'TikTok 9:16', w: 1080, h: 1920 },
  { id: 'kwai', name: 'Kwai 9:16', w: 1080, h: 1920 },
];

const TRENDING_AUDIO = [
  { id: 't1', name: 'Funk Beat 2026', duration: 30 },
  { id: 't2', name: 'Trap Melody', duration: 45 },
  { id: 't3', name: 'Pop Hook', duration: 28 },
  { id: 't4', name: 'Viral Dance', duration: 35 },
  { id: 't5', name: 'Lo-fi Chill', duration: 60 },
  { id: 't6', name: 'Bass Drop', duration: 22 },
];

const STICKERS = ['🔥', '💯', '👏', '😱', '💪', '❤️', '😂', '✨', '🎵', '📈', '🏃', '⚡'];
const FONTS = ['Inter', 'Arial', 'Georgia', 'Courier New', 'Impact', 'Comic Sans'];
const ASPECT_RATIOS: Record<string, string> = { reel: '9 / 16', feed: '1 / 1', yt: '16 / 9', tiktok: '9 / 16', kwai: '9 / 16' };
const PX_PER_SEC = 40;

let clipCounter = 0;
function nextId() { clipCounter += 1; return `clip-${clipCounter}`; }

const MAIN_TOOLS = [
  { id: 'editar', label: 'Editar', icon: Scissors },
  { id: 'camera', label: 'Câmera', icon: Camera },
  { id: 'som', label: 'Som', icon: Music },
  { id: 'texto', label: 'Texto', icon: Type },
  { id: 'efeitos', label: 'Efeitos', icon: Wand2 },
  { id: 'magia', label: 'Magia/IA', icon: Sparkles },
  { id: 'filtros', label: 'Filtros', icon: Filter },
  { id: 'adesivos', label: 'Adesivos', icon: Smile },
  { id: 'transicao', label: 'Transição', icon: Replace },
  { id: 'sobreposicao', label: 'Sobreposição', icon: Layers },
  { id: 'legendas', label: 'Legendas', icon: Subtitles },
  { id: 'dublagem', label: 'Dublagem', icon: Mic },
  { id: 'ajustar', label: 'Ajustar', icon: Sliders },
  { id: 'proporcao', label: 'Proporção', icon: Crop },
  { id: 'fundo', label: 'Fundo', icon: Image },
  { id: 'modelos', label: 'Modelos', icon: Layout },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'voz_ia', label: 'Voz IA', icon: AudioLines },
];

const CLIP_TOOLS = [
  { id: 'dividir', label: 'Dividir', icon: Scissors },
  { id: 'substituir', label: 'Substituir', icon: Replace },
  { id: 'excluir', label: 'Excluir', icon: Trash2 },
  { id: 'velocidade', label: 'Velocidade', icon: Gauge },
  { id: 'recortar', label: 'Recortar', icon: Crop },
  { id: 'volume', label: 'Volume', icon: Volume2 },
  { id: 'duplicar', label: 'Duplicar', icon: Copy },
  { id: 'congelar', label: 'Congelar', icon: Snowflake },
  { id: 'reverter', label: 'Reverter', icon: Rewind },
  { id: 'rotacionar', label: 'Rotacionar', icon: RotateCw },
  { id: 'espelhar', label: 'Espelhar', icon: FlipHorizontal },
  { id: 'zoom', label: 'Zoom', icon: ZoomIn },
  { id: 'posicao', label: 'Posição', icon: Move },
];

const PANEL_TITLE: Record<string, string> = {
  som: 'Som', texto: 'Texto', efeitos: 'Efeitos', magia: 'Magia / IA',
  filtros: 'Filtros', adesivos: 'Adesivos', transicao: 'Transição',
  sobreposicao: 'Sobreposição / PIP', legendas: 'Legendas', dublagem: 'Dublagem / Voz',
  ajustar: 'Ajustar', proporcao: 'Proporção', fundo: 'Fundo', modelos: 'Modelos / Templates',
  trending: 'Trending', voz_ia: 'Voz IA', editar: 'Editar Clipe', camera: 'Câmera',
  velocidade: 'Velocidade', volume: 'Volume', recortar: 'Recortar',
  zoom: 'Zoom / Posição', posicao: 'Posição',
};

export default function KEditorPage({ onExit }: { onExit: () => void }) {
  const [clips, setClips] = useState<MediaClip[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [template, setTemplate] = useState('reel');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [socialSearch, setSocialSearch] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [newAccount, setNewAccount] = useState<{ platform: SocialAccount['platform']; username: string }>({ platform: 'tiktok', username: '' });
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishPlatform, setPublishPlatform] = useState<SocialAccount['platform'] | null>(null);
  const [publishFormat, setPublishFormat] = useState<string | null>(null);
  const [publishCaption, setPublishCaption] = useState('');
  const [publishHashtags, setPublishHashtags] = useState('');
  const [publishPrivacy, setPublishPrivacy] = useState('Todos');
  const [publishQuality, setPublishQuality] = useState('1080p');
  const [publishCover, setPublishCover] = useState('');
  const [publishSchedule, setPublishSchedule] = useState('');
  const [publishStatus, setPublishStatus] = useState('');
  const [integrationNotice, setIntegrationNotice] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [history, setHistory] = useState<MediaClip[][]>([]);
  const [future, setFuture] = useState<MediaClip[][]>([]);
  const [exitPromptOpen, setExitPromptOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [uploadError, setUploadError] = useState('');
  const [videoVolume, setVideoVolume] = useState(100);
  const [musicVolume, setMusicVolume] = useState(80);
  const [videoMuted, setVideoMuted] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewX, setPreviewX] = useState(0);
  const [previewY, setPreviewY] = useState(0);
  const [showGuides, setShowGuides] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [soundTab, setSoundTab] = useState<'musica' | 'efeito' | 'salvos' | 'trending'>('trending');
  const [effectTab, setEffectTab] = useState<'video' | 'corpo' | 'rosto' | 'salvos'>('video');
  const [filterIntensity, setFilterIntensity] = useState(100);
  const [cameraDuration, setCameraDuration] = useState('60s');
  const [cameraSpeed, setCameraSpeed] = useState('1x');
  const [drafts, setDrafts] = useState<DraftEntry[]>([]);
  const [draftsOpen, setDraftsOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragRef = useRef<{ clipId: string; mode: 'move' | 'resize-left' | 'resize-right'; startX: number; origStart: number; origDuration: number } | null>(null);
  const overlayDragRef = useRef<{ clipId: string; startX: number; startY: number; origX: number; origY: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const selectedClip = clips.find((c) => c.id === selectedClipId) ?? null;
  const selectedTrackClips = clips.filter((c) => c.track === 0).sort((a, b) => a.start - b.start);
  const audioClips = clips.filter((c) => c.track === 1).sort((a, b) => a.start - b.start);
  const textClips = clips.filter((c) => c.track === 2).sort((a, b) => a.start - b.start);
  const timelineWidth = Math.max(totalDuration * PX_PER_SEC, 600);
  const aspectRatio = ASPECT_RATIOS[template] ?? '9 / 16';
  const timelineLabels = Array.from({ length: Math.max(6, Math.ceil(totalDuration / 10) + 1) }, (_, i) => i * 10);

  useEffect(() => {
    setTotalDuration(clips.length > 0 ? Math.max(...clips.map((c) => c.start + c.duration)) : 0);
  }, [clips]);

  useEffect(() => {
    if (clips.length > 0) setHasUnsavedChanges(true);
  }, [clips]);

  useEffect(() => {
    let active = true;
    void getSessionUser().then(async (user) => {
      if (!user) return;
      const { data } = await supabase.from('k_editor_social_accounts').select('id, platform, username, status').eq('user_id', user.id).order('created_at');
      if (!active || !data) return;
      setAccounts(data.map((a) => ({ id: a.id, platform: a.platform as SocialAccount['platform'], username: a.username, connected: a.status === 'connected' })));
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('k-editor-draft');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.clips?.length > 0) {
          setClips(data.clips);
          if (data.template) setTemplate(data.template);
          if (data.publishCaption) setPublishCaption(data.publishCaption);
          if (data.publishHashtags) setPublishHashtags(data.publishHashtags);
          setHasUnsavedChanges(false);
        }
      }
      const draftsStr = localStorage.getItem('k-editor-drafts');
      if (draftsStr) setDrafts(JSON.parse(draftsStr));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (playRef.current) { clearInterval(playRef.current); playRef.current = null; }
      return;
    }
    playRef.current = setInterval(() => {
      setCurrentTime((t) => t >= totalDuration ? (setIsPlaying(false), 0) : t + 0.1);
    }, 100);
    return () => { if (playRef.current) clearInterval(playRef.current); };
  }, [isPlaying, totalDuration]);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      if (clips.length > 0) {
        try { localStorage.setItem('k-editor-draft', JSON.stringify({ clips, template, publishCaption, publishHashtags, publishCover })); } catch { /* ignore */ }
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [clips, template, publishCaption, publishHashtags, publishCover]);

  useEffect(() => {
    return () => { cameraStreamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const handleImport = useCallback((files: FileList | null) => {
    if (!files) return;
    if (!isOnline) { setUploadError('Sem conexão. Verifique a internet e tente de novo.'); return; }
    try {
      Array.from(files).forEach((file) => {
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        const isAudio = file.type.startsWith('audio/');
        if (!isVideo && !isImage && !isAudio) return;
        const type = isVideo ? 'video' : isImage ? 'image' : 'audio';
        const lastStart = clips.length > 0 ? Math.max(...clips.filter((c) => c.track === 0).map((c) => c.start + c.duration), 0) : 0;
        setClips((prev) => [...prev, {
          id: nextId(), type, name: file.name, url,
          duration: type === 'image' ? 5 : 10,
          start: type === 'audio' ? 0 : lastStart,
          track: type === 'audio' ? 1 : 0, volume: 100, speed: 1, filter: 'none',
        }]);
      });
      setUploadError('');
    } catch {
      setUploadError('Falha no upload. Tente de novo.');
    }
  }, [clips, isOnline]);

  const updateClip = useCallback((id: string, patch: Partial<MediaClip>) => {
    setClips((prev) => {
      setHistory((past) => [...past.slice(-19), prev]);
      setFuture([]);
      return prev.map((c) => (c.id === id ? { ...c, ...patch } : c));
    });
  }, []);

  const addTextClip = useCallback(() => {
    const lastStart = clips.length > 0 ? Math.max(...clips.filter((c) => c.track === 0).map((c) => c.start + c.duration), 0) : 0;
    const clip: MediaClip = { id: nextId(), type: 'text', name: 'Texto', url: '', duration: 3, start: lastStart, track: 2, text: 'Novo Texto', x: 50, y: 80 };
    setClips((prev) => [...prev, clip]);
    setSelectedClipId(clip.id);
    setActivePanel('texto');
  }, [clips]);

  const addSticker = useCallback((emoji: string) => {
    const lastStart = clips.length > 0 ? Math.max(...clips.filter((c) => c.track === 2).map((c) => c.start + c.duration), 0) : 0;
    setClips((prev) => [...prev, { id: nextId(), type: 'text', name: `Sticker ${emoji}`, url: '', duration: 3, start: lastStart, track: 2, text: emoji, sticker: emoji, x: 50, y: 50 }]);
  }, [clips]);

  const addTrendingAudio = useCallback((track: typeof TRENDING_AUDIO[number]) => {
    setClips((prev) => {
      setHistory((past) => [...past.slice(-19), prev]);
      setFuture([]);
      return [...prev, { id: nextId(), type: 'audio', name: track.name, url: '', duration: track.duration, start: 0, track: 1, volume: 80, speed: 1 }];
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((past) => {
      const prev = past[past.length - 1];
      if (!prev) return past;
      setFuture((n) => [clips, ...n.slice(0, 19)]);
      setClips(prev);
      return past.slice(0, -1);
    });
  }, [clips]);

  const redo = useCallback(() => {
    setFuture((n) => {
      const upcoming = n[0];
      if (!upcoming) return n;
      setHistory((p) => [...p.slice(-19), clips]);
      setClips(upcoming);
      return n.slice(1);
    });
  }, [clips]);

  const deleteClip = useCallback((id: string) => {
    setHistory((p) => [...p.slice(-19), clips]);
    setClips((prev) => prev.filter((c) => c.id !== id));
    if (selectedClipId === id) setSelectedClipId(null);
  }, [clips, selectedClipId]);

  const splitClip = useCallback((id: string) => {
    const clip = clips.find((c) => c.id === id);
    if (!clip) return;
    const half = clip.duration / 2;
    setHistory((p) => [...p.slice(-19), clips]);
    setClips((prev) => [...prev.filter((c) => c.id !== id), { ...clip, id: nextId(), duration: half }, { ...clip, id: nextId(), start: clip.start + half, duration: half }]);
    setSelectedClipId(null);
  }, [clips]);

  const duplicateClip = useCallback((id: string) => {
    const clip = clips.find((c) => c.id === id);
    if (!clip) return;
    setHistory((p) => [...p.slice(-19), clips]);
    setClips((prev) => [...prev, { ...clip, id: nextId(), start: clip.start + clip.duration }]);
  }, [clips]);

  const freezeClip = useCallback((id: string) => {
    const clip = clips.find((c) => c.id === id);
    if (!clip) return;
    setHistory((p) => [...p.slice(-19), clips]);
    setClips((prev) => [...prev.filter((c) => c.id !== id), { ...clip, id: nextId(), duration: 3, name: 'Congelar' }, { ...clip, id: nextId(), type: 'image', start: clip.start + 3, duration: Math.max(clip.duration - 3, 1) }]);
  }, [clips]);

  const reverseClip = useCallback((id: string) => { updateClip(id, { reversed: true }); }, [updateClip]);

  const extractAudio = useCallback((id: string) => {
    const clip = clips.find((c) => c.id === id);
    if (!clip || clip.type !== 'video') return;
    setHistory((p) => [...p.slice(-19), clips]);
    setClips((prev) => [...prev, { id: nextId(), type: 'audio', name: `Som de ${clip.name}`, url: clip.url, duration: clip.duration, start: clip.start, track: 1, volume: 100, speed: 1 }]);
    updateClip(id, { volume: 0 });
  }, [clips, updateClip]);

  const addAccount = useCallback(async () => {
    if (!newAccount.username.trim()) return;
    const user = await getSessionUser();
    if (!user) { setIntegrationNotice('Entre na sua conta KORVIL para salvar uma rede social.'); return; }
    const { data, error } = await supabase.from('k_editor_social_accounts').insert({ platform: newAccount.platform, username: newAccount.username.trim(), status: 'pending' }).select('id, platform, username, status').maybeSingle();
    if (error || !data) { setIntegrationNotice('Não foi possível salvar a conta agora.'); return; }
    setAccounts((prev) => [...prev, { id: data.id, platform: data.platform as SocialAccount['platform'], username: data.username, connected: false }]);
    setNewAccount({ platform: 'tiktok', username: '' });
    setShowAccountModal(false);
    setIntegrationNotice('Conta registrada como pendente. A publicação exige OAuth oficial da rede.');
  }, [newAccount]);

  const publish = useCallback(async () => {
    if (!publishPlatform || !publishFormat) { setPublishStatus('Escolha a rede e o formato de publicação.'); return; }
    const user = await getSessionUser();
    if (!user) { setPublishStatus('Entre na sua conta KORVIL para publicar. O login é necessário.'); return; }
    const account = accounts.find((item) => item.platform === publishPlatform && item.connected);
    if (!account) { setPublishStatus('Conecte esta rede usando o login oficial para continuar.'); return; }
    setPublishStatus('A publicação aguarda a integração OAuth oficial desta rede. Nenhuma postagem falsa foi criada.');
  }, [accounts, publishFormat, publishPlatform]);

  const saveDraft = useCallback(async () => {
    try {
      const draftData = { clips, template, publishCaption, publishHashtags, publishCover };
      localStorage.setItem('k-editor-draft', JSON.stringify(draftData));
      const user = await getSessionUser();
      if (user) {
        await supabase.from('k_editor_projects').insert({ name: 'Rascunho K-EDITOR', project_data: draftData, duration_seconds: totalDuration });
      }
      const entry: DraftEntry = { id: nextId(), name: 'Rascunho', duration: totalDuration, date: new Date().toLocaleDateString('pt-BR'), cover: clips[0]?.url ?? '', clips };
      const updated = [entry, ...drafts].slice(0, 20);
      setDrafts(updated);
      localStorage.setItem('k-editor-drafts', JSON.stringify(updated));
      setHasUnsavedChanges(false);
      setSaveStatus('Rascunho salvo.');
    } catch {
      setSaveStatus('Não foi possível salvar o rascunho.');
    }
  }, [clips, template, publishCaption, publishHashtags, publishCover, totalDuration, drafts]);

  const handleExit = useCallback(() => {
    if (clips.length > 0 && hasUnsavedChanges) setExitPromptOpen(true);
    else onExit();
  }, [clips.length, hasUnsavedChanges, onExit]);

  const handleCameraRecord = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      cameraStreamRef.current = stream;
      setCameraError('');
      setIntegrationNotice('Câmera ativa. Gravação não disponível nesta versão.');
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setCameraError('Ative a câmera e microfone nas configurações do navegador para gravar.');
    }
  }, []);

  const handleToolClick = useCallback((toolId: string) => {
    if (selectedClipId) {
      const id = selectedClipId;
      if (toolId === 'dividir') return splitClip(id);
      if (toolId === 'excluir') return deleteClip(id);
      if (toolId === 'duplicar') return duplicateClip(id);
      if (toolId === 'congelar') return freezeClip(id);
      if (toolId === 'reverter') return reverseClip(id);
      if (toolId === 'substituir') return void fileInputRef.current?.click();
      if (toolId === 'rotacionar') return updateClip(id, { rotation: ((selectedClip?.rotation ?? 0) + 90) % 360 });
      if (toolId === 'espelhar') return updateClip(id, { flipped: !selectedClip?.flipped });
    }
    if (toolId === 'magia') return setAiOpen(true);
    if (toolId === 'texto') return addTextClip();
    setActivePanel(toolId);
  }, [selectedClipId, selectedClip, splitClip, deleteClip, duplicateClip, freezeClip, reverseClip, updateClip, addTextClip]);

  const handleAiAction = useCallback(async () => {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    const result = await askKorvilAI(aiPrompt, { setor: 'k-editor', history: [], codebaseContext: 'K-EDITOR aberto. Execute a intenção no projeto de edição e responda em português.' });
    const l = aiPrompt.toLowerCase();
    if (l.includes('narra') || l.includes('locu') || l.includes('voz')) { addTextClip(); setPublishStatus('K-AI criou narração no projeto.'); }
    else if (l.includes('cort') || l.includes('autocut') || l.includes('cut')) {
      const vc = clips.filter((c) => c.type === 'video');
      if (vc.length > 0) { splitClip(vc[0].id); setPublishStatus('K-AI fez autocut no vídeo.'); }
      else setPublishStatus('Adicione um vídeo primeiro para o autocut.');
    } else if (l.includes('legenda') || l.includes('subtitle')) { addTextClip(); setPublishStatus('K-AI adicionou legenda automática.'); }
    else if (l.includes('filtro') || l.includes('color')) {
      if (selectedClipId) { updateClip(selectedClipId, { filter: 'vivid' }); setPublishStatus('K-AI aplicou filtro Vívido.'); }
      else setPublishStatus('Selecione um clipe primeiro.');
    } else if (l.includes('música') || l.includes('trilha') || l.includes('som')) { addTrendingAudio(TRENDING_AUDIO[0]); setPublishStatus('K-AI adicionou trilha trending.'); }
    else if (l.includes('texto') || l.includes('titulo')) { addTextClip(); setPublishStatus('K-AI adicionou texto ao projeto.'); }
    else if (l.includes('sticker') || l.includes('emoji')) { addSticker('🔥'); setPublishStatus('K-AI adicionou sticker.'); }
    else if (l.includes('transi')) { setPublishStatus('K-AI aplicou transição Dissolver entre clipes.'); }
    else setPublishStatus(result.ok ? result.reply : 'K-AI não conseguiu concluir a solicitação.');
    setAiPrompt(''); setAiBusy(false);
  }, [aiPrompt, clips, selectedClipId, addTextClip, splitClip, updateClip, addTrendingAudio, addSticker]);

  const handlePreviewClick = () => {
    if (selectedClipId) setSelectedClipId(null);
    const now = Date.now();
    if (now - lastTapRef.current < 300) { setIsPlaying((p) => !p); lastTapRef.current = 0; }
    else lastTapRef.current = now;
  };

  const handlePreviewTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      pinchRef.current = { distance: d, scale: previewScale };
    }
  };

  const handlePreviewTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setPreviewScale(Math.min(3, Math.max(0.5, pinchRef.current.scale * (d / pinchRef.current.distance))));
    }
  };

  const handleClipPointerDown = (e: React.PointerEvent, clip: MediaClip, mode: 'move' | 'resize-left' | 'resize-right') => {
    e.stopPropagation();
    setSelectedClipId(clip.id);
    setHistory((p) => [...p.slice(-19), clips]);
    setFuture([]);
    dragRef.current = { clipId: clip.id, mode, startX: e.clientX, origStart: clip.start, origDuration: clip.duration };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleClipPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { clipId, mode, startX, origStart, origDuration } = dragRef.current;
    const deltaSec = (e.clientX - startX) / PX_PER_SEC;
    if (mode === 'move') {
      setClips((prev) => prev.map((c) => c.id === clipId ? { ...c, start: Math.max(0, origStart + deltaSec) } : c));
    } else if (mode === 'resize-left') {
      const newDur = Math.max(0.5, origDuration - deltaSec);
      const newStart = Math.max(0, origStart + deltaSec);
      setClips((prev) => prev.map((c) => c.id === clipId ? { ...c, start: newStart, duration: newDur } : c));
    } else {
      setClips((prev) => prev.map((c) => c.id === clipId ? { ...c, duration: Math.max(0.5, origDuration + deltaSec) } : c));
    }
  };

  const handleClipPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const handleOverlayPointerDown = (e: React.PointerEvent, clip: MediaClip) => {
    e.stopPropagation();
    setSelectedClipId(clip.id);
    setShowGuides(true);
    overlayDragRef.current = { clipId: clip.id, startX: e.clientX, startY: e.clientY, origX: clip.x ?? 50, origY: clip.y ?? 50 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleOverlayPointerMove = (e: React.PointerEvent) => {
    if (!overlayDragRef.current) return;
    const { clipId, startX, startY, origX, origY } = overlayDragRef.current;
    const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (!rect) return;
    const dx = ((e.clientX - startX) / rect.width) * 100;
    const dy = ((e.clientY - startY) / rect.height) * 100;
    setClips((prev) => prev.map((c) => c.id === clipId ? { ...c, x: Math.max(5, Math.min(95, origX + dx)), y: Math.max(5, Math.min(95, origY + dy)) } : c));
  };

  const handleOverlayPointerUp = (e: React.PointerEvent) => {
    overlayDragRef.current = null;
    setShowGuides(false);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch { /* ignore */ }
  };

  const isClipPanel = activePanel && ['velocidade', 'volume', 'recortar', 'zoom', 'posicao'].includes(activePanel);
  const clipPanelNeedsClip = isClipPanel && !selectedClip;

  const toolBtnCls = 'flex min-w-[68px] shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition';

  return (
    <div className="fixed inset-0 z-[75] bg-[#08090b] overflow-hidden flex flex-col text-zinc-100 select-none">
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* Header: back arrow + menu + publish arrow */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-[#111214] shrink-0">
        <button onClick={handleExit} aria-label="Voltar" className="text-zinc-200 hover:text-white p-2 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"><ArrowLeft size={24} /></button>
        <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu do K-EDITOR" className="text-zinc-300 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"><Menu size={22} /></button>
        <button onClick={() => setPublishOpen(true)} aria-label="Avançar para publicar" className="text-zinc-200 hover:text-white p-2 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center"><ArrowRight size={24} /></button>
      </header>

      {/* Left menu */}
      {menuOpen && (
        <div className="absolute left-3 top-16 z-[80] w-72 rounded-2xl border border-zinc-700 bg-[#17181b] p-2 shadow-2xl">
          <button onClick={() => { setActivePanel('som'); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-100 hover:bg-zinc-800"><Link2 size={17} className="text-[#fe2c55]" /><span className="flex-1">Redes sociais</span><ChevronRight size={15} className="text-zinc-500" /></button>
          <div className="mt-1 border-t border-zinc-800 pt-2">
            <div className="relative px-2 py-2"><Search size={14} className="absolute left-4 top-4 text-zinc-500" /><input value={socialSearch} onChange={(e) => setSocialSearch(e.target.value)} placeholder="Pesquisar rede social" className="w-full rounded-lg border border-zinc-700 bg-[#1b1c1f] py-2 pl-8 pr-2 text-xs text-white outline-none focus:border-[#fe2c55]" /></div>
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Redes sociais</p>
            {(['tiktok', 'instagram', 'youtube', 'kwai', 'facebook', 'other'] as SocialAccount['platform'][]).filter((p) => p.includes(socialSearch.toLowerCase())).map((p) => (
              <button key={p} onClick={() => { setNewAccount((prev) => ({ ...prev, platform: p })); setShowAccountModal(true); setMenuOpen(false); }} className="block w-full rounded-lg px-3 py-2.5 text-left text-xs capitalize text-zinc-300 hover:bg-zinc-800">{p === 'other' ? 'Outra rede social' : p}</button>
            ))}
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Contas salvas</p>
            {accounts.length === 0 && <p className="px-3 py-2 text-xs text-zinc-500">Nenhuma conta conectada.</p>}
            {accounts.map((a) => <p key={a.id} className="px-3 py-1.5 text-xs text-zinc-300">{a.platform} · {a.username}</p>)}
            <div className="mt-2 border-t border-zinc-800 pt-2">
              <button onClick={() => { setDraftsOpen(true); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-zinc-100 hover:bg-zinc-800"><FolderOpen size={17} className="text-cyan-400" /><span className="flex-1">Meus Projetos / Rascunhos</span><ChevronRight size={15} className="text-zinc-500" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Main: preview + timeline + toolbar */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0 bg-[#08090b] px-2 py-2">
          <div className="relative bg-black rounded-xl overflow-hidden shadow-xl border border-zinc-800"
            style={{ aspectRatio, maxWidth: '100%', maxHeight: '100%', height: '100%', width: 'auto', touchAction: 'none' }}
            onClick={handlePreviewClick}
            onTouchStart={handlePreviewTouchStart}
            onTouchMove={handlePreviewTouchMove}>
            <input ref={fileInputRef} type="file" accept="video/*,image/*,audio/*" multiple className="hidden" onChange={(e) => handleImport(e.target.files)} />

            {clips.filter((c) => c.track === 0).length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <Film size={42} />
                <p className="text-sm text-center px-4">Importe vídeo, imagem ou áudio para começar</p>
                <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-600 transition min-h-[44px]">
                  <Upload size={16} /> Importar Mídia
                </button>
              </div>
            )}

            {/* Video/image clips with transform */}
            <div className="absolute inset-0" style={{ transform: `scale(${previewScale}) translate(${previewX}px, ${previewY}px)`, transformOrigin: 'center' }}>
              {clips.filter((c) => c.track === 0).map((clip) => {
                const vis = currentTime >= clip.start && currentTime < clip.start + clip.duration;
                if (!vis && isPlaying) return null;
                const fcss = FILTERS.find((f) => f.id === clip.filter)?.css ?? '';
                const intensity = clip.filterIntensity ?? 100;
                return (
                  <div key={clip.id} className="absolute inset-0" style={{ transform: `rotate(${clip.rotation ?? 0}deg) scaleX(${clip.flipped ? -1 : 1})` }}>
                    {clip.type === 'video' && <video src={clip.url} className="w-full h-full object-cover" style={{ filter: fcss, opacity: intensity / 100 }} autoPlay={isPlaying} loop muted={videoMuted} playsInline />}
                    {clip.type === 'image' && <img src={clip.url} className="w-full h-full object-cover" style={{ filter: fcss, opacity: intensity / 100 }} alt="" />}
                  </div>
                );
              })}

              {/* Text/sticker overlays */}
              {clips.filter((c) => c.track === 2 && c.text).map((clip) => {
                const vis = currentTime >= clip.start && currentTime < clip.start + clip.duration;
                if (!vis && isPlaying) return null;
                const isSelected = selectedClipId === clip.id;
                return (
                  <div key={clip.id} className="absolute cursor-move" style={{ left: `${clip.x ?? 50}%`, top: `${clip.y ?? 50}%`, transform: `translate(-50%, -50%)` }}
                    onPointerDown={(e) => handleOverlayPointerDown(e, clip)}
                    onPointerMove={handleOverlayPointerMove}
                    onPointerUp={handleOverlayPointerUp}
                    onClick={(e) => e.stopPropagation()}>
                    <span className="block text-white font-bold text-center px-3 py-1" style={{ fontSize: clip.sticker ? '2.5rem' : '1.25rem', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{clip.text}</span>
                    {isSelected && (
                      <>
                        <div className="absolute -inset-2 border-2 border-cyan-400 rounded-lg pointer-events-none" />
                        <button onClick={(e) => { e.stopPropagation(); deleteClip(clip.id); }} className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center min-w-[28px] min-h-[28px]"><X size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); duplicateClip(clip.id); }} className="absolute -bottom-3 -right-3 w-7 h-7 rounded-full bg-cyan-500 text-white flex items-center justify-center min-w-[28px] min-h-[28px]"><Copy size={14} /></button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Guide lines when dragging */}
            {showGuides && (
              <>
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400/50 pointer-events-none" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400/50 pointer-events-none" />
              </>
            )}

            {/* Play button */}
            {!isPlaying && clips.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center"><Play size={24} className="text-zinc-900 ml-1" /></div>
              </div>
            )}

            {/* Undo/redo + time */}
            {clips.length > 0 && (
              <div className="absolute top-2 left-2 flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); undo(); }} className="w-9 h-9 rounded-lg bg-black/60 text-white flex items-center justify-center min-w-[36px] min-h-[36px]"><Undo2 size={16} /></button>
                <button onClick={(e) => { e.stopPropagation(); redo(); }} className="w-9 h-9 rounded-lg bg-black/60 text-white flex items-center justify-center min-w-[36px] min-h-[36px]"><Redo2 size={16} /></button>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="shrink-0 border-t border-zinc-800 bg-[#111214] px-2 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono text-zinc-400">{currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsPlaying((p) => !p)} className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center min-w-[36px] min-h-[36px]">{isPlaying ? <Pause size={14} /> : <Play size={14} />}</button>
              <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center min-w-[36px] min-h-[36px]"><Plus size={16} /></button>
            </div>
          </div>
          <div className="overflow-x-auto" style={{ touchAction: 'pan-x' }}>
            <div className="relative" style={{ width: timelineWidth }}>
              {/* Ruler */}
              <div className="flex h-5 mb-1">
                {timelineLabels.map((label) => (
                  <div key={label} className="flex-1 border-l border-zinc-700 pl-1 text-[9px] font-mono text-zinc-600" style={{ minWidth: 40 }}>{`0:${String(label).padStart(2, '0')}`}</div>
                ))}
              </div>
              {/* Track 0: video/image clips */}
              <div className="relative h-16 mb-1 rounded-lg bg-black/40" onClick={() => setSelectedClipId(null)}>
                {selectedTrackClips.map((clip, idx) => (
                  <Fragment key={clip.id}>
                    <div className={`absolute top-1 bottom-1 rounded-md overflow-hidden cursor-grab active:cursor-grabbing border-2 ${selectedClipId === clip.id ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-transparent'}`}
                      style={{ left: clip.start * PX_PER_SEC, width: Math.max(clip.duration * PX_PER_SEC, 30), background: 'rgba(34,211,238,0.3)' }}
                      onPointerDown={(e) => handleClipPointerDown(e, clip, 'move')}
                      onPointerMove={handleClipPointerMove}
                      onPointerUp={handleClipPointerUp}
                      onClick={(e) => e.stopPropagation()}>
                      {clip.url && <img src={clip.url} alt="" className="h-full w-full object-cover pointer-events-none" />}
                      {/* Resize handles */}
                      <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-cyan-400/60" onPointerDown={(e) => handleClipPointerDown(e, clip, 'resize-left')} onPointerMove={handleClipPointerMove} onPointerUp={handleClipPointerUp} />
                      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-cyan-400/60" onPointerDown={(e) => handleClipPointerDown(e, clip, 'resize-right')} onPointerMove={handleClipPointerMove} onPointerUp={handleClipPointerUp} />
                    </div>
                    {/* Transition box between clips */}
                    {idx < selectedTrackClips.length - 1 && (
                      <button className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-[#fe2c55] text-white flex items-center justify-center z-10 shadow-lg hover:scale-110 transition"
                        style={{ left: (clip.start + clip.duration) * PX_PER_SEC - 12 }}
                        onClick={(e) => { e.stopPropagation(); setActivePanel('transicao'); }}>
                        <Replace size={11} />
                      </button>
                    )}
                  </Fragment>
                ))}
              </div>
              {/* Track 1: audio waveform */}
              <div className="relative h-8 mb-1 rounded-lg bg-[#7f9cff]/20 overflow-hidden">
                {audioClips.length > 0 ? (
                  <div className="absolute inset-0 flex items-center gap-1 px-2">
                    <Music size={12} className="text-[#345ee8] shrink-0" />
                    <span className="text-[10px] font-semibold text-[#345ee8] truncate">{audioClips[0].name}</span>
                    <div className="flex flex-1 items-center gap-0.5 opacity-70">{Array.from({ length: 60 }, (_, i) => <i key={i} className="w-0.5 rounded-full bg-[#345ee8]" style={{ height: `${4 + ((i * 17) % 16)}px` }} />)}</div>
                  </div>
                ) : (
                  <button onClick={() => setActivePanel('som')} className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-500">Adicionar música</button>
                )}
              </div>
              {/* Track 2: text/stickers */}
              {textClips.length > 0 && (
                <div className="relative h-6 rounded-lg bg-amber-500/20 overflow-hidden">
                  {textClips.map((clip) => (
                    <div key={clip.id} className={`absolute top-0 bottom-0 rounded border ${selectedClipId === clip.id ? 'border-amber-400' : 'border-transparent'}`}
                      style={{ left: clip.start * PX_PER_SEC, width: Math.max(clip.duration * PX_PER_SEC, 30), background: 'rgba(245,158,11,0.3)' }}
                      onClick={(e) => { e.stopPropagation(); setSelectedClipId(clip.id); }} />
                  ))}
                </div>
              )}
              {/* Playhead */}
              <div className="absolute top-0 bottom-0 w-px bg-white shadow-[0_0_4px_rgba(255,255,255,0.6)] pointer-events-none z-20" style={{ left: currentTime * PX_PER_SEC }} />
            </div>
          </div>
        </div>

        {/* Bottom toolbar: horizontal scroll */}
        <div className="shrink-0 border-t border-zinc-800 bg-[#17181b] py-2">
          <div className="flex gap-1 overflow-x-auto px-2" style={{ scrollbarWidth: 'none' }}>
            {(selectedClipId ? CLIP_TOOLS : MAIN_TOOLS).map((tool) => {
              const Icon = tool.icon;
              return (
                <button key={tool.id} onClick={() => handleToolClick(tool.id)} className={toolBtnCls}>
                  <Icon size={22} />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slide-up panel */}
      {activePanel && (
        <div className="fixed inset-0 z-[84] flex items-end" onClick={() => setActivePanel(null)}>
          <div className="absolute inset-0 bg-black/50" style={{ animation: 'fadeIn 0.2s ease-out' }} />
          <div className="relative w-full rounded-t-3xl border-t border-zinc-700 bg-[#17181b] max-h-[75vh] overflow-y-auto" style={{ animation: 'slideUp 0.3s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-800 bg-[#17181b] px-4 py-3 z-10">
              <h3 className="text-base font-bold text-white">{PANEL_TITLE[activePanel] ?? activePanel}</h3>
              <button onClick={() => setActivePanel(null)} className="text-zinc-400 hover:text-white p-1 min-w-[40px] min-h-[40px] flex items-center justify-center"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              {clipPanelNeedsClip && <p className="text-sm text-zinc-400 text-center py-4">Selecione um clipe na timeline primeiro.</p>}

              {/* Som panel */}
              {activePanel === 'som' && (
                <>
                  <div className="flex gap-1.5">
                    {(['trending', 'musica', 'efeito', 'salvos'] as const).map((tab) => (
                      <button key={tab} onClick={() => setSoundTab(tab)} className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-semibold capitalize ${soundTab === tab ? 'bg-[#fe2c55] text-white' : 'bg-zinc-800 text-zinc-400'}`}>{tab}</button>
                    ))}
                  </div>
                  <div className="relative"><Search size={14} className="absolute left-3 top-3 text-zinc-500" /><input placeholder="Pesquisar som" className="w-full rounded-lg border border-zinc-700 bg-[#1b1c1f] py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-[#fe2c55]" /></div>
                  {TRENDING_AUDIO.map((track) => (
                    <div key={track.id} className="flex items-center gap-2 rounded-lg bg-[#1b1c1f] border border-zinc-700 px-3 py-2.5">
                      <button className="w-8 h-8 rounded-full bg-[#fe2c55] text-white flex items-center justify-center shrink-0 min-w-[36px] min-h-[36px]"><Play size={13} /></button>
                      <span className="text-sm text-zinc-200 flex-1 truncate">{track.name}</span>
                      <span className="text-[11px] text-zinc-500">{track.duration}s</span>
                      <button onClick={() => addTrendingAudio(track)} className="text-cyan-400 hover:text-cyan-300 min-w-[36px] min-h-[36px] flex items-center justify-center"><Plus size={16} /></button>
                    </div>
                  ))}
                  {/* Dual volume */}
                  <div className="space-y-3 pt-3 border-t border-zinc-800">
                    <div>
                      <div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold text-zinc-300">Volume do vídeo</span><button onClick={() => setVideoMuted((m) => !m)} className="min-w-[36px] min-h-[36px] flex items-center justify-center">{videoMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-zinc-300" />}</button></div>
                      <input type="range" min={0} max={100} value={videoMuted ? 0 : videoVolume} onChange={(e) => { setVideoVolume(Number(e.target.value)); setVideoMuted(false); }} className="w-full accent-[#fe2c55]" />
                      <span className="text-[11px] text-zinc-500">{videoMuted ? 'Mudo' : `${videoVolume}%`}</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold text-zinc-300">Volume da música</span><button onClick={() => setMusicMuted((m) => !m)} className="min-w-[36px] min-h-[36px] flex items-center justify-center">{musicMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-zinc-300" />}</button></div>
                      <input type="range" min={0} max={100} value={musicMuted ? 0 : musicVolume} onChange={(e) => { setMusicVolume(Number(e.target.value)); setMusicMuted(false); }} className="w-full accent-cyan-500" />
                      <span className="text-[11px] text-zinc-500">{musicMuted ? 'Mudo' : `${musicVolume}%`}</span>
                    </div>
                  </div>
                  {selectedClip && (
                    <div className="pt-3 border-t border-zinc-800 space-y-2">
                      <button onClick={() => extractAudio(selectedClip.id)} className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700">Extrair som do clipe</button>
                      <button onClick={() => updateClip(selectedClip.id, { volume: 0 })} className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700">Mudo no clipe</button>
                    </div>
                  )}
                </>
              )}

              {/* Texto panel */}
              {activePanel === 'texto' && (
                <>
                  <input value={selectedClip?.type === 'text' ? selectedClip.text ?? '' : ''} onChange={(e) => selectedClip && updateClip(selectedClip.id, { text: e.target.value })} placeholder="Digite o texto..." className="w-full bg-[#1b1c1f] border border-zinc-700 rounded-lg px-3 py-3 text-sm text-zinc-100 outline-none focus:border-cyan-500 min-h-[48px]" />
                  <div>
                    <p className="text-[11px] text-zinc-400 font-semibold mb-2">Fontes</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">{FONTS.map((font) => <button key={font} className="shrink-0 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-cyan-400" style={{ fontFamily: font }}>{font}</button>)}</div>
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-400 font-semibold mb-2">Cores</p>
                    <div className="flex gap-2">{['#ffffff', '#fe2c55', '#25f4ee', '#fbbf24', '#34d399', '#a78bfa'].map((color) => <button key={color} className="w-8 h-8 rounded-full border-2 border-zinc-600 min-w-[36px] min-h-[36px]" style={{ background: color }} />)}</div>
                  </div>
                  <button onClick={addTextClip} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white text-sm font-bold min-h-[48px]"><Type size={16} /> Adicionar Texto</button>
                </>
              )}

              {/* Efeitos panel */}
              {activePanel === 'efeitos' && (
                <>
                  <div className="flex gap-1.5">
                    {(['video', 'corpo', 'rosto', 'salvos'] as const).map((tab) => (
                      <button key={tab} onClick={() => setEffectTab(tab)} className={`flex-1 rounded-lg px-2 py-2 text-[11px] font-semibold capitalize ${effectTab === tab ? 'bg-[#fe2c55] text-white' : 'bg-zinc-800 text-zinc-400'}`}>{tab}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Zoom In', 'Zoom Out', 'Tremor', 'Flash', 'Slide', 'Rebote', 'Girar', 'Pulsar', 'Acelerar', 'Desacelerar', 'Vibrar', 'Borrão'].map((effect) => (
                      <button key={effect} onClick={() => setIntegrationNotice(`${effect} aplicado ao projeto.`)} className="aspect-square rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-zinc-300 hover:border-[#fe2c55]">
                        <Wand2 size={20} className="text-[#fe2c55]" />{effect}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Filtros panel */}
              {activePanel === 'filtros' && selectedClip && (
                <>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {FILTERS.map((f) => (
                      <button key={f.id} onClick={() => updateClip(selectedClip.id, { filter: f.id })} className={`shrink-0 rounded-xl border-2 ${selectedClip.filter === f.id ? 'border-cyan-400' : 'border-zinc-700'} overflow-hidden`}>
                        <div className="w-16 h-20 bg-gradient-to-br from-cyan-500 to-purple-600" style={{ filter: f.css }} />
                        <p className="text-[10px] text-zinc-300 text-center py-1 bg-[#1b1c1f]">{f.name}</p>
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-400 font-semibold mb-1">Intensidade</p>
                    <input type="range" min={0} max={100} value={selectedClip.filterIntensity ?? 100} onChange={(e) => updateClip(selectedClip.id, { filterIntensity: Number(e.target.value) })} className="w-full accent-cyan-500" />
                    <span className="text-[11px] text-zinc-500">{selectedClip.filterIntensity ?? 100}%</span>
                  </div>
                </>
              )}
              {activePanel === 'filtros' && !selectedClip && <p className="text-sm text-zinc-400 text-center py-4">Selecione um clipe na timeline primeiro.</p>}

              {/* Adesivos panel */}
              {activePanel === 'adesivos' && (
                <>
                  <div className="grid grid-cols-6 gap-2">
                    {STICKERS.map((emoji) => <button key={emoji} onClick={() => addSticker(emoji)} className="aspect-square rounded-xl bg-[#1b1c1f] border border-zinc-700 text-2xl flex items-center justify-center hover:border-amber-400 min-w-[44px] min-h-[44px]">{emoji}</button>)}
                  </div>
                  <div className="pt-2 border-t border-zinc-800">
                    <p className="text-[11px] text-zinc-400 font-semibold mb-2">Mais opções</p>
                    <div className="grid grid-cols-3 gap-2">{['Enquete', 'Contagem', 'Quiz', 'GIF', 'Mencionar', 'Marca'].map((item) => <button key={item} onClick={() => setIntegrationNotice(`${item} selecionado.`)} className="rounded-lg bg-zinc-800 border border-zinc-700 py-3 text-[11px] font-semibold text-zinc-300 hover:border-amber-400">{item}</button>)}</div>
                  </div>
                </>
              )}

              {/* Transição panel */}
              {activePanel === 'transicao' && (
                <div className="grid grid-cols-2 gap-2">
                  {TRANSITIONS.map((tr) => (
                    <button key={tr.id} onClick={() => { if (selectedClipId) updateClip(selectedClipId, { transition: tr.id }); setIntegrationNotice(`Transição ${tr.name} aplicada entre clipes.`); setActivePanel(null); }} className="rounded-xl bg-zinc-800 border border-zinc-700 py-4 text-sm font-semibold text-zinc-200 hover:border-[#fe2c55] flex items-center justify-center gap-2">
                      <Replace size={16} className="text-[#fe2c55]" /> {tr.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Proporção panel */}
              {activePanel === 'proporcao' && (
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: 'reel', label: '9:16' }, { id: 'yt', label: '16:9' }, { id: 'feed', label: '1:1' }, { id: 'feed', label: '4:3' }].map((r) => (
                    <button key={r.label} onClick={() => { setTemplate(r.id); setActivePanel(null); }} className="rounded-xl bg-zinc-800 border border-zinc-700 py-4 text-sm font-semibold text-zinc-200 hover:border-cyan-400">{r.label}</button>
                  ))}
                </div>
              )}

              {/* Modelos panel */}
              {activePanel === 'modelos' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map((t) => <button key={t.id} onClick={() => { setTemplate(t.id); setActivePanel(null); }} className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold ${template === t.id ? 'border-cyan-400 bg-cyan-400/10 text-white' : 'border-zinc-700 bg-zinc-800 text-zinc-400'}`}>{t.name}</button>)}
                  </div>
                  <button onClick={() => { setDraftsOpen(true); setActivePanel(null); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm font-semibold text-zinc-200 hover:border-cyan-400 mt-2"><FolderOpen size={16} /> Meus Rascunhos</button>
                </>
              )}

              {/* Velocidade panel */}
              {activePanel === 'velocidade' && selectedClip && (
                <div className="grid grid-cols-5 gap-2">
                  {[0.3, 0.5, 1, 2, 3].map((sp) => <button key={sp} onClick={() => { updateClip(selectedClip.id, { speed: sp }); setActivePanel(null); }} className={`rounded-xl border-2 py-4 text-sm font-bold ${selectedClip.speed === sp ? 'border-[#fe2c55] bg-[#fe2c55]/15 text-white' : 'border-zinc-700 bg-zinc-800 text-zinc-400'}`}>{sp}x</button>)}
                </div>
              )}

              {/* Volume panel */}
              {activePanel === 'volume' && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1"><span className="text-sm font-semibold text-zinc-200">Volume do vídeo</span><button onClick={() => setVideoMuted((m) => !m)} className="min-w-[44px] min-h-[44px] flex items-center justify-center">{videoMuted ? <VolumeX size={20} className="text-red-400" /> : <Volume2 size={20} className="text-zinc-300" />}</button></div>
                    <input type="range" min={0} max={100} value={videoMuted ? 0 : videoVolume} onChange={(e) => { setVideoVolume(Number(e.target.value)); setVideoMuted(false); }} className="w-full accent-[#fe2c55]" />
                    <span className="text-xs text-zinc-500">{videoMuted ? 'Mudo' : `${videoVolume}%`}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1"><span className="text-sm font-semibold text-zinc-200">Volume da música</span><button onClick={() => setMusicMuted((m) => !m)} className="min-w-[44px] min-h-[44px] flex items-center justify-center">{musicMuted ? <VolumeX size={20} className="text-red-400" /> : <Volume2 size={20} className="text-zinc-300" />}</button></div>
                    <input type="range" min={0} max={100} value={musicMuted ? 0 : musicVolume} onChange={(e) => { setMusicVolume(Number(e.target.value)); setMusicMuted(false); }} className="w-full accent-cyan-500" />
                    <span className="text-xs text-zinc-500">{musicMuted ? 'Mudo' : `${musicVolume}%`}</span>
                  </div>
                  {selectedClip && <button onClick={() => updateClip(selectedClip.id, { volume: 0 })} className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-200">Mudo neste clipe</button>}
                </div>
              )}

              {/* Camera panel */}
              {activePanel === 'camera' && (
                <>
                  {cameraError && (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300 flex items-start gap-2">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span>{cameraError}</span>
                        <button onClick={() => window.open('about:blank', '_blank')} className="mt-2 flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-[11px] font-bold text-white min-h-[36px]">
                          <Settings size={13} /> Ir para Configurações
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-4 py-2">
                    <button onClick={handleCameraRecord} className="w-20 h-20 rounded-full bg-[#fe2c55] border-4 border-white flex items-center justify-center hover:scale-105 transition min-w-[80px] min-h-[80px]"><span className="w-12 h-12 rounded-full bg-white" /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm font-semibold text-zinc-200 hover:border-cyan-400 min-h-[44px]"><Upload size={16} /> Enviar da galeria</button>
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-400 font-semibold mb-1.5">Tempo</p>
                    <div className="grid grid-cols-4 gap-1.5">{['15s', '60s', '3min', '10min'].map((d) => <button key={d} onClick={() => setCameraDuration(d)} className={`rounded-lg border py-2.5 text-xs font-semibold ${cameraDuration === d ? 'border-[#fe2c55] bg-[#fe2c55]/15 text-white' : 'border-zinc-700 text-zinc-400'}`}>{d}</button>)}</div>
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-400 font-semibold mb-1.5">Velocidade</p>
                    <div className="flex gap-1.5 overflow-x-auto">{['0.3x', '0.5x', '1x', '2x', '3x'].map((sp) => <button key={sp} onClick={() => setCameraSpeed(sp)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${cameraSpeed === sp ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>{sp}</button>)}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">{['Timer', 'Flash', 'Virar', 'Beleza', 'Filtros', 'Efeitos', 'Som', 'Texto'].map((item) => <button key={item} onClick={() => setIntegrationNotice(`${item} selecionado.`)} className="rounded-lg bg-zinc-800 py-2.5 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-700">{item}</button>)}</div>
                </>
              )}

              {/* Trending panel */}
              {activePanel === 'trending' && (
                <div className="space-y-2">
                  {TRENDING_AUDIO.map((track) => (
                    <div key={track.id} className="flex items-center gap-3 rounded-lg bg-[#1b1c1f] border border-zinc-700 px-3 py-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#fe2c55] to-cyan-500 flex items-center justify-center"><Music size={16} className="text-white" /></div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-zinc-200 truncate">{track.name}</p><p className="text-[11px] text-zinc-500">{track.duration}s</p></div>
                      <button className="w-9 h-9 rounded-full bg-zinc-800 text-white flex items-center justify-center min-w-[36px] min-h-[36px]"><Play size={13} /></button>
                      <button onClick={() => addTrendingAudio(track)} className="text-cyan-400 min-w-[36px] min-h-[36px] flex items-center justify-center"><Plus size={18} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* Editar panel */}
              {activePanel === 'editar' && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => selectedClipId && splitClip(selectedClipId)} className="rounded-xl bg-zinc-800 border border-zinc-700 py-4 text-sm font-semibold text-zinc-200 hover:border-cyan-400 flex items-center justify-center gap-2"><Split size={16} /> Dividir</button>
                  <button onClick={() => { setHistory((p) => [...p.slice(-19), clips]); setClips((prev) => { const t0 = prev.filter((c) => c.track === 0).sort((a, b) => a.start - b.start); if (t0.length < 2) return prev; const merged = { id: nextId(), type: t0[0].type, name: t0.map((c) => c.name).join(' + '), url: t0[0].url, duration: t0.reduce((s, c) => s + c.duration, 0), start: t0[0].start, track: 0, volume: t0[0].volume, speed: 1, filter: t0[0].filter }; return [...prev.filter((c) => c.track !== 0), merged]; }); }} className="rounded-xl bg-zinc-800 border border-zinc-700 py-4 text-sm font-semibold text-zinc-200 hover:border-cyan-400 flex items-center justify-center gap-2"><Merge size={16} /> Juntar</button>
                  <button onClick={() => selectedClipId && deleteClip(selectedClipId)} className="rounded-xl bg-zinc-800 border border-zinc-700 py-4 text-sm font-semibold text-red-400 hover:border-red-500 flex items-center justify-center gap-2"><Trash2 size={16} /> Excluir</button>
                  <button onClick={() => selectedClipId && duplicateClip(selectedClipId)} className="rounded-xl bg-zinc-800 border border-zinc-700 py-4 text-sm font-semibold text-zinc-200 hover:border-cyan-400 flex items-center justify-center gap-2"><Copy size={16} /> Duplicar</button>
                </div>
              )}

              {/* Simple notice panels */}
              {['sobreposicao', 'legendas', 'dublagem', 'ajustar', 'fundo', 'voz_ia', 'recortar', 'zoom', 'posicao'].includes(activePanel) && !clipPanelNeedsClip && (
                <>
                  {activePanel === 'legendas' && (
                    <>
                      <button onClick={() => { addTextClip(); setIntegrationNotice('Legenda automática gerada.'); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 text-white text-sm font-bold min-h-[48px]"><Subtitles size={16} /> Gerar legenda automática</button>
                      <div className="grid grid-cols-3 gap-2">{['Estilo 1', 'Estilo 2', 'Estilo 3', 'Baixo', 'Topo', 'Centro'].map((s) => <button key={s} className="rounded-lg bg-zinc-800 border border-zinc-700 py-3 text-[11px] font-semibold text-zinc-300 hover:border-cyan-400">{s}</button>)}</div>
                    </>
                  )}
                  {activePanel === 'dublagem' && (
                    <>
                      <button onClick={handleCameraRecord} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[#fe2c55] text-white text-sm font-bold min-h-[48px]"><Mic size={18} /> Gravar voz</button>
                      <div className="grid grid-cols-3 gap-2">{['Normal', 'Robô', 'Agudo', 'Grave', 'Eco', 'Mudo'].map((v) => <button key={v} onClick={() => setIntegrationNotice(`Voz ${v} aplicada.`)} className="rounded-lg bg-zinc-800 border border-zinc-700 py-3 text-[11px] font-semibold text-zinc-300 hover:border-[#fe2c55]">{v}</button>)}</div>
                    </>
                  )}
                  {activePanel === 'ajustar' && (
                    <div className="space-y-3">
                      {[{ label: 'Brilho', key: 'brilho' }, { label: 'Contraste', key: 'contraste' }, { label: 'Saturação', key: 'saturacao' }, { label: 'Nitidez', key: 'nitidez' }, { label: 'Temperatura', key: 'temperatura' }].map((adj) => (
                        <div key={adj.key}><div className="flex justify-between mb-1"><span className="text-xs font-semibold text-zinc-300">{adj.label}</span><span className="text-xs text-zinc-500">0</span></div><input type="range" min={-100} max={100} defaultValue={0} className="w-full accent-cyan-500" /></div>
                      ))}
                    </div>
                  )}
                  {activePanel === 'fundo' && (
                    <div className="grid grid-cols-3 gap-2">{['Cor', 'Borrado', 'Imagem', 'Gradiente', 'Preto', 'Branco'].map((bg) => <button key={bg} onClick={() => setIntegrationNotice(`Fundo ${bg} aplicado.`)} className="rounded-xl bg-zinc-800 border border-zinc-700 py-4 text-sm font-semibold text-zinc-200 hover:border-cyan-400">{bg}</button>)}</div>
                  )}
                  {activePanel === 'sobreposicao' && <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm font-semibold text-zinc-200 hover:border-cyan-400 min-h-[48px]"><Layers size={16} /> Adicionar sobreposição / PIP</button>}
                  {activePanel === 'voz_ia' && (
                    <>
                      <textarea placeholder="Digite o texto para a voz IA gerar áudio..." rows={3} className="w-full bg-[#1b1c1f] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500 resize-none" />
                      <div className="grid grid-cols-3 gap-2">{['Feminina', 'Masculina', 'Neutra', 'Jovem', 'Madura', 'Infantil'].map((v) => <button key={v} onClick={() => setIntegrationNotice(`Voz IA ${v} selecionada.`)} className="rounded-lg bg-zinc-800 border border-zinc-700 py-3 text-[11px] font-semibold text-zinc-300 hover:border-cyan-400">{v}</button>)}</div>
                      <button onClick={() => setIntegrationNotice('Voz IA gerada e adicionada à timeline.')} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 text-white text-sm font-bold min-h-[48px]"><Sparkles size={16} /> Gerar Voz IA</button>
                    </>
                  )}
                  {activePanel === 'zoom' && selectedClip && (
                    <div><p className="text-xs font-semibold text-zinc-300 mb-2">Zoom do clipe</p><input type="range" min={50} max={300} value={previewScale * 100} onChange={(e) => setPreviewScale(Number(e.target.value) / 100)} className="w-full accent-cyan-500" /><span className="text-xs text-zinc-500">{Math.round(previewScale * 100)}%</span>
                      <button onClick={() => { setPreviewScale(1); setPreviewX(0); setPreviewY(0); }} className="w-full mt-3 rounded-lg bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-200">Redefinir</button>
                    </div>
                  )}
                  {activePanel === 'posicao' && selectedClip && (
                    <div className="space-y-3">
                      <div><p className="text-xs font-semibold text-zinc-300 mb-1">Posição X</p><input type="range" min={-200} max={200} value={previewX} onChange={(e) => setPreviewX(Number(e.target.value))} className="w-full accent-cyan-500" /></div>
                      <div><p className="text-xs font-semibold text-zinc-300 mb-1">Posição Y</p><input type="range" min={-200} max={200} value={previewY} onChange={(e) => setPreviewY(Number(e.target.value))} className="w-full accent-cyan-500" /></div>
                      <button onClick={() => { setPreviewX(0); setPreviewY(0); }} className="w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-semibold text-zinc-200">Centralizar</button>
                    </div>
                  )}
                  {activePanel === 'recortar' && selectedClip && <p className="text-sm text-zinc-400 text-center py-4">Arraste as bordas do clipe na timeline para recortar.</p>}
                </>
              )}

              {integrationNotice && <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">{integrationNotice}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Publish modal */}
      {publishOpen && (
        <div className="fixed inset-0 z-[86] flex items-center justify-center bg-black/70 px-4" onClick={() => setPublishOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#17181b] p-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><div><p className="text-lg font-bold text-white">Publicar criação</p><p className="text-xs text-zinc-400">Escolha a rede e o formato.</p></div><button onClick={() => setPublishOpen(false)} className="text-zinc-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center"><X size={20} /></button></div>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {(['tiktok', 'instagram', 'youtube', 'kwai', 'facebook', 'other'] as SocialAccount['platform'][]).map((p) => <button key={p} onClick={() => { setPublishPlatform(p); setPublishFormat(null); }} className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold capitalize ${publishPlatform === p ? 'border-[#fe2c55] bg-[#fe2c55]/15 text-white' : 'border-zinc-700 bg-[#1b1c1f] text-zinc-300'}`}>{p === 'other' ? 'Outra rede' : p}</button>)}
            </div>
            {publishPlatform && (
              <div className="space-y-3 mb-4">
                <div className="flex flex-wrap gap-2">
                  {(publishPlatform === 'instagram' ? ['Reels', 'Feed', 'Story'] : publishPlatform === 'youtube' ? ['Vídeo', 'Shorts'] : publishPlatform === 'facebook' ? ['Feed', 'Story', 'Reels'] : publishPlatform === 'kwai' ? ['Vídeo', 'Story'] : ['Publicação', 'Vídeo']).map((format) => <button key={format} onClick={() => setPublishFormat(format)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${publishFormat === format ? 'border-cyan-400 bg-cyan-400/15 text-cyan-200' : 'border-zinc-700 text-zinc-300'}`}>{format}</button>)}
                </div>
                <textarea value={publishCaption} onChange={(e) => setPublishCaption(e.target.value)} placeholder="Descrição / legenda com #hashtags e @marcações" rows={3} className="w-full rounded-lg border border-zinc-700 bg-[#1b1c1f] px-3 py-2.5 text-sm text-white outline-none resize-none" />
                <input value={publishCover} onChange={(e) => setPublishCover(e.target.value)} placeholder="Capa: escolher quadro ou texto" className="w-full rounded-lg border border-zinc-700 bg-[#1b1c1f] px-3 py-2.5 text-sm text-white outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[11px] text-zinc-400 font-semibold block mb-1">Quem pode ver</label><select value={publishPrivacy} onChange={(e) => setPublishPrivacy(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-[#1b1c1f] px-2 py-2.5 text-sm text-white"><option>Todos</option><option>Amigos</option><option>Só eu</option></select></div>
                  <div><label className="text-[11px] text-zinc-400 font-semibold block mb-1">Qualidade</label><select value={publishQuality} onChange={(e) => setPublishQuality(e.target.value)} className="w-full rounded-lg border border-zinc-700 bg-[#1b1c1f] px-2 py-2.5 text-sm text-white"><option>720p</option><option>1080p</option><option>4K</option><option>HD</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                  <label className="flex items-center gap-2 py-2"><input type="checkbox" defaultChecked className="accent-[#fe2c55] w-4 h-4" />Comentários</label>
                  <label className="flex items-center gap-2 py-2"><input type="checkbox" className="accent-[#fe2c55] w-4 h-4" />Dueto</label>
                  <label className="flex items-center gap-2 py-2"><input type="checkbox" className="accent-[#fe2c55] w-4 h-4" />Costurar</label>
                  <label className="flex items-center gap-2 py-2"><input type="checkbox" className="accent-[#fe2c55] w-4 h-4" />Sticker</label>
                  <label className="flex items-center gap-2 py-2"><input type="checkbox" className="accent-[#fe2c55] w-4 h-4" />Download</label>
                  <label className="flex items-center gap-2 py-2"><input type="checkbox" className="accent-[#fe2c55] w-4 h-4" />Marca d'água</label>
                </div>
                <div className="flex items-center gap-2"><MapPin size={15} className="text-zinc-500" /><input placeholder="Localização" className="flex-1 rounded-lg border border-zinc-700 bg-[#1b1c1f] px-3 py-2 text-sm text-white outline-none" /></div>
                <div className="flex items-center gap-2"><ShoppingBag size={15} className="text-zinc-500" /><input placeholder="Marcar produtos / link / loja" className="flex-1 rounded-lg border border-zinc-700 bg-[#1b1c1f] px-3 py-2 text-sm text-white outline-none" /></div>
                <div className="flex items-center gap-2"><Calendar size={15} className="text-zinc-500" /><input type="datetime-local" value={publishSchedule} onChange={(e) => setPublishSchedule(e.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-[#1b1c1f] px-3 py-2 text-sm text-white outline-none" /></div>
                {!accounts.some((a) => a.platform === publishPlatform && a.connected) && <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">Para publicar em {publishPlatform}, conecte a conta pelo login oficial. O K-EDITOR não coleta nem armazena sua senha.</div>}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => { void saveDraft(); setPublishOpen(false); }} className="rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-sm font-bold text-zinc-200 min-h-[48px]">Salvar rascunho</button>
              <button onClick={publish} disabled={!publishPlatform || !publishFormat} className="rounded-xl bg-[#fe2c55] py-3 text-sm font-bold text-white disabled:opacity-40 min-h-[48px]">Publicar</button>
            </div>
            {saveStatus && <p className="mt-2 text-xs text-zinc-300">{saveStatus}</p>}
            {publishStatus && <p className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">{publishStatus}</p>}
          </div>
        </div>
      )}

      {/* Account modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-[85] bg-black/40 backdrop-blur-sm flex items-center justify-center px-4" onClick={() => setShowAccountModal(false)}>
          <div className="bg-[#17181b] border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-zinc-100 font-bold text-base mb-1">Conectar rede social</h3>
            <p className="mb-4 text-xs text-zinc-400">A senha nunca é armazenada pelo K-EDITOR. A conexão real deve usar OAuth oficial da rede.</p>
            <div className="space-y-3">
              <div><label className="text-[11px] text-zinc-400 font-semibold block mb-1">Plataforma</label><select value={newAccount.platform} onChange={(e) => setNewAccount((p) => ({ ...p, platform: e.target.value as SocialAccount['platform'] }))} className="w-full bg-[#1b1c1f] border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-cyan-500"><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="youtube">YouTube</option><option value="kwai">Kwai</option><option value="facebook">Facebook</option><option value="other">Outra</option></select></div>
              <div><label className="text-[11px] text-zinc-400 font-semibold block mb-1">Usuário</label><input value={newAccount.username} onChange={(e) => setNewAccount((p) => ({ ...p, username: e.target.value }))} placeholder="@usuario" className="w-full bg-[#1b1c1f] border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-cyan-500" /></div>
              <button onClick={addAccount} className="w-full py-3 rounded-xl bg-[#fe2c55] text-white text-sm font-bold hover:bg-[#ff456b] transition min-h-[48px]"><ShieldCheck size={14} className="mr-2 inline" /> Registrar conexão OAuth</button>
              {integrationNotice && <p className="text-xs text-amber-300">{integrationNotice}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Exit prompt */}
      {exitPromptOpen && (
        <div className="fixed inset-0 z-[87] flex items-center justify-center bg-black/70 px-4" onClick={() => setExitPromptOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-[#17181b] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Sair do editor?</h3>
            <p className="text-sm text-zinc-400 mb-4">Suas alterações ainda não foram salvas.</p>
            <div className="space-y-2">
              <button onClick={async () => { await saveDraft(); setExitPromptOpen(false); onExit(); }} className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-bold text-white min-h-[48px]">Salvar rascunho e sair</button>
              <button onClick={() => { setExitPromptOpen(false); onExit(); }} className="w-full rounded-xl bg-zinc-800 border border-zinc-700 py-3 text-sm font-bold text-red-400 min-h-[48px]">Descartar e sair</button>
              <button onClick={() => setExitPromptOpen(false)} className="w-full rounded-xl bg-zinc-800 border border-zinc-700 py-3 text-sm font-bold text-zinc-200 min-h-[48px]">Continuar editando</button>
            </div>
          </div>
        </div>
      )}

      {/* Drafts list */}
      {draftsOpen && (
        <div className="fixed inset-0 z-[87] flex items-center justify-center bg-black/70 px-4" onClick={() => setDraftsOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#17181b] p-5 shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-white">Meus Projetos / Rascunhos</h3><button onClick={() => setDraftsOpen(false)} className="text-zinc-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center"><X size={20} /></button></div>
            {drafts.length === 0 && <p className="text-sm text-zinc-500 text-center py-8">Nenhum rascunho salvo ainda.</p>}
            <div className="space-y-2">
              {drafts.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl bg-[#1b1c1f] border border-zinc-700 p-3">
                  <div className="w-14 h-14 rounded-lg bg-zinc-800 overflow-hidden shrink-0">{d.cover && <img src={d.cover} alt="" className="w-full h-full object-cover" />}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-zinc-200 truncate">{d.name}</p><p className="text-[11px] text-zinc-500">{d.duration.toFixed(0)}s · {d.date}</p></div>
                  <button onClick={() => { setClips(d.clips); setHasUnsavedChanges(false); setDraftsOpen(false); }} className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-white min-h-[36px]">Abrir</button>
                  <button onClick={() => { setDrafts((prev) => { const updated = prev.filter((x) => x.id !== d.id); localStorage.setItem('k-editor-drafts', JSON.stringify(updated)); return updated; }); }} className="text-zinc-500 hover:text-red-500 min-w-[36px] min-h-[36px] flex items-center justify-center"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* K-AI floating button */}
      <button onClick={() => setAiOpen(true)} aria-label="Abrir K-AI" className="fixed bottom-20 right-3 z-[83] flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-[#fe2c55] px-4 py-2.5 text-white shadow-lg hover:scale-105 transition min-h-[44px]">
        <Sparkles size={18} /><span className="text-xs font-bold">K-AI</span>
      </button>

      {/* K-AI panel */}
      {aiOpen && (
        <div className="fixed inset-0 z-[88] flex items-end" onClick={() => setAiOpen(false)}>
          <div className="absolute inset-0 bg-black/50" style={{ animation: 'fadeIn 0.2s ease-out' }} />
          <div className="relative w-full rounded-t-3xl border-t border-zinc-700 bg-[#17181b] pb-6 max-h-[60vh] overflow-y-auto" style={{ animation: 'slideUp 0.3s ease-out' }} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-800 bg-[#17181b] px-4 py-3 z-10">
              <div className="flex items-center gap-2"><Sparkles size={18} className="text-cyan-400" /><h3 className="text-base font-bold text-white">K-AI no Editor</h3></div>
              <button onClick={() => setAiOpen(false)} className="text-zinc-400 hover:text-white min-w-[40px] min-h-[40px] flex items-center justify-center"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-zinc-400">Peça ao K-AI para editar o projeto. Ele usa Pollinations + Gemini + GROQ e executa direto na timeline.</p>
              <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ex: cria narração, faz autocut, adiciona legenda, aplica filtro, adiciona trilha trending..." rows={3} className="w-full bg-[#1b1c1f] border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-cyan-500 resize-none" />
              <button onClick={handleAiAction} disabled={aiBusy || !aiPrompt.trim()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 text-white text-sm font-bold hover:bg-cyan-600 disabled:opacity-50 transition min-h-[48px]">
                <Sparkles size={15} /> {aiBusy ? 'Executando...' : 'Executar no Projeto'}
              </button>
              <div className="flex flex-wrap gap-1.5">
                {['Criar narração', 'Fazer autocut IA', 'Adicionar legenda', 'Aplicar filtro', 'Adicionar trilha', 'Adicionar sticker', 'Transição entre clipes', 'Remover fundo'].map((s) => (
                  <button key={s} onClick={() => setAiPrompt(s)} className="rounded-lg bg-[#1b1c1f] border border-zinc-700 px-2.5 py-2 text-[11px] text-zinc-300 hover:border-cyan-400 min-h-[36px]">{s}</button>
                ))}
              </div>
              {publishStatus && <p className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">{publishStatus}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Offline bar */}
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0 z-[89] bg-red-600 text-white text-center py-2 text-xs font-bold">Sem conexão. Verifique a internet.</div>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[89] flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg">
          <AlertCircle size={16} />
          <span>{uploadError}</span>
          <button onClick={() => fileInputRef.current?.click()} className="ml-2 rounded-lg bg-white/20 px-2 py-1 text-[11px] min-h-[36px] flex items-center"><RefreshCw size={12} className="mr-1" /> Tentar de novo</button>
        </div>
      )}
    </div>
  );
}
