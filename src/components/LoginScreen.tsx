import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Loader2, Search, X } from 'lucide-react';
import {
  buildFolderName,
  upsertCadastro,
  signIn,
  signUpAccount,
  type CadastroInput,
} from '@/lib/korvilAuth';

interface LoginScreenProps {
  onClose: () => void;
  onLoggedIn: () => void;
}

const FLOATING_WORDS = [
  'FORÇA',
  'PROSPERIDADE',
  'SABEDORIA',
  'VITÓRIA',
  'FÉ',
  'DETERMINAÇÃO',
  'FOCO',
  'CONQUISTA',
];

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parts = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.0006,
      vy: (Math.random() - 0.5) * 0.0006,
      a: Math.random() * 0.5 + 0.15,
    }));

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

function FloatingWords() {
  const [words] = useState(() =>
    FLOATING_WORDS.map((word, i) => ({
      word,
      top: `${(i * 97) % 88 + 4}%`,
      left: `${(i * 53) % 78 + 6}%`,
      duration: `${6 + (i % 4) * 2}s`,
      delay: `${(i % 5) * 0.8}s`,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {words.map((w) => (
        <span
          key={w.word}
          className="absolute text-[10px] sm:text-xs tracking-[0.3em] text-cyan-300/25 whitespace-nowrap animate-pulse"
          style={{
            top: w.top,
            left: w.left,
            animationDuration: w.duration,
            animationDelay: w.delay,
          }}
        >
          {w.word}
        </span>
      ))}
    </div>
  );
}

function maskCpf(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d{0,2})/, '($1');
  if (d.length <= 6) return d.replace(/^(\d{2})(\d+)/, '($1) $2');
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

function maskCep(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
}

function calcAge(dateStr: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const birth = new Date(dateStr + 'T00:00:00');
  if (isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 && age < 130 ? age : null;
}

const inputCls =
  'w-full bg-black/60 border border-cyan-500/25 focus:border-cyan-400 rounded-lg px-3.5 py-2.5 text-sm text-cyan-100 placeholder:text-cyan-200/30 outline-none transition-colors';

export default function LoginScreen({ onClose, onLoggedIn }: LoginScreenProps) {
  const [tab, setTab] = useState<'entrar' | 'novo'>('entrar');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);

  // entrar
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // novo usuário
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cep, setCep] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const age = calcAge(birthDate);

  const buscarCep = async () => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setError('CEP incompleto: informe os 8 números.');
      return;
    }
    setError('');
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.erro) {
        setError('CEP não encontrado.');
        return;
      }
      setStreet(data.logradouro || '');
      setNeighborhood(data.bairro || '');
    } catch {
      setError('Não foi possível buscar o CEP agora.');
    } finally {
      setCepLoading(false);
    }
  };

  const validateCadastro = (): string => {
    if (fullName.trim().split(/\s+/).length < 2) return 'Informe seu nome completo.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'E-mail inválido.';
    if (cpf.replace(/\D/g, '').length !== 11) return 'CPF incompleto.';
    if (age === null) return 'Data de nascimento inválida.';
    if (whatsapp.replace(/\D/g, '').length < 10) return 'WhatsApp incompleto.';
    if (cep.replace(/\D/g, '').length !== 8) return 'CEP incompleto.';
    if (!streetNumber.trim()) return 'Informe o número da casa.';
    if (!neighborhood.trim()) return 'Informe o bairro.';
    if (!street.trim()) return 'Informe a rua.';
    if (pass.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
    if (pass !== pass2) return 'As senhas não são iguais.';
    return '';
  };

  const handleCadastro = async () => {
    const v = validateCadastro();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setBusy(true);
    try {
      const { data, error: upErr } = await signUpAccount(email.trim(), pass);
      if (upErr) {
        const msg = upErr.message.includes('already registered')
          ? 'Este e-mail já tem uma conta. Use a aba ENTRAR.'
          : 'Não foi possível criar a conta. Tente novamente.';
        setError(msg);
        return;
      }
      let userId = data.user?.id;

      // Alguns navegadores não trazem a sessão no cadastro: tenta reconectar.
      if (!userId) {
        const retry = await signIn(email.trim(), pass);
        userId = retry.data.user?.id;
      }
      if (!userId) {
        setError('Conta criada, mas a sessão não chegou. Entre na aba ENTRAR.');
        return;
      }
      const input: CadastroInput = {
        folder: buildFolderName(fullName),
        full_name: fullName.trim(),
        nickname: nickname.trim() || null,
        email: email.trim(),
        cpf,
        birth_date: birthDate,
        age: age ?? 0,
        whatsapp,
        cep,
        street_number: streetNumber.trim(),
        neighborhood: neighborhood.trim(),
        street: street.trim(),
        social_links: {},
      };
      const { error: insErr } = await upsertCadastro(userId, input);
      if (insErr) {
        setError('Conta criada, mas os dados do cadastro não foram salvos. Tente entrar.');
        return;
      }
      setOkMsg('Cadastro criado! Abrindo o Korvil...');
      setTimeout(onLoggedIn, 900);
    } catch {
      setError('Falha de conexão. Verifique sua internet.');
    } finally {
      setBusy(false);
    }
  };

  const handleEntrar = async () => {
    if (!loginEmail.trim() || !loginPass) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const { error: inErr } = await signIn(loginEmail.trim(), loginPass);
      if (inErr) {
        setError('E-mail ou senha incorretos.');
        return;
      }
      onLoggedIn();
    } catch {
      setError('Falha de conexão. Verifique sua internet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black overflow-y-auto">
      <ParticleCanvas />
      <FloatingWords />

      <div className="relative min-h-full flex flex-col items-center justify-center px-4 py-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            {logoFailed ? (
              <div className="w-24 h-24 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                <span className="text-3xl font-bold text-cyan-300">K</span>
              </div>
            ) : (
              <img
                src="/icons/icon-192.png?v=20261019"
                alt="KORVIL"
                onError={() => setLogoFailed(true)}
                className="w-28 h-28 object-contain drop-shadow-[0_0_18px_rgba(0,255,255,0.45)]"
              />
            )}
            <h1 className="mt-3 text-2xl font-bold tracking-[0.35em] text-cyan-300">KORVIL</h1>
          </div>

          <div className="relative bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_0_40px_rgba(0,255,255,0.08)]">
            <div className="grid grid-cols-2 gap-2 mb-5 bg-black/60 border border-cyan-500/20 rounded-xl p-1">
              {(['entrar', 'novo'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setError('');
                    setOkMsg('');
                  }}
                  className={`py-2 text-xs sm:text-sm font-semibold tracking-wider rounded-lg transition-all ${
                    tab === t
                      ? 'bg-cyan-400 text-black shadow-[0_0_16px_rgba(0,255,255,0.4)]'
                      : 'text-cyan-300/70 hover:text-cyan-200'
                  }`}
                >
                  {t === 'entrar' ? 'ENTRAR' : 'NOVO USUÁRIO'}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            {okMsg && (
              <div className="mb-4 text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-3 py-2">
                {okMsg}
              </div>
            )}

            {tab === 'entrar' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">E-MAIL</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={inputCls}
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">SENHA</label>
                  <div className="relative">
                    <input
                      type={showLoginPass ? 'text' : 'password'}
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className={`${inputCls} pr-11`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300/60 hover:text-cyan-300"
                      aria-label="Mostrar senha"
                    >
                      {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleEntrar}
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold text-sm tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(0,255,255,0.35)]"
                >
                  {busy ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'ENTRAR'}
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">NOME COMPLETO</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="João da Silva Moreira" />
                </div>
                <div>
                  <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">
                    COMO QUER SER CHAMADO <span className="text-cyan-200/40 normal-case tracking-normal">(opcional)</span>
                  </label>
                  <input value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputCls} placeholder="Ex.: Jo, Johnny, Capitão..." maxLength={30} />
                </div>
                <div>
                  <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">E-MAIL</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="seu@email.com" autoComplete="email" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">CPF</label>
                    <input value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} className={inputCls} placeholder="000.000.000-00" inputMode="numeric" />
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">
                      NASCIMENTO {age !== null && <span className="text-cyan-400">({age} anos)</span>}
                    </label>
                    <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">WHATSAPP</label>
                  <input value={whatsapp} onChange={(e) => setWhatsapp(maskPhone(e.target.value))} className={inputCls} placeholder="(00) 00000-0000" inputMode="tel" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">CEP</label>
                    <div className="relative">
                      <input value={cep} onChange={(e) => setCep(maskCep(e.target.value))} className={`${inputCls} pr-11`} placeholder="00000-000" inputMode="numeric" />
                      <button
                        type="button"
                        onClick={buscarCep}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300/70 hover:text-cyan-300"
                        aria-label="Buscar CEP"
                      >
                        {cepLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">Nº DA CASA</label>
                    <input value={streetNumber} onChange={(e) => setStreetNumber(e.target.value)} className={inputCls} placeholder="123" inputMode="numeric" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">BAIRRO</label>
                    <input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className={inputCls} placeholder="Bairro" />
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">RUA</label>
                    <input value={street} onChange={(e) => setStreet(e.target.value)} className={inputCls} placeholder="Rua" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">SENHA</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        className={`${inputCls} pr-11`}
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300/60 hover:text-cyan-300"
                        aria-label="Mostrar senha"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">REPETIR SENHA</label>
                    <div className="relative">
                      <input
                        type={showPass2 ? 'text' : 'password'}
                        value={pass2}
                        onChange={(e) => setPass2(e.target.value)}
                        className={`${inputCls} pr-11`}
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass2((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300/60 hover:text-cyan-300"
                        aria-label="Mostrar senha"
                      >
                        {showPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCadastro}
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold text-sm tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(0,255,255,0.35)]"
                >
                  {busy ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'CONFIRMAR'}
                </button>
                <p className="text-[10px] text-center text-cyan-200/40">
                  Sua senha é protegida com criptografia no servidor — nunca é salva nos arquivos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
