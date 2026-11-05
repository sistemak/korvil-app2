import { useEffect, useRef, useState } from 'react';
import { Camera, ChevronDown, ChevronUp, Loader2, Trash2, X } from 'lucide-react';
import {
  signOut,
  updateMyProfile,
  uploadAvatar,
  type KorvilProfile,
  type SocialLinksMap,
} from '@/lib/korvilAuth';

interface ProfileScreenProps {
  profile: KorvilProfile;
  onClose: () => void;
  onSaved: (p: KorvilProfile) => void;
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

const SOCIAL_NETWORKS = [
  'Instagram',
  'TikTok',
  'Facebook',
  'YouTube',
  'WhatsApp Canal',
  'X (Twitter)',
  'LinkedIn',
  'Telegram',
  'Threads',
  'Twitch',
  'Kwai',
  'Pinterest',
  'Discord',
  'Spotify',
  'Site / Outro',
];

export default function ProfileScreen({ profile, onClose, onSaved }: ProfileScreenProps) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [nickname, setNickname] = useState(profile.nickname ?? '');
  const [cpf, setCpf] = useState(profile.cpf);
  const [birthDate, setBirthDate] = useState(profile.birth_date);
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp);
  const [cep, setCep] = useState(profile.cep);
  const [streetNumber, setStreetNumber] = useState(profile.street_number);
  const [neighborhood, setNeighborhood] = useState(profile.neighborhood);
  const [street, setStreet] = useState(profile.street);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [socials, setSocials] = useState<SocialLinksMap>(profile.social_links ?? {});
  const [openSocial, setOpenSocial] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const age = calcAge(birthDate);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const dirty =
    fullName !== profile.full_name ||
    nickname !== (profile.nickname ?? '') ||
    cpf !== profile.cpf ||
    birthDate !== profile.birth_date ||
    whatsapp !== profile.whatsapp ||
    cep !== profile.cep ||
    streetNumber !== profile.street_number ||
    neighborhood !== profile.neighborhood ||
    street !== profile.street ||
    JSON.stringify(socials) !== JSON.stringify(profile.social_links ?? {});

  const handlePickPhoto = () => fileRef.current?.click();

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Escolha um arquivo de imagem (foto).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('A foto precisa ter menos de 5 MB.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const uploadRes = await uploadAvatar(file);
      if (!uploadRes.url) {
        setError(uploadRes.error ?? 'Não foi possível salvar a foto.');
        return;
      }
      const profRes = await updateMyProfile({ avatar_url: uploadRes.url });
      if (profRes.error || !profRes.data) {
        setError('Foto enviada, mas não foi vinculada ao perfil.');
        return;
      }
      setAvatarUrl(uploadRes.url);
      onSaved(profRes.data);
      setOkMsg('Foto atualizada!');
      setTimeout(() => setOkMsg(''), 2500);
    } catch {
      setError('Falha ao enviar a foto. Verifique sua internet.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setError('');
    setUploading(true);
    try {
      const res = await updateMyProfile({ avatar_url: null });
      if (res.error || !res.data) {
        setError('Não foi possível remover a foto.');
        return;
      }
      setAvatarUrl(null);
      onSaved(res.data);
      setOkMsg('Foto removida.');
      setTimeout(() => setOkMsg(''), 2500);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (fullName.trim().split(/\s+/).length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    if (cpf.replace(/\D/g, '').length !== 11) {
      setError('CPF incompleto.');
      return;
    }
    if (age === null) {
      setError('Data de nascimento inválida.');
      return;
    }
    if (whatsapp.replace(/\D/g, '').length < 10) {
      setError('WhatsApp incompleto.');
      return;
    }
    if (cep.replace(/\D/g, '').length !== 8) {
      setError('CEP incompleto.');
      return;
    }
    if (!streetNumber.trim() || !neighborhood.trim() || !street.trim()) {
      setError('Complete o endereço.');
      return;
    }
    const cleanSocials: SocialLinksMap = {};
    for (const [net, url] of Object.entries(socials)) {
      const v = (url ?? '').trim();
      if (v) cleanSocials[net] = v;
    }
    setError('');
    setBusy(true);
    try {
      const res = await updateMyProfile({
        full_name: fullName.trim(),
        nickname: nickname.trim() || null,
        cpf,
        birth_date: birthDate,
        whatsapp,
        cep,
        street_number: streetNumber.trim(),
        neighborhood: neighborhood.trim(),
        street: street.trim(),
        social_links: cleanSocials,
      });
      if (res.error || !res.data) {
        setError('Não foi possível salvar as alterações.');
        return;
      }
      onSaved(res.data);
      setOkMsg('Dados salvos!');
      setTimeout(() => setOkMsg(''), 2500);
    } catch {
      setError('Falha de conexão. Verifique sua internet.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    extra?: {
    placeholder?: string;
    type?: string;
    inputMode?: 'numeric' | 'tel' | 'text' | 'date';
    suffix?: React.ReactNode;
  }
  ) => (
    <div>
      <label className="block text-[11px] tracking-widest text-cyan-300/70 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={extra?.type ?? 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls}${extra?.suffix ? ' pr-11' : ''}`}
          placeholder={extra?.placeholder}
          inputMode={
            extra?.inputMode === 'date' ? undefined : (extra?.inputMode as 'numeric' | 'tel' | 'text' | undefined)
          }
        />
        {extra?.suffix}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] bg-black overflow-y-auto" data-modal-screen>
      <div className="relative min-h-full flex flex-col items-center px-4 py-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[90] w-10 h-10 flex items-center justify-center rounded-full border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 w-full max-w-md">
          {/* Cabeçalho com a foto */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <button
                onClick={handlePickPhoto}
                className="block w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_18px_rgba(0,255,255,0.35)] hover:shadow-[0_0_28px_rgba(0,255,255,0.55)] transition-all group"
                aria-label="Trocar foto do perfil"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Foto do perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center bg-black text-4xl font-bold text-cyan-300">
                    {profile.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
              <button
                onClick={handlePickPhoto}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center border-2 border-black hover:bg-cyan-300 transition-colors"
                aria-label="Escolher foto"
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
              </button>
              {avatarUrl && !uploading && (
                <button
                  onClick={handleRemovePhoto}
                  className="absolute bottom-0 left-0 w-9 h-9 rounded-full bg-zinc-800 text-red-400 flex items-center justify-center border-2 border-black hover:bg-zinc-700 transition-colors"
                  aria-label="Remover foto"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <h1 className="mt-3 text-lg font-bold tracking-wider text-cyan-300">{profile.full_name}</h1>
            <p className="text-xs text-zinc-400">{profile.email}</p>
          </div>

          <div className="relative bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-[0_0_40px_rgba(0,255,255,0.08)]">
            <h2 className="text-xs font-semibold tracking-[0.25em] text-cyan-300/80 mb-4">MEUS DADOS</h2>

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

            <div className="space-y-3.5">
              {field('NOME COMPLETO', fullName, setFullName, { placeholder: 'João da Silva Moreira' })}
              {field('COMO QUER SER CHAMADO', nickname, setNickname, { placeholder: 'Apelido (opcional) — a K-AI vai te chamar assim' })}
              {field('E-MAIL', profile.email, () => {}, { placeholder: 'não editável' })}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {field('CPF', cpf, (v) => setCpf(maskCpf(v)), { placeholder: '000.000.000-00', inputMode: 'numeric' })}
                {field(
                  'NASCIMENTO',
                  birthDate,
                  (v) => setBirthDate(v),
                  {
                    type: 'date',
                    suffix: age !== null ? (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-cyan-400 pointer-events-none">
                        {age} anos
                      </span>
                    ) : undefined,
                  }
                )}
              </div>
              {field('WHATSAPP', whatsapp, (v) => setWhatsapp(maskPhone(v)), { placeholder: '(00) 00000-0000', inputMode: 'tel' })}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {field('CEP', cep, (v) => setCep(maskCep(v)), { placeholder: '00000-000', inputMode: 'numeric' })}
                {field('Nº DA CASA', streetNumber, setStreetNumber, { placeholder: '123', inputMode: 'numeric' })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {field('BAIRRO', neighborhood, setNeighborhood, { placeholder: 'Bairro' })}
                {field('RUA', street, setStreet, { placeholder: 'Rua' })}
              </div>

              {/* Redes sociais */}
              <div className="pt-2">
                <h3 className="text-xs font-semibold tracking-[0.25em] text-cyan-300/80 mb-3">MINHAS REDES SOCIAIS</h3>
                <p className="text-[10px] text-cyan-200/40 mb-3">
                  Toque em uma rede e cole o link da sua conta. Salve no botão abaixo.
                </p>
                <div className="space-y-1.5">
                  {SOCIAL_NETWORKS.map((net) => {
                    const isOpen = openSocial === net;
                    const filled = (socials[net] ?? '').trim();
                    return (
                      <div key={net} className="border border-cyan-500/20 rounded-xl overflow-hidden bg-black/40">
                        <button
                          type="button"
                          onClick={() => setOpenSocial(isOpen ? null : net)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm text-cyan-100 hover:bg-cyan-500/5 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            {net}
                            {filled && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-label="link salvo" />}
                          </span>
                          {isOpen ? <ChevronUp size={16} className="text-cyan-400" /> : <ChevronDown size={16} className="text-cyan-400" />}
                        </button>
                        {isOpen && (
                          <div className="px-3.5 pb-3">
                            <input
                              value={socials[net] ?? ''}
                              onChange={(e) => setSocials((prev) => ({ ...prev, [net]: e.target.value }))}
                              className={inputCls}
                              placeholder={`https://${net.toLowerCase().replace(/[^a-z]/g, '')}.com/seu-perfil`}
                              inputMode="url"
                              autoComplete="off"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={busy || !dirty}
              className="mt-5 w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-black font-bold text-sm tracking-[0.2em] transition-all shadow-[0_0_20px_rgba(0,255,255,0.35)]"
            >
              {busy ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'SALVAR ALTERAÇÕES'}
            </button>
            {!dirty && <p className="mt-2 text-[10px] text-center text-cyan-200/40">Nada alterado ainda.</p>}
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 w-full py-3 rounded-xl bg-black/80 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-semibold tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <ChevronDown size={15} /> SAIR DA CONTA
          </button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoChange}
      />
    </div>
  );
}
