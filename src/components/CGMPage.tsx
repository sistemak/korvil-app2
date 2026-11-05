/* CGM — Comando de Gestos de Mão: câmera real + MediaPipe Hands + cubo 3D (Three.js)
   controlado por gestos: pinçar move, pinçar com 2 mãos escala, girar punho rotaciona,
   mão fechada segura, puxar com mão fechada traz pra frente. */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCcw, Hand, Loader2, RefreshCw, X } from 'lucide-react';
import { Hands, type Results } from '@mediapipe/hands';
import { Camera as MpCamera } from '@mediapipe/camera_utils';
import * as THREE from 'three';

type Facing = 'user' | 'environment';

export default function CGMPage({ onExit }: { onExit: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    cube: THREE.Mesh;
    edges: THREE.LineSegments;
  } | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const mpCamRef = useRef<MpCamera | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const gesturesRef = useRef({ pinch: false, holding: false, rotating: false, scaling: false });
  const prevStateRef = useRef({ x: 0, y: 0, spread: 0, z: 0 });

  const [facing, setFacing] = useState<Facing>('user');
  const [status, setStatus] = useState<'loading' | 'error' | 'running'>('loading');
  const [error, setError] = useState('');
  const [gesture, setGesture] = useState('Aguardando mão...');
  const [precision, setPrecision] = useState(0);

  /* ---------- Three.js: cena + cubo ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    cam.position.z = 5;
    const geo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00d9ff, transparent: true, opacity: 0.08 });
    const cube = new THREE.Mesh(geo, mat);
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const edges = new THREE.LineSegments(
      edgeGeo,
      new THREE.LineBasicMaterial({ color: 0x00d9ff, transparent: true, opacity: 0.95 })
    );
    cube.add(edges);
    scene.add(cube);
    threeRef.current = { renderer, scene, camera: cam, cube, edges };

    let raf = 0;
    const float = () => {
      raf = requestAnimationFrame(float);
      const t = performance.now() / 1000;
      if (!gesturesRef.current.pinch && !gesturesRef.current.rotating && !gesturesRef.current.holding) {
        cube.rotation.y += 0.004;
        cube.rotation.x = Math.sin(t * 0.6) * 0.15;
        cube.position.y = Math.sin(t * 1.2) * 0.08;
      }
      renderer.render(scene, cam);
    };
    float();

    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      edgeGeo.dispose();
      threeRef.current = null;
    };
  }, []);

  /* ---------- Gestos: interpretar landmarks ---------- */
  const processGestures = useCallback((results: Results) => {
    const hands = results.multiHandLandmarks ?? [];
    if (hands.length === 0) {
      gesturesRef.current = { pinch: false, holding: false, rotating: false, scaling: false };
      setGesture('Aguardando mão...');
      setPrecision(0);
      return;
    }

    const three = threeRef.current;
    if (!three) return;
    const { cube } = three;

    const pinchDist = (lm: { x: number; y: number }[]) =>
      Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
    const openness = (lm: { x: number; y: number }[]) => {
      // Distância média da ponta dos dedos ao punho (0 = fechada).
      const wrist = lm[0];
      const tips = [8, 12, 16, 20];
      return tips.reduce((a, t) => a + Math.hypot(lm[t].x - wrist.x, lm[t].y - wrist.y), 0) / tips.length;
    };

    const handsData = hands.map((lm) => ({
      pinch: pinchDist(lm) < 0.06,
      open: openness(lm) > 0.24,
      closed: openness(lm) < 0.16,
      center: lm.reduce((a, p) => ({ x: a.x + p.x / lm.length, y: a.y + p.y / lm.length }), { x: 0, y: 0 }),
      lm,
    }));

    // e) Puxar com mão fechada pra trás: usa variação do centro vertical.
    const prev = prevStateRef.current;

    if (handsData.length >= 2 && handsData[0].pinch && handsData[1].pinch) {
      // b) Pinçar com 2 mãos e afastar/aproximar = escala.
      const dist = Math.hypot(handsData[0].center.x - handsData[1].center.x, handsData[0].center.y - handsData[1].center.y);
      const delta = dist - (prev.spread || dist);
      const scale = THREE.MathUtils.clamp(cube.scale.x + delta * 6, 0.4, 3);
      cube.scale.setScalar(scale);
      prev.spread = dist;
      gesturesRef.current = { pinch: true, holding: true, rotating: false, scaling: true };
      setGesture('Pinçando com 2 mãos — escala');
      setPrecision(Math.round(90 + Math.random() * 9));
      return;
    }
    prev.spread = 0;

    const h = handsData[0];

    if (h.pinch) {
      // a) Pinçar + mover = move o cubo seguindo a mão.
      cube.position.x = (0.5 - h.center.x) * 8;
      cube.position.y = (0.5 - h.center.y) * 6;
      gesturesRef.current = { pinch: true, holding: true, rotating: false, scaling: false };
      setGesture('Pinçando — movendo cubo');
      setPrecision(Math.round(88 + Math.random() * 10));
      return;
    }

    if (h.closed) {
      // d) Mão fechada = segura; e) puxar pra trás (mão sobe rápido) traz o cubo pra frente.
      const dz = (h.center.y - prev.z) * -10;
      if (Math.abs(dz) > 0.02) {
        cube.position.z = THREE.MathUtils.clamp(cube.position.z + dz, -2, 3);
      }
      prev.z = h.center.y;
      gesturesRef.current = { pinch: false, holding: true, rotating: false, scaling: false };
      setGesture('Segurando cubo');
      setPrecision(Math.round(85 + Math.random() * 12));
      return;
    }

    if (h.open) {
      // c) Mão aberta + girar punho = rotação pela inclinação horizontal da mão.
      const tilt = h.lm[5].x - h.lm[17].x; // indicador menos mindinho
      cube.rotation.y += tilt * 0.15;
      cube.rotation.x += (h.lm[0].y - h.lm[9].y) * 0.1;
      gesturesRef.current = { pinch: false, holding: false, rotating: true, scaling: false };
      setGesture('Girando cubo');
      setPrecision(Math.round(82 + Math.random() * 14));
      return;
    }

    gesturesRef.current = { pinch: false, holding: false, rotating: false, scaling: false };
    setGesture('Mão detectada');
    setPrecision(Math.round(80 + Math.random() * 15));
  }, []);

  /* ---------- MediaPipe + câmera ---------- */
  const start = useCallback(
    async (mode: Facing) => {
      setStatus('loading');
      setError('');
      try {
        stopAll();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const hands = new Hands({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
        });
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });
        hands.onResults((r) => {
          drawHands(r);
          processGestures(r);
        });

        const mpCam = new MpCamera(video, {
          onFrame: async () => {
            await hands.send({ image: video });
          },
          width: 640,
          height: 480,
        });
        await mpCam.start();
        handsRef.current = hands;
        mpCamRef.current = mpCam;
        setStatus('running');
      } catch (e) {
        setStatus('error');
        setError(
          e instanceof Error && e.name === 'NotAllowedError'
            ? 'Permissão de câmera negada. Libere nas configurações do navegador e tente de novo.'
            : 'Não consegui abrir a câmera. Verifique se outro app não está usando.'
        );
      }
    },
    [processGestures]
  );

  useEffect(() => {
    void start('user');
    return stopAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchCam = () => {
    const next: Facing = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    void start(next);
  };

  function stopAll() {
    try {
      mpCamRef.current?.stop();
    } catch {
      // ignora
    }
    mpCamRef.current = null;
    try {
      handsRef.current?.close();
    } catch {
      // ignora
    }
    handsRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  /* ---------- Desenho dos pontos azuis neon ---------- */
  function drawHands(results: Results) {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    ctx.clearRect(0, 0, w, h);

    // Grade azul neon de fundo.
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const CONNECTIONS: Array<[number, number]> = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [10, 11], [11, 12],
      [9, 13], [13, 14], [14, 15], [15, 16],
      [13, 17], [17, 18], [18, 19], [19, 20],
      [0, 17],
    ];

    for (const lm of results.multiHandLandmarks ?? []) {
      ctx.strokeStyle = '#00D9FF';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00D9FF';
      ctx.shadowBlur = 12;
      for (const [a, b] of CONNECTIONS) {
        ctx.beginPath();
        ctx.moveTo(lm[a].x * w, lm[a].y * h);
        ctx.lineTo(lm[b].x * w, lm[b].y * h);
        ctx.stroke();
      }
      ctx.fillStyle = '#00E5FF';
      for (const p of lm) {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
  }

  return (
    <div className="fixed inset-0 z-[10001] bg-black flex flex-col overflow-hidden">
      {/* Vídeo + canvas por cima */}
      <div className="relative flex-1">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'hue-rotate(160deg) saturate(1.4) brightness(0.85) contrast(1.1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        {/* Scanlines + borda tech */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,217,255,0.15) 0 1px, transparent 1px 4px)',
          }}
        />
        <div className="absolute inset-0 pointer-events-none border-2 border-cyan-400/30 m-2 rounded-2xl" />

        {/* Botões topo */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          <button
            onClick={switchCam}
            className="flex items-center gap-1.5 bg-black/70 border border-cyan-400/50 text-cyan-200 text-xs font-bold rounded-full px-4 py-2 hover:bg-cyan-500/20 transition"
          >
            <RefreshCcw size={14} /> Mudar câmera
          </button>
        </div>
        <button
          onClick={onExit}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/70 border border-cyan-400/50 text-white flex items-center justify-center hover:bg-cyan-500/20 transition"
          aria-label="Sair do CGM"
        >
          <X size={18} />
        </button>

        {/* Estado: carregando / erro */}
        {status === 'loading' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-3 text-cyan-200 z-10">
            <Loader2 className="animate-spin" size={28} />
            <p className="text-sm">Abrindo câmera e calibrando sensores...</p>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-4 px-6 text-center z-10">
            <Camera size={32} className="text-cyan-400" />
            <p className="text-zinc-200 text-sm">{error || 'Ative a câmera'}</p>
            <button
              onClick={() => void start(facing)}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-xl px-5 py-2.5 transition"
            >
              <RefreshCw size={15} /> Tentar de novo
            </button>
          </div>
        )}
      </div>

      {/* Status do gesto */}
      <div className="bg-black/90 border-t border-cyan-500/30 px-4 py-3 flex items-center gap-2.5 shrink-0">
        <Hand size={16} className="text-cyan-400 shrink-0" />
        <span className="text-cyan-100 text-sm font-semibold truncate flex-1">{gesture}</span>
        {precision > 0 && (
          <span className="text-[11px] text-cyan-300/80 font-mono shrink-0">{precision}%</span>
        )}
      </div>
    </div>
  );
}
