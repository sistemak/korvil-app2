export interface SubItem {
  name: string;
  description: string;
  icon: string;
}

export interface KorvilSection {
  id: string;
  name: string;
  tagline: string;
  color: string;
  accent: string;
  logo: string;
  banner: string;
  description: string;
  categories: {
    title: string;
    items: SubItem[];
  }[];
}

const RAW = 'https://github.com/sistemak/korvil-app/blob/main';

export const SECTIONS: KorvilSection[] = [
  {
    id: 'kalma',
    name: 'K-ALMA',
    tagline: 'Saúde & Bem-estar Holístico',
    color: '#ec4899',
    accent: 'from-pink-500 to-rose-600',
    logo: `${RAW}/korvil/sections/kalma/images/logokalma.png?raw=true`,
    banner: 'https://images.pexels.com/photos/7484863/pexels-photo-7484863.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Saúde, terapia holística, massoterapia, ortopedista, ortodontia, beleza, barbearia, cabeleireiro, esteticista e manicure.',
    categories: [
      {
        title: 'Saúde',
        items: [
          { name: 'Terapia Holística', description: 'Equilíbrio mente, corpo e espírito', icon: 'Sparkles' },
          { name: 'Massoterapia', description: 'Massagens terapêuticas e relaxamento', icon: 'HandHeart' },
          { name: 'Ortopedista', description: 'Saúde óssea e articular', icon: 'Bone' },
          { name: 'Ortodontia', description: 'Cuidado e alinhamento dental', icon: 'Smile' },
        ],
      },
      {
        title: 'Beleza',
        items: [
          { name: 'Barbearia', description: 'Cortes e grooming masculino', icon: 'Scissors' },
          { name: 'Cabeleireiro', description: 'Cortes, cor e tratamento capilar', icon: 'Scissors' },
          { name: 'Esteticista', description: 'Tratamentos estéticos faciais e corporais', icon: 'Flower2' },
          { name: 'Manicure & Pedicure', description: 'Cuidado completo das unhas', icon: 'HandHeart' },
        ],
      },
    ],
  },
  {
    id: 'kafortunado',
    name: 'K-AFORTUNADO',
    tagline: 'Empreendedorismo & Finanças',
    color: '#f59e0b',
    accent: 'from-amber-500 to-orange-600',
    logo: `${RAW}/korvil/sections/kafortunado/images/logokafortunado.png?raw=true`,
    banner: 'https://images.pexels.com/photos/8306403/pexels-photo-8306403.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Empreendedorismo, livros, cursos, finanças, investimentos e planilhas para construir riqueza.',
    categories: [
      {
        title: 'Conhecimento',
        items: [
          { name: 'Livros', description: 'Biblioteca de desenvolvimento financeiro', icon: 'BookOpen' },
          { name: 'Cursos', description: 'Formações em negócios e dinheiro', icon: 'GraduationCap' },
        ],
      },
      {
        title: 'Finanças',
        items: [
          { name: 'Finanças Pessoais', description: 'Controle e planejamento financeiro', icon: 'Wallet' },
          { name: 'Investimentos', description: 'Estratégias de multiplicação de capital', icon: 'TrendingUp' },
          { name: 'Planilhas', description: 'Ferramentas de gestão financeira', icon: 'Sheet' },
        ],
      },
    ],
  },
  {
    id: 'ktp',
    name: 'K-TP',
    tagline: 'Fitness & Performance Total',
    color: '#22c55e',
    accent: 'from-green-500 to-emerald-600',
    logo: `${RAW}/korvil/sections/ktp/assets/images/logoktp.png?raw=true`,
    banner: 'https://images.pexels.com/photos/3888405/pexels-photo-3888405.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Fitness, acessórios, artigos esportivos, equipamentos, suplementos e produtos alimentares para performance total.',
    categories: [
      {
        title: 'Treino',
        items: [
          { name: 'Projeto TRANSFORMAÇÃO', description: 'Programa fitness de alta performance de Say Korvil', icon: 'Rocket' },
          { name: 'Fitness', description: 'Planos de treino e acompanhamento', icon: 'Dumbbell' },
          { name: 'Acessórios', description: 'Equipamentos de apoio ao treino', icon: 'Watch' },
          { name: 'Artigos Esportivos', description: 'Vestuário e gear esportivo', icon: 'Shirt' },
          { name: 'Equipamentos & Aparelhos', description: 'Máquinas para academia e home', icon: 'Dumbbell' },
        ],
      },
      {
        title: 'Nutrição',
        items: [
          { name: 'Suplementos', description: 'Whey, creatina, vitaminas e mais', icon: 'Pill' },
          { name: 'Produtos Alimentares', description: 'Alimentos funcionais e saudáveis', icon: 'Apple' },
        ],
      },
    ],
  },
  {
    id: 'sistemak',
    name: 'SISTEMA K',
    tagline: 'Serviços Gerais & Profissionais',
    color: '#3b82f6',
    accent: 'from-blue-500 to-cyan-600',
    logo: `${RAW}/korvil/sections/sistemak/images/logosistemak.png?raw=true`,
    banner: 'https://images.pexels.com/photos/6195290/pexels-photo-6195290.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
    description: 'Serviços gerais, limpeza, segurança, profissionais, advocacia, contabilidade, tecnologias, sites e sistemas.',
    categories: [
      {
        title: 'Serviços',
        items: [
          { name: 'Limpeza', description: 'Limpeza residencial e comercial', icon: 'Sparkles' },
          { name: 'Segurança', description: 'Vigilância e proteção patrimonial', icon: 'Shield' },
          { name: 'Profissionais', description: 'Mão de obra qualificada', icon: 'HardHat' },
          { name: 'Advocacia', description: 'Consultoria e representação jurídica', icon: 'Scale' },
          { name: 'Contabilidade', description: 'Gestão fiscal e contábil', icon: 'Calculator' },
        ],
      },
      {
        title: 'Tecnologias',
        items: [
          { name: 'Sites', description: 'Desenvolvimento de websites', icon: 'Globe' },
          { name: 'Sistemas', description: 'Software sob medida', icon: 'Code' },
          { name: 'SistemaK', description: 'Soluções integradas completas', icon: 'Server' },
        ],
      },
    ],
  },
];

export const CENTRAL_KORVIL = {
  id: 'central',
  name: 'CENTRAL KORVIL',
  tagline: 'Centro de comando do ecossistema',
  color: '#a855f7',
  accent: 'from-violet-500 to-fuchsia-600',
  categories: [
    {
      title: 'Desenvolvimento Humano',
      items: [
        { name: 'Cursos', description: 'Plataforma de cursos completos', icon: 'GraduationCap' },
        { name: 'Treinamento Personalizado', description: 'Mentoria individual', icon: 'Target' },
        { name: 'Serviços Profissionais', description: 'Formação profissional', icon: 'Briefcase' },
        { name: 'Calendário Anual', description: 'Planejamento completo 2026', icon: 'Calendar' },
        { name: 'Certificados', description: 'Conclusão e certificações', icon: 'Award' },
        { name: 'Empreendedorismo', description: 'Do negócio próprio à escala', icon: 'Rocket' },
      ],
    },
    {
      title: 'Negócios & Loja',
      items: [
        { name: 'Parcerias', description: 'Rede de parceiros Korvil', icon: 'Handshake' },
        { name: 'KORVIL Loja', description: 'Marketplace oficial', icon: 'ShoppingBag' },
        { name: 'Serviços', description: 'Central de serviços', icon: 'Wrench' },
        { name: 'K.L Logistics', description: 'Logística Korvil', icon: 'Truck' },
      ],
    },
  ],
};

export const KORVIL_LOGO = `${RAW}/public/korvil/assets/images/logokorvil.png?raw=true`;
export const KAI_LOGO = `${RAW}/public/korvil/assets/images/logokai.png?raw=true`;
export const VERSION = 'v-2026';
