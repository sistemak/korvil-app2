import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';

const LOGO_KTP = 'https://github.com/sistemak/korvil-app/blob/main/korvil/sections/ktp/assets/images/logoktp.png?raw=true';
const LOGO_PROJETO = 'https://github.com/sistemak/korvil-app/blob/main/korvil/sections/ktp/projetotransformacao/assets/imagens/logoprojetotransformacao.png?raw=true';
const WHATS_KTP = '5513997690898';

const IDS_PERMITIDOS = [
  'ktp0', 'mag1', 'mcarla2', 'hvitoria3', 'alexandra4', 'michele5', 'aline6',
  'adriana7', 'joss8', 'amigaadrum9', 'amigaadrdois10', 'angel11', 'anapaula12',
  'gusta13', 'sueli14', 'fabi15', 'paula16', 'nop17', 'bianca18', 'lau19',
  'cass20', 'katia21', 'mara22', 'edna23', 'luciane24', 'marly25', 'mcris26',
  'juci27', 'joce28', 'marcos29', 'lucas30', 'celi31', 'jaque32', 'elisa33',
  'gice34', 'pati35', 'mel36', 'naty37', 'gon38', 'nicol39', 'tchuco40', 'dani41',
];

const OBJETIVOS = [
  'Ganho de Peso', 'Emagrecimento', 'Definição Muscular', 'Saúde',
  'Condicionamento Físico', 'Hipertrofia', 'Reabilitação Física',
];

const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];

const PERGUNTAS = [
  '1. Já praticou atividade física antes? *',
  '2. Como você descreve sua ALIMENTAÇÃO atual? *',
  '3. Quantas horas você DORME por noite? *',
  '4. Possui alguma RESTRIÇÃO alimentar? *',
  '5. Qual parte do corpo quer MELHORAR mais? *',
  '6. Possui alguma DEFICIENCIA ou LIMITAÇÃO fisica? *',
  '7. Está passando ou JÁ TEVE acompanhamento profissional PSICOLÓGICO? *',
  '8. Está fazendo ALGUM TRATAMENTO fisico ou psicológico? *',
  '9. Está fazendo USO DE MEDICAMENTOS? Quais? *',
];

const PLANOS = [
  { nome: 'AULA AVULSA ONLINE', valor: 20, mat: 0, tipo: 'avulso_online', freq: 5, info: '1x a 5x Dias | WhatsApp | Matrícula: GRÁTIS' },
  { nome: 'AULA AVULSA PRESENCIAL', valor: 20, mat: 0, tipo: 'avulso_pres', freq: 1, info: '1x Dia | Presencial | Matrícula: GRÁTIS | 7 vagas/horário' },
  { nome: 'PLANO ONLINE MENSAL', valor: 60, mat: 50, tipo: 'mensal_online', freq: 5, info: 'Escolha dias | App + WhatsApp | Matrícula: R$50,00' },
  { nome: 'PLANO PRESENCIAL 1x SEMANA', valor: 60, mat: 50, tipo: 'mensal_pres', freq: 1, info: 'Matrícula: R$50,00' },
  { nome: 'PLANO PRESENCIAL 2x SEMANA', valor: 80, mat: 50, tipo: 'mensal_pres', freq: 2, info: 'Matrícula: R$50,00' },
  { nome: 'PLANO PRESENCIAL 3x SEMANA', valor: 100, mat: 50, tipo: 'mensal_pres', freq: 3, info: 'Matrícula: R$50,00' },
  { nome: 'PLANO PRESENCIAL 4x SEMANA', valor: 130, mat: 50, tipo: 'mensal_pres', freq: 4, info: 'Matrícula: R$50,00' },
  { nome: 'PLANO PRESENCIAL 5x SEMANA', valor: 150, mat: 50, tipo: 'mensal_pres', freq: 5, info: 'Matrícula: R$50,00' },
];

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

const HORARIOS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
];

const FASES = [
  {
    meses: 'JANEIRO A FEVEREIRO - OFF SEASON: PREPARO',
    titulo: '1. OFF SEASON - ADAPTAÇÃO GERAL',
    desc: 'Fase de adaptação total de corpo e mente às rotinas do Projeto TRANSFORMAÇÃO. Não existe dieta restritiva aqui. O objetivo é aumentar a ingestão calórica de forma estratégica para elevar energia, disposição, recuperação e preparar o metabolismo para o bulking. Para quem já fez o projeto no ano anterior, é o momento de liberdade consciente: aproveitar o que gosta sem sabotar os objetivos. Foco também na adaptação técnica: aprender execução correta dos exercícios e entender a metodologia semanal de cada fase. Essencial para ectomorfos e alunos com dificuldade de ganhar massa e peso. Se o objetivo for ganho de peso e hipertrofia, trabalhamos com superávit calórico. Se for emagrecimento e definição muscular, já iniciamos o controle calórico. Dieta mais liberal, mas sempre direcionada.',
  },
  {
    meses: 'MARÇO A MAIO - BULKING: EVOLUÇÃO',
    titulo: '2. BULKING - HIPERTROFIA MÁXIMA',
    desc: 'Fase prioritária de construção. Objetivo principal: hipertrofia muscular, ganho de força, regeneração tecidual, reabilitação e condicionamento físico geral com foco em saúde e performance. Regra básica: comer mais do que gasta. Dieta limpa e protocolar, totalmente alinhada aos objetivos escolhidos por cada aluno, com prioridade máxima em proteínas de alta qualidade, carboidratos complexos e micronutrientes. Treinos estruturados para progressão de carga e execução técnica impecável, sem erros. Zero desperdício. Essa é a fase de ganhar massa magra de verdade, volume e densidade muscular. Disciplina na dieta e no treino é obrigatória para construir a base sólida do físico.',
  },
  {
    meses: 'JUNHO A AGOSTO - MAINTENANCE: MANTER RESULTADOS',
    titulo: '3. MAINTENANCE - CONSOLIDAÇÃO',
    desc: 'Fase de manutenção e consolidação de todos os ganhos conquistados no bulking. Momento de verificar, ajustar e refinar o protocolo geral do projeto. Objetivo: manter massa magra, reduzir levemente a gordura corporal e densificar a musculatura. Preparação física e mental para a fase de cutting. Foco total em disciplina, consistência e nutrição inteligente para nutrir o físico. Trabalhamos também o equilíbrio da mente, da alma e do estado de espírito. Os treinos são de intensidade mediana para evitar lesões, preservar articulações e não comprometer a energia da fase final. Esta é a ponte entre construção e definição. Fase de lapidar o que foi construído.',
  },
  {
    meses: 'SETEMBRO A NOVEMBRO - CUTTING: FINALIZAÇÃO',
    titulo: '4. CUTTING - DEFINIÇÃO TOTAL',
    desc: 'Fase de finalização e exposição do resultado do Projeto TRANSFORMAÇÃO. Objetivo: eliminar o máximo de gordura corporal possível preservando 100% da massa muscular conquistada. Dieta rigorosa com déficit calórico controlado e estratégico. Treinos intensos, técnicos e precisos. Não pode errar e não pode se lesionar. Foco total em estética, simetria, vascularização e modelagem do físico. É aqui que o trabalho do ano inteiro aparece. Fase de definição muscular geral, performance máxima e resultado visível. Execução perfeita em dieta e treino. Sem falhas.',
  },
  {
    meses: 'DEZEMBRO - FÉRIAS: APROVEITAR OS RESULTADOS',
    titulo: '5. DEZEMBRO - FÉRIAS ESTRATÉGICAS',
    desc: 'Período oficial de férias e recarga. Treinos leves com exercícios de rotina, mobilidade e manutenção. Objetivo: aproveitar os resultados conquistados, descansar corpo e articulações e manter o corpo ativo sem pressão. Momento para avaliar o ano, celebrar a evolução e repensar as escolhas de objetivos para o próximo ciclo do projeto. É a fase de transição: manter a constância sem estresse. Para voltar no ano seguinte com mais foco, mais energia e mais estratégia para atingir um novo nível.',
  },
];

const PARTICIPANTES = ['Crianças (10+)', 'Jovens', 'Adultos', 'Idosos', 'Praticantes', 'Atletas'];
const METODOLOGIA = ['1. Manutenção', '2. Resistência', '3. Força', '4. Hipertrofia'];

function maskCpf(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
}

function maskWhats(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.replace(/^(\d{0,2})/, '($1');
  if (d.length <= 6) return d.replace(/^(\d{2})(\d+)/, '($1) $2');
  if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

function maskCep(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
}

function calcAge(dateStr: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '';
  const birth = new Date(dateStr + 'T00:00:00');
  if (isNaN(birth.getTime())) return '';
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age >= 0 && age < 130 ? `${age} anos` : '';
}

const cardCls = 'bg-[#0a141e]/70 border border-cyan-400/30 rounded-2xl p-4 backdrop-blur-sm';
const tituloSecao = 'font-black text-cyan-300 text-sm mb-2.5 border-l-4 border-cyan-400 pl-2 tracking-wide';
const inputCls = 'w-full bg-[#0d0d0d] border border-[#2a2a2a] focus:border-cyan-400 rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors';
const labelCls = 'text-xs text-zinc-400 font-bold mb-1 block';
const btnCls = 'w-full py-3.5 rounded-xl font-black text-sm tracking-wide bg-gradient-to-r from-cyan-400 to-sky-500 text-black hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all';
const btnVoltarCls = 'w-full py-3.5 rounded-xl font-bold text-sm bg-zinc-800 text-white hover:bg-zinc-700 transition-colors';

function Passos({ ativo }: { ativo: number }) {
  const nomes = ['ANAMNESE', 'PLANOS', 'DADOS'];
  return (
    <div className="flex justify-between mb-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
      {nomes.map((n, i) => (
        <div key={n} className={`text-center flex-1 ${i + 1 === ativo ? 'text-cyan-300' : 'text-zinc-500'}`}>
          <span className={`block font-black text-xs ${i + 1 === ativo ? 'text-cyan-300' : 'text-zinc-500'}`}>{i + 1}</span>
          <span className="text-[10px] font-semibold">{n}</span>
        </div>
      ))}
    </div>
  );
}

export default function TransformacaoScreen({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<'intro' | 'inscricao'>('intro');

  // inscrição
  const [etapa, setEtapa] = useState(1);
  const [objetivos, setObjetivos] = useState<string[]>([]);
  const [respostas, setRespostas] = useState<string[]>(Array(9).fill(''));
  const [nivel, setNivel] = useState('');
  const [planoSel, setPlanoSel] = useState<typeof PLANOS[number] | null>(null);
  const [dias, setDias] = useState<string[]>([]);
  const [hora, setHora] = useState('');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [nasc, setNasc] = useState('');
  const [genero, setGenero] = useState('');
  const [whats, setWhats] = useState('');
  const [email, setEmail] = useState('');
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [erro, setErro] = useState('');

  const toggleObjetivo = (obj: string) => {
    setObjetivos((prev) => {
      if (prev.includes(obj)) return prev.filter((o) => o !== obj);
      if (prev.length >= 7) return prev;
      return [...prev, obj];
    });
  };

  const selPlano = (p: typeof PLANOS[number]) => {
    setPlanoSel(p);
    setDias(p.freq === 5 ? [...DIAS] : []);
    setHora('');
    setErro('');
  };

  const toggleDia = (dia: string) => {
    if (!planoSel || planoSel.freq === 5) return;
    setDias((prev) => {
      if (prev.includes(dia)) return prev.filter((d) => d !== dia);
      if (prev.length >= planoSel.freq) return prev;
      return [...prev, dia];
    });
  };

  const buscarCep = async (valor: string) => {
    const digits = valor.replace(/\D/g, '');
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setRua(data.logradouro || '');
        setBairro(data.bairro || '');
        setCidade(data.localidade || '');
      }
    } catch {
      // segue sem preencher
    }
  };

  const continuarAnamnese = () => {
    if (objetivos.length === 0) {
      setErro('Selecione pelo menos 1 objetivo.');
      return;
    }
    setErro('');
    setEtapa(2);
  };

  const continuarPlanos = () => {
    if (!planoSel) {
      setErro('Selecione um plano.');
      return;
    }
    if (dias.length !== planoSel.freq) {
      setErro(`Selecione ${planoSel.freq} dia(s).`);
      return;
    }
    if (!hora) {
      setErro('Selecione 1 horário.');
      return;
    }
    setErro('');
    setEtapa(3);
  };

  const finalizar = () => {
    if (!nome.trim()) { setErro('Preencha o nome.'); return; }
    if (!cpf) { setErro('Preencha o CPF.'); return; }
    if (!whats) { setErro('Preencha o WhatsApp.'); return; }
    if (!cep) { setErro('Preencha o CEP.'); return; }
    if (!numero) { setErro('Preencha o número.'); return; }
    setErro('');

    if (!planoSel) return;
    const total = planoSel.valor + planoSel.mat;
    const tipoPlano = `${planoSel.freq === 1 ? 'Aula Avulsa' : 'Mensal'} ${planoSel.tipo.includes('pres') ? 'Presencial' : 'Online'} ${planoSel.freq}x`;
    const hoje = new Date().toLocaleDateString('pt-BR');

    const msg =
      `*🚨 NOVA INSCRIÇÃO K-TP PROJETO TRANSFORMAÇÃO 🚨*\n\n` +
      `*==================================*\n*1. DADOS DO PLANO*\n*==================================*\n` +
      `*Modalidade:* ${planoSel.tipo.includes('pres') ? 'PRESENCIAL' : 'ONLINE'}\n` +
      `*Tipo de Plano:* ${tipoPlano}\n` +
      `*Dias:* ${dias.join(', ')}\n` +
      `*Horário:* ${hora}\n` +
      `*Frequência:* ${planoSel.freq}x na semana\n` +
      `*Valor Mensal:* R$${planoSel.valor},00\n` +
      `*Matrícula Paga:* R$${planoSel.mat},00 - ${hoje}\n` +
      `*Total 1º Pagamento:* R$${total},00\n\n` +
      `*==================================*\n*2. DADOS PESSOAIS*\n*==================================*\n` +
      `*Nome:* ${nome}\n` +
      `*CPF:* ${cpf}\n` +
      `*Data Nascimento:* ${nasc.split('-').reverse().join('/')}\n` +
      `*Idade:* ${calcAge(nasc) || '—'}\n` +
      `*Gênero:* ${genero}\n` +
      `*WhatsApp:* ${whats}\n` +
      `*Email:* ${email}\n\n` +
      `*==================================*\n*3. ENDEREÇO*\n*==================================*\n` +
      `*CEP:* ${cep}\n*Rua:* ${rua}\n*Número:* ${numero}\n*Bairro:* ${bairro}\n*Cidade:* ${cidade}\n\n` +
      `*==================================*\n*4. ANAMNESE - OBJETIVOS*\n*==================================*\n` +
      `*Objetivos em Prioridade:* ${objetivos.join(' | ')}\n` +
      `*Nível de Atividade:* ${nivel}\n\n` +
      `*==================================*\n*5. ANAMNESE - HISTÓRICO*\n*==================================*\n` +
      PERGUNTAS.map((p, i) => `*${p.replace(' *', '')}* ${respostas[i]}`).join('\n') +
      `\n\n*==================================*\n*STATUS: ATIVO*\n*==================================*`;

    window.location.href = `https://wa.me/${WHATS_KTP}?text=${encodeURIComponent(msg)}`;
  };

  const acessarProjeto = () => {
    const senha = window.prompt('Digite sua senha/ID de aluno do Projeto Transformação:');
    if (!senha) return;
    const normalizado = senha.trim().toLowerCase().replace(/\s+/g, '');
    if (IDS_PERMITIDOS.includes(normalizado)) {
      try {
        localStorage.setItem('idLogado', normalizado);
      } catch {
        // ignora
      }
      window.alert(`Acesso liberado, aluno ${normalizado}. Bem-vindo ao Projeto TRANSFORMAÇÃO!`);
    } else {
      window.alert(`Acesso negado. ID "${senha}" não encontrado.`);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#020208] overflow-y-auto">
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@600;700;900&display=swap"
        rel="stylesheet"
      />

      {/* FUNDO VIVO ANIMADO 4D */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, #081026 0%, #000000 100%)' }}>
        <div className="absolute rounded-full blur-[90px] opacity-40" style={{ width: '60vw', height: '60vw', background: '#00ffff', top: '-20vw', left: '-10vw', animation: 'tOrb 14s ease-in-out infinite alternate' }} />
        <div className="absolute rounded-full blur-[90px] opacity-40" style={{ width: '50vw', height: '50vw', background: '#0066ff', bottom: '-15vw', right: '-10vw', animation: 'tOrb 14s ease-in-out infinite alternate', animationDelay: '-7s' }} />
        <div className="absolute rounded-full blur-[90px] opacity-25" style={{ width: '40vw', height: '40vw', background: '#ff0055', top: '40%', left: '20%', animation: 'tOrb 20s ease-in-out infinite alternate' }} />
        <div
          className="absolute"
          style={{
            width: '200vw', height: '200vh', top: '-50vh', left: '-50vw',
            backgroundImage: 'linear-gradient(to right, rgba(0,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'tGrid 10s linear infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes tOrb {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.15); }
          100% { transform: translate(-50px, 60px) scale(0.9); }
        }
        @keyframes tGrid {
          0% { transform: perspective(600px) rotateX(65deg) translateY(0); }
          100% { transform: perspective(600px) rotateX(65deg) translateY(50px); }
        }
      `}</style>

      <div className="relative min-h-full max-w-[800px] mx-auto px-3 py-6">
        <button
          onClick={view === 'intro' ? onClose : () => { setView('intro'); setEtapa(1); }}
          className="fixed top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-cyan-400/30 bg-black/70 text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          aria-label={view === 'intro' ? 'Fechar' : 'Voltar'}
        >
          {view === 'intro' ? <X size={18} /> : <ArrowLeft size={18} />}
        </button>

        {view === 'intro' ? (
          <div className={cardCls + ' mt-8'}>
            <div className="text-center font-['Orbitron'] font-black text-cyan-300 text-sm tracking-widest mb-4" style={{ textShadow: '0 0 12px rgba(0,255,255,0.7)' }}>
              K-TP Treinamento Personalizado
            </div>

            <div className="flex justify-center items-center gap-4 mb-4">
              <img src={LOGO_KTP} alt="Logo K-TP" className="max-w-[130px] border-2 border-cyan-400 rounded-xl p-1.5 bg-black/60 shadow-[0_0_20px_rgba(0,255,255,0.4)]" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')} />
              <img src={LOGO_PROJETO} alt="Logo Projeto Transformação" className="max-w-[130px] border-2 border-cyan-400 rounded-xl p-1.5 bg-black/60 shadow-[0_0_20px_rgba(0,255,255,0.4)]" onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0')} />
            </div>

            <div className="text-center font-['Orbitron'] text-2xl font-black tracking-wider mb-6 bg-gradient-to-b from-white to-cyan-400 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(0 0 15px rgba(0,255,255,0.6))' }}>
              PROJETO TRANSFORMAÇÃO
            </div>

            <div className={tituloSecao}>| SOBRE O PROGRAMA</div>
            <p className="text-zinc-300 text-sm mb-3.5 leading-relaxed font-semibold">
              Programa de guia fitness de alta performance desenvolvido por Say Korvil.
            </p>
            <div className="text-center border-[1.5px] border-cyan-400 rounded-xl p-3.5 mb-4 bg-gradient-to-br from-cyan-400/15 to-black/60 font-['Orbitron'] font-black text-white leading-snug" style={{ textShadow: '0 0 8px rgba(0,255,255,0.7)' }}>
              TREINADOR<br />TERAPEUTA HOLÍSTICO<br />
              <span className="text-cyan-300">ESPECIALISTA EM RESULTADOS</span>
            </div>

            <div className={tituloSecao}>| PARTICIPANTES</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {PARTICIPANTES.map((p) => (
                <div key={p} className="bg-black/50 border border-cyan-400/25 rounded-lg px-2.5 py-2.5 text-[13px] font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black">✓</span> {p}
                </div>
              ))}
            </div>

            <div className={tituloSecao}>| METODOLOGIA</div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {METODOLOGIA.map((m) => (
                <div key={m} className="bg-black/50 border border-cyan-400/25 rounded-lg px-2.5 py-2.5 text-[13px] font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400 font-black">✓</span> {m}
                </div>
              ))}
            </div>

            <div className={tituloSecao}>| LINHA DO TEMPO DO PROJETO</div>
            {FASES.map((f) => (
              <div key={f.titulo} className="bg-[#0a1423]/70 border border-cyan-400/30 rounded-2xl p-4 mb-4 hover:border-cyan-400 hover:-translate-y-0.5 transition-all">
                <div className="text-center font-['Orbitron'] font-black text-[13px] text-white border border-cyan-400 rounded-lg px-3 py-2.5 mb-3 tracking-wide bg-gradient-to-r from-cyan-400/25 to-sky-500/25" style={{ textShadow: '0 0 10px rgba(0,255,255,0.7)' }}>
                  {f.meses}
                </div>
                <div className="font-['Orbitron'] font-black text-cyan-300 text-base mb-2">{f.titulo}</div>
                <p className="text-zinc-300 text-sm leading-relaxed text-justify font-semibold">{f.desc}</p>
              </div>
            ))}

            <button onClick={() => { setView('inscricao'); setEtapa(1); }} className={btnCls + ' mt-3'}>
              COMEÇAR INSCRIÇÃO
            </button>
            <button onClick={acessarProjeto} className="w-full py-3.5 mt-3 rounded-xl font-black text-sm tracking-wide border-2 border-cyan-400 text-cyan-300 bg-black/40 hover:bg-cyan-400 hover:text-black transition-all">
              ACESSAR PROJETO
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <h1 className="text-center font-['Orbitron'] font-black text-cyan-300 text-base mb-4">
              K-TP | PROJETO TRANSFORMAÇÃO
            </h1>
            <Passos ativo={etapa} />

            {erro && (
              <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-center font-bold">
                {erro}
              </div>
            )}

            {etapa === 1 && (
              <div className="space-y-3">
                <div className={cardCls}>
                  <div className={tituloSecao}>OBJETIVOS: escolha na ordem de prioridade (1 até 7)</div>
                  <p className="text-emerald-400 text-xs font-bold mb-2.5 min-h-[18px]">
                    {objetivos.length > 0 ? `PRIORIDADE: ${objetivos.map((o, i) => `${i + 1}º ${o}`).join(' > ')}` : ''}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {OBJETIVOS.map((obj) => {
                      const pos = objetivos.indexOf(obj);
                      return (
                        <button
                          key={obj}
                          onClick={() => toggleObjetivo(obj)}
                          className={`px-3 py-2.5 rounded-lg border text-left text-[13px] font-bold transition ${
                            pos > -1
                              ? 'border-cyan-400 bg-cyan-400/15 text-white'
                              : 'border-zinc-800 bg-[#111] text-zinc-200 hover:border-cyan-400'
                          }`}
                        >
                          {pos > -1 ? <b className="text-emerald-400">{pos + 1}. </b> : null}
                          {obj}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={cardCls}>
                  <div className={tituloSecao}>ANAMNESE - HISTÓRICO</div>
                  <div className="mb-2.5">
                    <label className={labelCls}>Nível de Atividade Física *</label>
                    <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={inputCls}>
                      <option value="">Selecione</option>
                      {NIVEIS.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  {PERGUNTAS.map((p, i) => (
                    <div key={p} className="mb-2.5">
                      <label className={labelCls}>{p}</label>
                      <textarea
                        rows={2}
                        value={respostas[i]}
                        onChange={(e) => setRespostas((prev) => prev.map((r, j) => (j === i ? e.target.value : r)))}
                        className={inputCls}
                      />
                    </div>
                  ))}
                  <button onClick={continuarAnamnese} className={btnCls + ' mt-2'}>CONTINUAR</button>
                </div>
              </div>
            )}

            {etapa === 2 && (
              <div className="space-y-3">
                <div className={cardCls}>
                  <div className={tituloSecao}>1. ESCOLHA 1 PLANO</div>
                  {PLANOS.map((p) => (
                    <button
                      key={p.nome}
                      onClick={() => selPlano(p)}
                      className={`w-full text-left px-3.5 py-3 rounded-xl border mb-2.5 transition ${
                        planoSel?.nome === p.nome
                          ? 'border-cyan-400 bg-cyan-400/15 shadow-[0_0_15px_rgba(0,245,255,0.25)]'
                          : 'border-zinc-800 bg-[#111] hover:border-cyan-400'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-extrabold text-cyan-300 text-[13px]">{p.nome}</span>
                        <span className="font-black text-emerald-400 text-sm whitespace-nowrap">
                          {p.freq === 1 && p.tipo === 'avulso_pres' ? 'R$20,00/aula' : p.tipo === 'avulso_online' ? 'R$20,00/aula' : `R$${p.valor},00/mês`}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">{p.info}</p>
                    </button>
                  ))}
                  <p className="text-[10px] text-zinc-500 mt-1">*Matrícula R$50,00 obrigatória para novos. Válida até Dezembro.</p>
                </div>

                <div className={cardCls}>
                  <div className={tituloSecao}>2. ESCOLHA DIAS E HORÁRIO</div>
                  <p className="text-[11px] text-cyan-300 font-bold mb-2">DIAS: SEG À SEX</p>
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {DIAS.map((d) => {
                      const sel = dias.includes(d);
                      const travado = planoSel?.freq === 5;
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDia(d)}
                          className={`py-2.5 rounded-lg border text-center text-xs font-bold transition ${
                            sel
                              ? 'border-cyan-400 bg-cyan-400/15 text-white'
                              : travado
                                ? 'border-zinc-800 bg-[#050505] text-zinc-500 opacity-40'
                                : planoSel
                                  ? 'border-zinc-800 bg-[#0a0a0a] text-zinc-200 hover:border-cyan-400'
                                  : 'border-zinc-800 bg-[#0a0a0a] text-zinc-500 opacity-40'
                          }`}
                        >
                          {d.slice(0, 3).toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-red-400 font-bold text-center mb-2">
                    {!planoSel ? 'Selecione um plano primeiro' : planoSel.freq === 5 ? 'Dias: Segunda, Terça, Quarta, Quinta, Sexta' : `Faltam ${planoSel.freq - dias.length} dia(s)`}
                  </p>
                  <p className="text-[11px] text-cyan-300 font-bold mb-2">HORÁRIO FIXO: 06h às 10h | 16h às 05h</p>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {HORARIOS.map((h) => (
                      <button
                        key={h}
                        onClick={() => planoSel && setHora(h)}
                        className={`py-2 rounded-lg border text-center text-xs font-bold transition ${
                          hora === h
                            ? 'border-cyan-400 bg-cyan-400/15 text-white'
                            : planoSel
                              ? 'border-zinc-800 bg-[#0a0a0a] text-zinc-200 hover:border-cyan-400'
                              : 'border-zinc-800 bg-[#0a0a0a] text-zinc-500 opacity-40'
                        }`}
                      >
                        {h}
                        <span className="block text-[9px] text-emerald-400">7 vagas</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={continuarPlanos} className={btnCls}>CONTINUAR</button>
              </div>
            )}

            {etapa === 3 && (
              <div className="space-y-3">
                <div className={cardCls}>
                  <div className={tituloSecao}>3. DADOS PESSOAIS</div>
                  <div className="mb-2.5">
                    <label className={labelCls}>Nome Completo *</label>
                    <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                    <div>
                      <label className={labelCls}>CPF *</label>
                      <input value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} maxLength={14} placeholder="000.000.000-00" inputMode="numeric" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Data Nasc *</label>
                      <input type="date" value={nasc} onChange={(e) => setNasc(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                    <div>
                      <label className={labelCls}>Idade</label>
                      <input value={calcAge(nasc)} readOnly className={inputCls + ' text-emerald-400 font-extrabold'} />
                    </div>
                    <div>
                      <label className={labelCls}>Gênero *</label>
                      <select value={genero} onChange={(e) => setGenero(e.target.value)} className={inputCls}>
                        <option value="">Selecione</option>
                        <option>Masculino</option>
                        <option>Feminino</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-2.5">
                    <label className={labelCls}>WhatsApp *</label>
                    <input value={whats} onChange={(e) => setWhats(maskWhats(e.target.value))} placeholder="(11) 99999-9999" inputMode="tel" className={inputCls} />
                  </div>
                  <div className="mb-2.5">
                    <label className={labelCls}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </div>

                  <div className={tituloSecao + ' mt-4'}>ENDEREÇO</div>
                  <div className="mb-2.5">
                    <label className={labelCls}>CEP *</label>
                    <input value={cep} onChange={(e) => setCep(maskCep(e.target.value))} onBlur={(e) => void buscarCep(e.target.value)} maxLength={9} placeholder="00000-000" inputMode="numeric" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-2.5">
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelCls}>Rua</label>
                      <input value={rua} onChange={(e) => setRua(e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Número *</label>
                      <input value={numero} onChange={(e) => setNumero(e.target.value)} inputMode="numeric" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Bairro</label>
                      <input value={bairro} onChange={(e) => setBairro(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className="mb-2.5">
                    <label className={labelCls}>Cidade</label>
                    <input value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputCls} />
                  </div>

                  <button onClick={finalizar} className={btnCls + ' mt-2'}>FINALIZAR INSCRIÇÃO</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
