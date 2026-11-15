/* Catálogo mock rico da Korvil-Loja (K.L) — marketplace oficial do ecossistema Korvil.
   Cobertura: sistema/serviços, tecnologias/ecommerce, k-tp/fitness, k-afortunado, k-alma/saude. */

export interface ProductVariation {
  label: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  sector: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  installment: string;
  shipping: string;
  rating: number;
  reviews: number;
  seller: string;
  image: string;
  images: string[];
  video: string | null;
  description: string;
  variations: ProductVariation[];
  tags: string[];
}

export interface Sector {
  id: string;
  name: string;
  icon: string;
  categories: {
    id: string;
    name: string;
    subcategories: { id: string; name: string }[];
  }[];
}

export const SECTORS: Sector[] = [
  {
    id: 'sistema',
    name: 'Sistema K',
    icon: 'HardHat',
    categories: [
      {
        id: 'servicos-profissionais',
        name: 'Serviços Profissionais',
        subcategories: [
          { id: 'eletricista', name: 'Eletricista' },
          { id: 'carpinteiro', name: 'Carpinteiro' },
          { id: 'faxineira', name: 'Faxineira' },
        ],
      },
      {
        id: 'tecnologias',
        name: 'Tecnologias',
        subcategories: [
          { id: 'ecommerce', name: 'E-commerce' },
        ],
      },
    ],
  },
  {
    id: 'ktp',
    name: 'K-TP Fitness',
    icon: 'Dumbbell',
    categories: [
      {
        id: 'fitness',
        name: 'Fitness',
        subcategories: [
          { id: 'suplementos', name: 'Suplementos' },
          { id: 'produtos-alimentares', name: 'Produtos Alimentares' },
          { id: 'artigos-esportivos', name: 'Artigos Esportivos' },
          { id: 'vestuario', name: 'Vestuário' },
          { id: 'calcados', name: 'Calçados' },
          { id: 'acessorios-esportivos', name: 'Acessórios Esportivos' },
          { id: 'aparelhos-equipamentos', name: 'Aparelhos & Equipamentos' },
        ],
      },
    ],
  },
  {
    id: 'kafortunado',
    name: 'K-Afortunado',
    icon: 'BookOpen',
    categories: [
      {
        id: 'empreendedorismo',
        name: 'Empreendedorismo',
        subcategories: [
          { id: 'ebooks', name: 'E-books' },
          { id: 'livros', name: 'Livros' },
          { id: 'materiais-trabalho', name: 'Materiais de Trabalho' },
        ],
      },
      {
        id: 'financas',
        name: 'Finanças',
        subcategories: [
          { id: 'ebooks-fin', name: 'E-books' },
          { id: 'livros-fin', name: 'Livros' },
          { id: 'materiais-fin', name: 'Materiais de Trabalho' },
        ],
      },
    ],
  },
  {
    id: 'kalma',
    name: 'K-ALMA Saúde',
    icon: 'HandHeart',
    categories: [
      {
        id: 'massoterapia',
        name: 'Massoterapia',
        subcategories: [
          { id: 'oleos-essenciais', name: 'Óleos Essenciais' },
          { id: 'materiais-masso', name: 'Materiais' },
        ],
      },
      {
        id: 'fisioterapia',
        name: 'Fisioterapia',
        subcategories: [
          { id: 'produtos-fisio', name: 'Produtos' },
          { id: 'materiais-fisio', name: 'Materiais' },
          { id: 'equipamentos-fisio', name: 'Equipamentos' },
          { id: 'aparelhos-fisio', name: 'Aparelhos' },
        ],
      },
      {
        id: 'estetica',
        name: 'Estética',
        subcategories: [
          { id: 'produtos-estetica', name: 'Produtos' },
          { id: 'aparelhos-estetica', name: 'Aparelhos' },
        ],
      },
      {
        id: 'dentista',
        name: 'Dentista',
        subcategories: [
          { id: 'produtos-dental', name: 'Produtos' },
          { id: 'equipamentos-dental', name: 'Equipamentos' },
        ],
      },
      {
        id: 'terapia-holistica',
        name: 'Terapia Holística',
        subcategories: [
          { id: 'produtos-holistica', name: 'Produtos' },
          { id: 'materiais-holistica', name: 'Materiais' },
          { id: 'equipamentos-holistica', name: 'Equipamentos' },
          { id: 'aparelhos-holistica', name: 'Aparelhos' },
        ],
      },
      {
        id: 'beleza',
        name: 'Beleza',
        subcategories: [
          { id: 'barbeiro', name: 'Barbeiro' },
          { id: 'cabeleireiro', name: 'Cabeleireiro' },
        ],
      },
    ],
  },
];

const IMG: Record<string, string[]> = {
  electronics: [
    'https://images.pexels.com/photos/11129922/pexels-photo-11129922.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/4249193/pexels-photo-4249193.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/14713024/pexels-photo-14713024.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/10703759/pexels-photo-10703759.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/9984695/pexels-photo-9984695.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  electronicsBack: [
    'https://images.pexels.com/photos/1422298/pexels-photo-1422298.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/1350461/pexels-photo-1350461.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/257923/pexels-photo-257923.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  electronicsDetail: [
    'https://images.pexels.com/photos/13844013/pexels-photo-13844013.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/840185/pexels-photo-840185.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/9652434/pexels-photo-9652434.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  speaker: [
    'https://images.pexels.com/photos/14017595/pexels-photo-14017595.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/1279365/pexels-photo-1279365.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/20323501/pexels-photo-20323501.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  speakerBack: [
    'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/373071/pexels-photo-373071.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/1666069/pexels-photo-1666069.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  speakerDetail: [
    'https://images.pexels.com/photos/7135124/pexels-photo-7135124.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/3756879/pexels-photo-3756879.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  fitness: [
    'https://images.pexels.com/photos/13779116/pexels-photo-13779116.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/13779103/pexels-photo-13779103.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/13779108/pexels-photo-13779108.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/15120889/pexels-photo-15120889.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/36429468/pexels-photo-36429468.png?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  fitnessBack: [
    'https://images.pexels.com/photos/36429463/pexels-photo-36429463.png?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/4378601/pexels-photo-4378601.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/5236668/pexels-photo-5236668.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  fitnessDetail: [
    'https://images.pexels.com/photos/31443914/pexels-photo-31443914.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/31443913/pexels-photo-31443913.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/16513595/pexels-photo-16513595.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  shoes: [
    'https://images.pexels.com/photos/1456733/pexels-photo-1456733.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/260044/pexels-photo-260044.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/32535805/pexels-photo-32535805.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  shoesBack: [
    'https://images.pexels.com/photos/28375818/pexels-photo-28375818.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/9207813/pexels-photo-9207813.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/29096401/pexels-photo-29096401.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  shoesDetail: [
    'https://images.pexels.com/photos/115009/sport-shoe-running-shoe-shoe-blue-jeans-115009.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/5319372/pexels-photo-5319372.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/7880182/pexels-photo-7880182.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  clothes: [
    'https://images.pexels.com/photos/20400624/pexels-photo-20400624.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/29242399/pexels-photo-29242399.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/29242372/pexels-photo-29242372.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  clothesBack: [
    'https://images.pexels.com/photos/5310727/pexels-photo-5310727.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/28774699/pexels-photo-28774699.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/12097160/pexels-photo-12097160.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  clothesDetail: [
    'https://images.pexels.com/photos/8770422/pexels-photo-8770422.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/917589/pexels-photo-917589.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/14838293/pexels-photo-14838293.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  weights: [
    'https://images.pexels.com/photos/19025674/pexels-photo-19025674.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/19025671/pexels-photo-19025671.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/37887283/pexels-photo-37887283.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/669582/pexels-photo-669582.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  weightsBack: [
    'https://images.pexels.com/photos/35651163/pexels-photo-35651163.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/37887280/pexels-photo-37887280.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/37887287/pexels-photo-37887287.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  weightsDetail: [
    'https://images.pexels.com/photos/29495718/pexels-photo-29495718.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/11058382/pexels-photo-11058382.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/4753885/pexels-photo-4753885.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  tools: [
    'https://images.pexels.com/photos/38292956/pexels-photo-38292956.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/772444/pexels-photo-772444.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/31583983/pexels-photo-31583983.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/5806812/pexels-photo-5806812.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  toolsBack: [
    'https://images.pexels.com/photos/4398314/pexels-photo-4398314.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/33531832/pexels-photo-33531832.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/11872896/pexels-photo-11872896.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  toolsDetail: [
    'https://images.pexels.com/photos/14319099/pexels-photo-14319099.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/6349399/pexels-photo-6349399.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/11679114/pexels-photo-11679114.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  beauty: [
    'https://images.pexels.com/photos/36339062/pexels-photo-36339062.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/16008945/pexels-photo-16008945.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/34159010/pexels-photo-34159010.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/7691159/pexels-photo-7691159.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  beautyBack: [
    'https://images.pexels.com/photos/7691102/pexels-photo-7691102.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/7691166/pexels-photo-7691166.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/12969358/pexels-photo-12969358.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  beautyDetail: [
    'https://images.pexels.com/photos/11672348/pexels-photo-11672348.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/27544691/pexels-photo-27544691.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/15061736/pexels-photo-15061736.png?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  barber: [
    'https://images.pexels.com/photos/7697208/pexels-photo-7697208.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/13809242/pexels-photo-13809242.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/7518711/pexels-photo-7518711.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/7697712/pexels-photo-7697712.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  barberBack: [
    'https://images.pexels.com/photos/16407082/pexels-photo-16407082.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/11424757/pexels-photo-11424757.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/3998418/pexels-photo-3998418.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  barberDetail: [
    'https://images.pexels.com/photos/33448216/pexels-photo-33448216.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/36043163/pexels-photo-36043163.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/10517483/pexels-photo-10517483.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  dental: [
    'https://images.pexels.com/photos/6627668/pexels-photo-6627668.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/6812483/pexels-photo-6812483.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/6502746/pexels-photo-6502746.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  dentalBack: [
    'https://images.pexels.com/photos/3810469/pexels-photo-3810469.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/4230029/pexels-photo-4230029.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/5212295/pexels-photo-5212295.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  dentalDetail: [
    'https://images.pexels.com/photos/3779704/pexels-photo-3779704.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/4230027/pexels-photo-4230027.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/6627669/pexels-photo-6627669.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  books: [
    'https://images.pexels.com/photos/5124868/pexels-photo-5124868.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/12914430/pexels-photo-12914430.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/8099373/pexels-photo-8099373.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/273034/pexels-photo-273034.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/1083728/pexels-photo-1083728.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  booksBack: [
    'https://images.pexels.com/photos/7967625/pexels-photo-7967625.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/627530/pexels-photo-627530.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/5124874/pexels-photo-5124874.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  booksDetail: [
    'https://images.pexels.com/photos/346731/pexels-photo-346731.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/5192059/pexels-photo-5192059.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/5212295/pexels-photo-5212295.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
};

// Video promocional por categoria (URLs Pexels video)
const VIDEO: Record<string, string> = {
  electronics: 'https://videos.pexels.com/video-files/7989650/7989650-uhd_3840_2160_30fps.mp4',
  fitness: 'https://videos.pexels.com/video-files/4762437/4762437-hd_1920_1080_30fps.mp4',
  shoes: 'https://videos.pexels.com/video-files/4763822/4763822-hd_1920_1080_25fps.mp4',
  clothes: 'https://videos.pexels.com/video-files/4753985/4753985-hd_1920_1080_25fps.mp4',
  weights: 'https://videos.pexels.com/video-files/4753978/4753978-hd_1920_1080_25fps.mp4',
  tools: 'https://videos.pexels.com/video-files/4754019/4754019-hd_1920_1080_25fps.mp4',
  beauty: 'https://videos.pexels.com/video-files/4753999/4753999-hd_1920_1080_25fps.mp4',
  barber: 'https://videos.pexels.com/video-files/4754021/4754021-hd_1920_1080_25fps.mp4',
  dental: 'https://videos.pexels.com/video-files/4754003/4754003-hd_1920_1080_25fps.mp4',
  books: 'https://videos.pexels.com/video-files/4754008/4754008-hd_1920_1080_25fps.mp4',
  speaker: 'https://videos.pexels.com/video-files/7989650/7989650-uhd_3840_2160_30fps.mp4',
};

function installment(price: number): string {
  const x = Math.min(12, Math.max(1, Math.round(price / 25)));
  const v = (price / x).toFixed(2).replace('.', ',');
  return `${x}x R$ ${v}`;
}

function gen(): Product[] {
  const out: Product[] = [];
  let n = 0;

  // Map a front-image URL to its category key for back/detail-image + video lookup
  function categoryKeyFor(url: string): string {
    for (const key of Object.keys(IMG)) {
      if (IMG[key].includes(url)) {
        return key.replace('Back', '').replace('Detail', '');
      }
    }
    return 'tools';
  }

  const mk = (
    sector: string, category: string, sub: string,
    name: string, brand: string, price: number,
    image: string, variations: ProductVariation[],
    tags: string[],
    desc: string,
  ): Product => {
    const catKey = categoryKeyFor(image);
    const backArr = IMG[`${catKey}Back`];
    const detailArr = IMG[`${catKey}Detail`];
    const backImg = backArr ? backArr[out.length % backArr.length] : image;
    const detailImg = detailArr ? detailArr[out.length % detailArr.length] : backImg;
    const video = VIDEO[catKey] ?? null;
    return {
      id: `kl-${++n}`,
      name, sector, category, subcategory: sub, brand,
      price, installment: installment(price),
      shipping: 'Frete grátis',
      rating: 4.8, reviews: Math.floor(80 + Math.random() * 420),
      seller: 'Korvil Store',
      image,
      images: [image, backImg, detailImg],
      video,
      description: desc,
      variations,
      tags,
    };
  };

  // === SISTEMA K — Eletricista ===
  out.push(mk('sistema', 'servicos-profissionais', 'eletricista', 'Multímetro Digital Profissional', 'Hikari', 89.90, IMG.tools[0],
    [{ label: 'Modelo', options: ['HM-500B', 'HM-1000B'] }, { label: 'Cor', options: ['Vermelho', 'Preto'] }],
    ['marca:Hikari', 'tipo:Digital', 'bivolt:Sim'],
    'Multímetro digital com medição de tensão, corrente, resistência e continuidade. Aprovação INMETRO.'));
  out.push(mk('sistema', 'servicos-profissionais', 'eletricista', 'Maleta de Ferramentas 45 Peças', 'Tramontina', 249.90, IMG.tools[1],
    [{ label: 'Tamanho', options: ['45 peças', '60 peças'] }],
    ['marca:Tramontina', 'tipo:Maleta', 'material:Aço'],
    'Maleta completa com alicates, chaves, fitas e mais para o profissional eletricista.'));
  out.push(mk('sistema', 'servicos-profissionais', 'eletricista', 'Fita Isolante Variada Pacote 10un', '3M', 18.50, IMG.tools[2],
    [{ label: 'Cores', options: ['Sortido', 'Preto', 'Vermelho'] }],
    ['marca:3M', 'tipo:Fita', 'cor:Sortido'],
    'Pacote com 10 unidades de fita isolante premium 3M, resistência até 600V.'));
  out.push(mk('sistema', 'servicos-profissionais', 'eletricista', 'Alicate Universal 8"', 'Bosch', 69.90, IMG.tools[3],
    [{ label: 'Tamanho', options: ['6"', '8"', '10"'] }],
    ['marca:Bosch', 'tipo:Alicate', 'material:Aço Cromo'],
    'Alicate universal com cabos emborrachados e corte integrado para uso pesado.'));

  // === SISTEMA K — Carpinteiro ===
  out.push(mk('sistema', 'servicos-profissionais', 'carpinteiro', 'Enxada com Cabo de Madeira', 'Tramontina', 45.90, IMG.tools[3],
    [{ label: 'Tamanho', options: ['Nº2', 'Nº3', 'Nº4'] }],
    ['marca:Tramontina', 'tipo:Enxada', 'material:Aço'],
    'Enxada forjada em aço com cabo de madeira resistente para trabalho pesado.'));
  out.push(mk('sistema', 'servicos-profissionais', 'carpinteiro', 'Pá Quadrada Profissional', 'Bellaco', 38.00, IMG.tools[0],
    [{ label: 'Material', options: ['Aço', 'Inox'] }],
    ['marca:Bellaco', 'tipo:Pá', 'material:Aço'],
    'Pá quadrada com borda reforçada, ideal para construção e jardinagem.'));
  out.push(mk('sistema', 'servicos-profissionais', 'carpinteiro', 'Martelo Unha 27mm Profissional', 'Tramontina', 42.90, IMG.tools[1],
    [{ label: 'Peso', options: ['500g', '1kg', '1.5kg'] }],
    ['marca:Tramontina', 'tipo:Martelo', 'material:Aço Forjado'],
    'Martelo unha com cabo de madeira reforçado para construção civil.'));
  out.push(mk('sistema', 'servicos-profissionais', 'carpinteiro', 'Trena 5m Profissional', 'Stanley', 29.90, IMG.tools[2],
    [{ label: 'Tamanho', options: ['3m', '5m', '8m'] }],
    ['marca:Stanley', 'tipo:Trena', 'material:ABS'],
    'Trena profissional com cinta magnética e trava automática.'));

  // === SISTEMA K — Faxineira ===
  out.push(mk('sistema', 'servicos-profissionais', 'faxineira', 'Kit Panos Microfibra 12un', 'CleanPro', 22.90, IMG.beauty[0],
    [{ label: 'Quantidade', options: ['6un', '12un', '24un'] }],
    ['marca:CleanPro', 'tipo:Panos', 'material:Microfibra'],
    'Panos de microfibra multiuso, alta absorção, laváveis e duráveis.'));
  out.push(mk('sistema', 'servicos-profissionais', 'faxineira', 'Mop Giratório com Balde', 'Pinho Sol', 119.90, IMG.beauty[1],
    [{ label: 'Modelo', options: ['Giratório', 'Simples'] }],
    ['marca:Pinho Sol', 'tipo:Mop', 'material:Plástico'],
    'Mop giratório com sistema de centrífuga e balde incluído.'));
  out.push(mk('sistema', 'servicos-profissionais', 'faxineira', 'Vassoura Cerdas Macias', 'Ypê', 15.50, IMG.beauty[2],
    [{ label: 'Cor', options: ['Azul', 'Verde', 'Amarela'] }],
    ['marca:Ypê', 'tipo:Vassoura', 'material:Plástico'],
    'Vassoura com cerdas macias para varredura silenciosa e eficiente.'));
  out.push(mk('sistema', 'servicos-profissionais', 'faxineira', 'Detergente Concentrado 5L', 'Ypê', 27.90, IMG.beauty[3],
    [{ label: 'Volume', options: ['2L', '5L', '10L'] }],
    ['marca:Ypê', 'tipo:Detergente', 'volume:5L'],
    'Detergente concentrado multiuso para limpeza pesada de superfícies e pisos.'));
  out.push(mk('sistema', 'servicos-profissionais', 'faxineira', 'Rodo de Piso 60cm', 'Pinho Sol', 24.90, IMG.beauty[0],
    [{ label: 'Largura', options: ['40cm', '60cm', '90cm'] }],
    ['marca:Pinho Sol', 'tipo:Rodo', 'material:Alumínio'],
    'Rodo de piso com lâmina de borracha reforçada e cabo de alumínio leve.'));

  // === SISTEMA K — Tecnologias / E-commerce ===
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'Smartphone Galaxy 256GB', 'Samsung', 1899.00, IMG.electronics[0],
    [{ label: 'Cor', options: ['Preto', 'Azul', 'Verde'] }, { label: 'Capacidade', options: ['128GB', '256GB', '512GB'] }],
    ['marca:Samsung', 'tipo:Smartphone', 'cor:Preto', 'capacidade:256GB'],
    'Smartphone Samsung Galaxy com tela AMOLED 6.5", câmera tripla 50MP e bateria 5000mAh.'));
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'Notebook Ultra Slim 16GB', 'Dell', 3499.00, IMG.electronics[1],
    [{ label: 'RAM', options: ['8GB', '16GB', '32GB'] }, { label: 'SSD', options: ['256GB', '512GB', '1TB'] }],
    ['marca:Dell', 'tipo:Notebook', 'ram:16GB', 'ssd:512GB'],
    'Notebook Dell Ultra Slim com processador Intel Core i7, tela 15.6" Full HD e SSD rápido.'));
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'Smart TV LED 50" 4K', 'LG', 2799.00, IMG.electronics[2],
    [{ label: 'Tamanho', options: ['43"', '50"', '55"', '65"'] }, { label: 'Resolução', options: ['Full HD', '4K'] }],
    ['marca:LG', 'tipo:TV', 'tamanho:50"', 'resolução:4K'],
    'Smart TV LG 50" 4K com webOS, HDR10 e comando de voz integrado.'));
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'Caixa de Som Bluetooth Portátil', 'JBL', 299.90, IMG.speaker[0],
    [{ label: 'Modelo', options: ['Flip 6', 'Charge 5', 'Xtreme 3'] }, { label: 'Cor', options: ['Preto', 'Azul', 'Vermelho'] }],
    ['marca:JBL', 'tipo:Caixa de Som', 'cor:Preto'],
    'Caixa de som JBL à prova d\'água com 12h de bateria e som potente 360°.'));
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'Fone Bluetooth TWS Pro', 'Xiaomi', 149.90, IMG.electronics[3],
    [{ label: 'Modelo', options: ['Redmi Buds 4', 'Buds 4 Pro'] }, { label: 'Cor', options: ['Branco', 'Preto'] }],
    ['marca:Xiaomi', 'tipo:Fone TWS', 'cor:Branco'],
    'Fone sem fio Xiaomi com cancelamento de ruído ativo e case de carregamento.'));
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'iPhone 15 Pro 256GB', 'Apple', 7999.00, IMG.electronics[4],
    [{ label: 'Cor', options: ['Titânio Natural', 'Titânio Azul', 'Titânio Preto'] }, { label: 'Capacidade', options: ['128GB', '256GB', '512GB', '1TB'] }],
    ['marca:Apple', 'tipo:Smartphone', 'cor:Titânio Natural', 'capacidade:256GB'],
    'iPhone 15 Pro com chip A17 Pro, câmera principal 48MP e estrutura em titânio.'));
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'Tablet Galaxy Tab S9 11"', 'Samsung', 4299.00, IMG.electronics[0],
    [{ label: 'Tamanho', options: ['11"', '12.4"'] }, { label: 'Cor', options: ['Grafite', 'Prata'] }],
    ['marca:Samsung', 'tipo:Tablet', 'cor:Grafite'],
    'Tablet Samsung Galaxy Tab S9 com tela AMOLED, S Pen incluída e resistência à água.'));
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'Soundbar 5.1 com Subwoofer', 'LG', 1499.00, IMG.speaker[1],
    [{ label: 'Modelo', options: ['S60TR', 'S70TY'] }],
    ['marca:LG', 'tipo:Soundbar', 'voltagem:Bivolt'],
    'Soundbar LG 5.1 com subwoofer sem fio e Dolby Atmos para cinema em casa.'));

  // === K-TP — Suplementos ===
  out.push(mk('ktp', 'fitness', 'suplementos', 'Whey Protein Isolado 900g', 'Growth', 129.90, IMG.fitness[0],
    [{ label: 'Sabor', options: ['Chocolate', 'Baunilha', 'Morango', 'Cookies'] }, { label: 'Peso', options: ['900g', '1kg', '2kg'] }],
    ['marca:Growth', 'tipo:Whey', 'sabor:Chocolate', 'peso:900g'],
    'Whey Protein isolado com 27g de proteína por dose, baixo teor de gordura e carboidratos.'));
  out.push(mk('ktp', 'fitness', 'suplementos', 'Creatina Monohidratada 300g', 'Max Titanium', 89.90, IMG.fitness[1],
    [{ label: 'Peso', options: ['150g', '300g', '600g'] }],
    ['marca:Max Titanium', 'tipo:Creatina', 'peso:300g'],
    'Creatina monohidratada pura para ganho de força e volume muscular.'));
  out.push(mk('ktp', 'fitness', 'suplementos', 'Pré-Treino Ignite 400g', 'Black Skull', 99.90, IMG.fitness[2],
    [{ label: 'Sabor', options: ['Uva', 'Laranja', 'Açaí'] }],
    ['marca:Black Skull', 'tipo:Pré-treino', 'sabor:Uva'],
    'Pré-treino com cafeína, beta-alanina e citrulina para máxima performance.'));

  // === K-TP — Produtos Alimentares ===
  out.push(mk('ktp', 'fitness', 'produtos-alimentares', 'Barra Proteica 12 unidades', 'Essential', 49.90, IMG.fitness[3],
    [{ label: 'Sabor', options: ['Chocolate', 'Cookies & Cream', 'Frutas Vermelhas'] }, { label: 'Pacote', options: ['6un', '12un', '24un'] }],
    ['marca:Essential', 'tipo:Barra', 'sabor:Chocolate'],
    'Barra proteica com 20g de proteína, sem açúcar adicionado, ideal para lanches.'));
  out.push(mk('ktp', 'fitness', 'produtos-alimentares', 'Granola Zero Açúcar 1kg', 'Naturale', 27.90, IMG.fitness[4],
    [{ label: 'Sabor', options: ['Original', 'Cacau', 'Frutas'] }, { label: 'Peso', options: ['500g', '1kg'] }],
    ['marca:Naturale', 'tipo:Granola', 'sabor:Original', 'peso:1kg'],
    'Granola sem açúcar com aveia, mel e frutas secas para um café da manhã saudável.'));

  // === K-TP — Artigos Esportivos ===
  out.push(mk('ktp', 'fitness', 'artigos-esportivos', 'Garrafa Térmica 1L', 'Stanley', 159.90, IMG.fitness[0],
    [{ label: 'Cor', options: ['Preto', 'Verde', 'Vermelho', 'Azul'] }, { label: 'Capacidade', options: ['500ml', '750ml', '1L'] }],
    ['marca:Stanley', 'tipo:Garrafa', 'cor:Preto', 'capacidade:1L'],
    'Garrafa térmica Stanley que mantém gelado por 24h e quente por 12h.'));

  // === K-TP — Vestuário ===
  out.push(mk('ktp', 'fitness', 'vestuario', 'Camiseta Dry Fit Masculina', 'Olympikus', 59.90, IMG.clothes[0],
    [{ label: 'Tamanho', options: ['P', 'M', 'G', 'GG', 'XGG'] }, { label: 'Cor', options: ['Preto', 'Azul', 'Cinza', 'Branco'] }],
    ['marca:Olympikus', 'tipo:Camiseta', 'tamanho:M', 'cor:Preto'],
    'Camiseta dry fit com tecido respirável, ideal para treinos intensos.'));
  out.push(mk('ktp', 'fitness', 'vestuario', 'Leggings Feminina Compressão', 'Body Co', 89.90, IMG.clothes[1],
    [{ label: 'Tamanho', options: ['PP', 'P', 'M', 'G', 'GG'] }, { label: 'Cor', options: ['Preto', 'Rosa', 'Azul'] }],
    ['marca:Body Co', 'tipo:Legging', 'tamanho:M', 'cor:Preto'],
    'Legging de compressão com cós alto e tecido que não transparenta.'));
  out.push(mk('ktp', 'fitness', 'vestuario', 'Conjunto Treino Feminino', 'Armagedon', 129.90, IMG.clothes[2],
    [{ label: 'Tamanho', options: ['PP', 'P', 'M', 'G'] }, { label: 'Cor', options: ['Preto', 'Verde', 'Marinho'] }],
    ['marca:Armagedon', 'tipo:Conjunto', 'tamanho:M', 'cor:Preto'],
    'Conjunto top + legging com design ergonômico para treino de alta intensidade.'));
  out.push(mk('ktp', 'fitness', 'vestuario', 'Calça Jogger Masculina', 'Olympikus', 79.90, IMG.clothes[0],
    [{ label: 'Tamanho', options: ['P', 'M', 'G', 'GG', 'XGG'] }, { label: 'Cor', options: ['Preto', 'Cinza', 'Marinho'] }],
    ['marca:Olympikus', 'tipo:Calça', 'tamanho:M', 'cor:Preto'],
    'Calça jogger masculina com tecido elástico e bolsos laterais para treino ou casual.'));
  out.push(mk('ktp', 'fitness', 'vestuario', 'Blusa Moletom Feminina', 'Body Co', 119.90, IMG.clothes[1],
    [{ label: 'Tamanho', options: ['PP', 'P', 'M', 'G', 'GG'] }, { label: 'Cor', options: ['Preto', 'Rosa', 'Cinza'] }],
    ['marca:Body Co', 'tipo:Blusa', 'tamanho:M', 'cor:Preto'],
    'Blusa moletom feminina com capuz e tecido levinho para antes e depois do treino.'));
  out.push(mk('ktp', 'fitness', 'vestuario', 'Top Esportivo Feminino', 'Armagedon', 49.90, IMG.clothes[2],
    [{ label: 'Tamanho', options: ['PP', 'P', 'M', 'G'] }, { label: 'Cor', options: ['Preto', 'Rosa', 'Branco'] }],
    ['marca:Armagedon', 'tipo:Top', 'tamanho:M', 'cor:Preto'],
    'Top esportivo feminino com bojo removível e alças largas para suporte total.'));

  // === K-TP — Calçados ===
  out.push(mk('ktp', 'fitness', 'calcados', 'Tênis Corrida Masculino', 'Nike', 399.90, IMG.shoes[0],
    [{ label: 'Tamanho', options: ['38', '39', '40', '41', '42', '43', '44', '45'] }, { label: 'Cor', options: ['Preto', 'Branco', 'Azul'] }],
    ['marca:Nike', 'tipo:Tênis', 'tamanho:42', 'cor:Preto'],
    'Tênis Nike com amortecimento React e cabedal respirável para corrida de longa distância.'));
  out.push(mk('ktp', 'fitness', 'calcados', 'Tênis Esportivo Feminino', 'Adidas', 329.90, IMG.shoes[1],
    [{ label: 'Tamanho', options: ['34', '35', '36', '37', '38', '39', '40'] }, { label: 'Cor', options: ['Branco', 'Rosa', 'Preto'] }],
    ['marca:Adidas', 'tipo:Tênis', 'tamanho:37', 'cor:Branco'],
    'Tênis Adidas com tecnologia Boost para máximo conforto em treinos e uso diário.'));
  out.push(mk('ktp', 'fitness', 'calcados', 'Sapatilha Casual Feminina', 'Olympikus', 119.90, IMG.shoes[2],
    [{ label: 'Tamanho', options: ['34', '35', '36', '37', '38'] }, { label: 'Cor', options: ['Preto', 'Bege'] }],
    ['marca:Olympikus', 'tipo:Sapatilha', 'tamanho:36', 'cor:Preto'],
    'Sapatilha leve e confortável para uso casual e caminhadas leves.'));
  out.push(mk('ktp', 'fitness', 'calcados', 'Sapato Social Masculino Couro', 'Dakota', 249.90, IMG.shoes[0],
    [{ label: 'Tamanho', options: ['38', '39', '40', '41', '42', '43', '44'] }, { label: 'Cor', options: ['Preto', 'Marrom'] }],
    ['marca:Dakota', 'tipo:Sapato', 'tamanho:42', 'material:Couro'],
    'Sapato social em couro legítimo com solado em borracha antiderrapante.'));
  out.push(mk('ktp', 'fitness', 'calcados', 'Chinelo Slide Unissex', 'Nike', 79.90, IMG.shoes[1],
    [{ label: 'Tamanho', options: ['35/36', '37/38', '39/40', '41/42', '43/44'] }, { label: 'Cor', options: ['Preto', 'Branco', 'Azul'] }],
    ['marca:Nike', 'tipo:Chinelo', 'tamanho:41/42', 'cor:Preto'],
    'Chinelo slide Nike com palmilha macia para uso pós-treino e descanso.'));

  // === K-TP — Acessórios Esportivos ===
  out.push(mk('ktp', 'fitness', 'acessorios-esportivos', 'Strapps Treino Par', 'Armagedon', 39.90, IMG.fitness[0],
    [{ label: 'Cor', options: ['Preto', 'Vermelho', 'Azul'] }],
    ['marca:Armagedon', 'tipo:Strapps', 'cor:Preto'],
    'Strapps de neoprene com velcro reforçado para treinos de puxada e agachamento.'));
  out.push(mk('ktp', 'fitness', 'acessorios-esportivos', 'Cinto Musculação Lombar', 'Rogue', 149.90, IMG.fitness[1],
    [{ label: 'Tamanho', options: ['S', 'M', 'L', 'XL'] }],
    ['marca:Rogue', 'tipo:Cinto', 'tamanho:M', 'material:Couro'],
    'Cinto de musculação de couro com suporte lombar reforçado para levantamento pesado.'));
  out.push(mk('ktp', 'fitness', 'acessorios-esportivos', 'Faixa Joelho Elástica 7mm', 'SBD', 189.90, IMG.fitness[2],
    [{ label: 'Tamanho', options: ['S', 'M', 'L', 'XL'] }],
    ['marca:SBD', 'tipo:Faixa', 'tamanho:M', 'material:Neoprene'],
    'Faixa de joelho em neoprene 7mm para suporte em agachamentos e levantamentos pesados.'));
  out.push(mk('ktp', 'fitness', 'acessorios-esportivos', 'Cinta Punhal Lombar', 'Armagedon', 49.90, IMG.fitness[3],
    [{ label: 'Tamanho', options: ['Único'] }],
    ['marca:Armagedon', 'tipo:Cinta', 'material:Neoprene'],
    'Cinta lombar elástica com ajuste velcro para suporte durante exercícios compostos.'));

  // === K-TP — Aparelhos & Equipamentos ===
  out.push(mk('ktp', 'fitness', 'aparelhos-equipamentos', 'Barra Fixa Porta', 'Power Fitness', 89.90, IMG.weights[0],
    [{ label: 'Modelo', options: ['Simples', 'Multifuncional'] }],
    ['marca:Power Fitness', 'tipo:Barra Fixa', 'material:Aço'],
    'Barra fixa para porta com sistema de encaixe sem parafusos, suporta até 120kg.'));
  out.push(mk('ktp', 'fitness', 'aparelhos-equipamentos', 'Par Halteres 20kg', 'Body Builder', 179.90, IMG.weights[1],
    [{ label: 'Peso', options: ['10kg', '20kg', '30kg'] }],
    ['marca:Body Builder', 'tipo:Halteres', 'peso:20kg', 'material:Ferro'],
    'Par de halteres de ferro fundido com empunhadura emborrachada antiderrapante.'));
  out.push(mk('ktp', 'fitness', 'aparelhos-equipamentos', 'Anilhas 5kg Par', 'Athletic', 69.90, IMG.weights[2],
    [{ label: 'Peso', options: ['2kg', '5kg', '10kg'] }],
    ['marca:Athletic', 'tipo:Anilhas', 'peso:5kg'],
    'Par de anilhas de ferro com revestimento de borracha para proteção do piso.'));
  out.push(mk('ktp', 'fitness', 'aparelhos-equipamentos', 'Barra Olímpica 20kg', 'Rogue', 599.90, IMG.weights[3],
    [{ label: 'Modelo', options: ['20kg', '15kg'] }],
    ['marca:Rogue', 'tipo:Barra', 'peso:20kg', 'material:Aço'],
    'Barra olímpica de aço com rolamentos de agulha, padrão IWF para crossfit e powerlifting.'));
  out.push(mk('ktp', 'fitness', 'aparelhos-equipamentos', 'Presilhas para Barra Olímpica Par', 'Rogue', 89.90, IMG.weights[0],
    [{ label: 'Tipo', options: ['Mola', 'Parafuso'] }],
    ['marca:Rogue', 'tipo:Presilhas', 'material:Aço'],
    'Par de presilhas para barra olímpica, trava rápida com mola de segurança.'));
  out.push(mk('ktp', 'fitness', 'aparelhos-equipamentos', 'Halter Ajustável 20kg Par', 'Power Fitness', 399.90, IMG.weights[1],
    [{ label: 'Peso Máx', options: ['15kg', '20kg', '25kg'] }],
    ['marca:Power Fitness', 'tipo:Halter Ajustável', 'peso:20kg'],
    'Par de halteres ajustáveis com seletor de peso, substitui vários pares em um só.'));

  // === K-AFORTUNADO — Empreendedorismo ===
  out.push(mk('kafortunado', 'empreendedorismo', 'ebooks', 'E-book: Empreendedor do Zero', 'Korvil', 29.90, IMG.books[0],
    [{ label: 'Formato', options: ['PDF', 'EPUB'] }],
    ['marca:Korvil', 'tipo:E-book', 'formato:PDF'],
    'Guia completo para abrir seu negócio do zero com planejamento e estratégia validados.'));
  out.push(mk('kafortunado', 'empreendedorismo', 'livros', 'Livro: Pai Rico Pai Pobre', 'Alta Books', 49.90, IMG.books[1],
    [{ label: 'Formato', options: ['Capa Dura', 'Brochura'] }],
    ['marca:Alta Books', 'tipo:Livro', 'autor:Robert Kiyosaki'],
    'Best-seller sobre educação financeira e mentalidade de riqueza.'));
  out.push(mk('kafortunado', 'empreendedorismo', 'materiais-trabalho', 'Kit Canetas Premium 10un', 'BIC', 39.90, IMG.books[2],
    [{ label: 'Cor', options: ['Sortido', 'Preto', 'Azul'] }],
    ['marca:BIC', 'tipo:Canetas', 'cor:Sortido'],
    'Kit de 10 canetas esferográficas premium com grip emborrachado para escrita confortável.'));
  out.push(mk('kafortunado', 'empreendedorismo', 'materiais-trabalho', 'Kit Lápis Grafite 12un + Boracha', 'Faber-Castell', 29.90, IMG.books[3],
    [{ label: 'Dureza', options: ['HB', '2B', '6B'] }],
    ['marca:Faber-Castell', 'tipo:Lápis', 'dureza:HB'],
    'Kit com 12 lápis de grafite premium + boracha, ideal para escritório e estudos.'));
  out.push(mk('kafortunado', 'empreendedorismo', 'materiais-trabalho', 'Caderno Executivo 200 folhas', 'Foroni', 49.90, IMG.books[4],
    [{ label: 'Cor', options: ['Preto', 'Azul', 'Marrom'] }],
    ['marca:Foroni', 'tipo:Caderno', 'material:Couro Sintético'],
    'Caderno executivo em couro sintético com 200 folhas pautadas e marcador.'));

  // === K-AFORTUNADO — Finanças ===
  out.push(mk('kafortunado', 'financas', 'ebooks-fin', 'E-book: Investindo em Ações', 'Korvil', 39.90, IMG.books[3],
    [{ label: 'Formato', options: ['PDF', 'EPUB'] }],
    ['marca:Korvil', 'tipo:E-book', 'formato:PDF'],
    'Aprenda a investir na bolsa de valores do básico ao avançado com exemplos práticos.'));
  out.push(mk('kafortunado', 'financas', 'livros-fin', 'Livro: A Psicologia Financeira', 'Harper Collins', 52.90, IMG.books[4],
    [{ label: 'Formato', options: ['Capa Dura', 'Brochura'] }],
    ['marca:Harper Collins', 'tipo:Livro', 'autor:Morgan Housel'],
    'O best-seller sobre como o comportamento afeta suas decisões financeiras.'));
  out.push(mk('kafortunado', 'financas', 'materiais-fin', 'Calculadora Científica', 'Casio', 119.90, IMG.books[2],
    [{ label: 'Modelo', options: ['fx-82', 'fx-99', 'fx-580'] }],
    ['marca:Casio', 'tipo:Calculadora', 'modelo:fx-99'],
    'Calculadora científica Casio com 417 funções, ideal para finanças e engenharia.'));
  out.push(mk('kafortunado', 'financas', 'materiais-fin', 'Lápis Contábil Dupla Cor 12un', 'Faber-Castell', 19.90, IMG.books[3],
    [{ label: 'Cor', options: ['Vermelho/Preto', 'Azul/Preto'] }],
    ['marca:Faber-Castell', 'tipo:Lápis Contábil', 'cor:Vermelho/Preto'],
    'Lápis contábil de dupla cor para marcação de livros fiscais e contábeis.'));
  out.push(mk('kafortunado', 'financas', 'materiais-fin', 'Kit Canetas Finas 6un', 'Stabilo', 34.90, IMG.books[4],
    [{ label: 'Cor', options: ['Sortido', 'Preto', 'Azul'] }],
    ['marca:Stabilo', 'tipo:Canetas Finas', 'cor:Sortido'],
    'Kit com 6 canetas finas point 0.4mm para escrita precisa em planilhas e documentos.'));

  // === K-ALMA — Massoterapia ===
  out.push(mk('kalma', 'massoterapia', 'oleos-essenciais', 'Óleo Essencial Lavanda 100ml', 'Taeq', 34.90, IMG.beauty[0],
    [{ label: 'Volume', options: ['30ml', '60ml', '100ml'] }],
    ['marca:Taeq', 'tipo:Óleo Essencial', 'volume:100ml'],
    'Óleo essencial puro de lavanda para massagem, aromaterapia e relaxamento.'));
  out.push(mk('kalma', 'massoterapia', 'oleos-essenciais', 'Creme Modelador Arnica 500ml', 'L\'bel', 49.90, IMG.beauty[1],
    [{ label: 'Volume', options: ['250ml', '500ml', '1L'] }],
    ['marca:L\'bel', 'tipo:Creme', 'volume:500ml'],
    'Creme modelador com arnica para massagem redutora e drenagem linfática.'));
  out.push(mk('kalma', 'massoterapia', 'oleos-essenciais', 'Óleo Essencial Pimenta-Negra 60ml', 'By Samia', 29.90, IMG.beauty[2],
    [{ label: 'Volume', options: ['30ml', '60ml'] }],
    ['marca:By Samia', 'tipo:Óleo Essencial', 'volume:60ml'],
    'Óleo essencial de pimenta-negra com ação termogênica para massagem muscular.'));
  out.push(mk('kalma', 'massoterapia', 'materiais-masso', 'Maca de Massagem Profissional', 'Fisio Form', 899.90, IMG.beauty[2],
    [{ label: 'Modelo', options: ['Fixa', 'Portátil', 'Reclinável'] }],
    ['marca:Fisio Form', 'tipo:Maca', 'material:Madeira'],
    'Maca de massagem profissional com espuma de alta densidade e estrutura reforçada.'));
  out.push(mk('kalma', 'massoterapia', 'materiais-masso', 'Maca de Ventosaterapia 12 Copos', 'Wudder', 89.90, IMG.beauty[3],
    [{ label: 'Quantidade', options: ['6 copos', '12 copos', '24 copos'] }],
    ['marca:Wudder', 'tipo:Ventosaterapia', 'material:Silicone'],
    'Kit de ventosas de silicone para terapia por ventosa, drenagem e relaxamento.'));
  out.push(mk('kalma', 'massoterapia', 'materiais-masso', 'Manta Térmica Elétrica Profissional', 'Carci', 129.90, IMG.beauty[0],
    [{ label: 'Modelo', options: ['Simples', 'Digital'] }],
    ['marca:Carci', 'tipo:Manta Térmica', 'voltagem:Bivolt'],
    'Manta térmica elétrica com controle de temperatura para tratamentos corporais.'));

  // === K-ALMA — Fisioterapia ===
  out.push(mk('kalma', 'fisioterapia', 'produtos-fisio', 'Bola Suíça 65cm', 'Kikos', 89.90, IMG.fitness[0],
    [{ label: 'Tamanho', options: ['55cm', '65cm', '75cm'] }],
    ['marca:Kikos', 'tipo:Bola', 'tamanho:65cm'],
    'Bola suíça anti-burst para fisioterapia, pilates e exercícios de core.'));
  out.push(mk('kalma', 'fisioterapia', 'materiais-fisio', 'Bastão de Pilates 90cm', 'Gepy', 69.90, IMG.fitness[1],
    [{ label: 'Tamanho', options: ['70cm', '90cm', '120cm'] }],
    ['marca:Gepy', 'tipo:Bastão', 'material:Alumínio'],
    'Bastão de pilates em alumínio para exercícios de mobilidade e fortalecimento.'));
  out.push(mk('kalma', 'fisioterapia', 'equipamentos-fisio', 'Tens 4 Canais Digital', 'Carci', 289.90, IMG.beauty[3],
    [{ label: 'Modelo', options: ['2 Canais', '4 Canais'] }],
    ['marca:Carci', 'tipo:TENS', 'voltagem:Bivolt'],
    'Aparelho TENS de 4 canais para analgesia e reabilitação muscular.'));
  out.push(mk('kalma', 'fisioterapia', 'aparelhos-fisio', 'Ultrassom Terapêutico 1MHz', 'Ibramed', 1890.00, IMG.beauty[1],
    [{ label: 'Modelo', options: ['1MHz', '3MHz'] }],
    ['marca:Ibramed', 'tipo:Ultrassom', 'voltagem:Bivolt'],
    'Aparelho de ultrassom terapêutico para fisioterapia e reabilitação tecidual.'));

  // === K-ALMA — Estética ===
  out.push(mk('kalma', 'estetica', 'produtos-estetica', 'Creme Anti-idade Vitamina C', 'Adcos', 129.90, IMG.beauty[0],
    [{ label: 'Volume', options: ['30ml', '50ml'] }],
    ['marca:Adcos', 'tipo:Creme', 'volume:50ml'],
    'Creme facial com vitamina C e ácido hialurônico para rejuvenescimento da pele.'));
  out.push(mk('kalma', 'estetica', 'aparelhos-estetica', 'Aparelho Microagulhamento', 'Dermtech', 599.90, IMG.beauty[1],
    [{ label: 'Modelo', options: ['Manual', 'Elétrico'] }],
    ['marca:Dermtech', 'tipo:Aparelho', 'voltagem:Bivolt'],
    'Aparelho de microagulhamento para estímulo de colágeno e tratamento de cicatrizes.'));

  // === K-ALMA — Dentista ===
  out.push(mk('kalma', 'dentista', 'produtos-dental', 'Kit Higiene Bucal Profissional', 'Curaprox', 79.90, IMG.dental[0],
    [{ label: 'Modelo', options: ['5460', '7430'] }],
    ['marca:Curaprox', 'tipo:Kit', 'marca:Curaprox'],
    'Kit com escova cerdas ultra macias, pasta e enxaguante para higiene profissional.'));
  out.push(mk('kalma', 'dentista', 'equipamentos-dental', 'Esterilizador Autoclave Dental', 'Cristófoli', 3890.00, IMG.dental[1],
    [{ label: 'Modelo', options: ['12L', '18L', '23L'] }],
    ['marca:Cristófoli', 'tipo:Autoclave', 'voltagem:220V'],
    'Autoclave dental digital com ciclo rápido e certificação ANVISA.'));

  // === K-ALMA — Terapia Holística ===
  out.push(mk('kalma', 'terapia-holistica', 'produtos-holistica', 'Incenso Aromaterapia Pacote 20un', 'Natura', 18.90, IMG.beauty[0],
    [{ label: 'Aroma', options: ['Lavanda', 'Sândalo', 'Palmarosa'] }],
    ['marca:Natura', 'tipo:Incenso', 'aroma:Lavanda'],
    'Incensos naturais para aromaterapia, meditação e equilíbrio energético.'));
  out.push(mk('kalma', 'terapia-holistica', 'materiais-holistica', 'Cristal Quartzo Rosa Bruto 200g', 'Cristais do Brasil', 49.90, IMG.beauty[1],
    [{ label: 'Peso', options: ['100g', '200g', '500g'] }],
    ['marca:Cristais do Brasil', 'tipo:Cristal', 'peso:200g'],
    'Cristal de quartzo rosa bruto para terapia holística e equilíbrio dos chakras.'));
  out.push(mk('kalma', 'terapia-holistica', 'equipamentos-holistica', 'Difusor de Aromas Ultrassônico', 'Gotas', 119.90, IMG.beauty[2],
    [{ label: 'Modelo', options: ['Madeira', 'Cerâmica'] }],
    ['marca:Gotas', 'tipo:Difusor', 'voltagem:Bivolt'],
    'Difusor de aromas ultrassônico com iluminação LED para aromaterapia ambiente.'));
  out.push(mk('kalma', 'terapia-holistica', 'aparelhos-holistica', 'Kit Pedras Quentas 16 peças', 'Therapy Stones', 159.90, IMG.beauty[3],
    [{ label: 'Quantidade', options: ['8 peças', '16 peças', '32 peças'] }],
    ['marca:Therapy Stones', 'tipo:Pedras Quentas', 'material:Basalto'],
    'Kit de pedras de basalto para massagem com pedras quentas e terapia holística.'));

  // === K-ALMA — Barbeiro ===
  out.push(mk('kalma', 'beleza', 'barbeiro', 'Máquina de Barbear Profissional', 'Panasonic', 329.90, IMG.barber[0],
    [{ label: 'Modelo', options: ['ER-DGP84', 'ER-SC60'] }],
    ['marca:Panasonic', 'tipo:Máquina', 'voltagem:Bivolt'],
    'Máquina de barbear profissional com lâmina de titanio e ajuste de comprimento.'));
  out.push(mk('kalma', 'beleza', 'barbeiro', 'Tesoura Barbeiro 6"', 'Kanso', 159.90, IMG.barber[1],
    [{ label: 'Tamanho', options: ['5.5"', '6"', '7"'] }],
    ['marca:Kanso', 'tipo:Tesoura', 'material:Aço Inox'],
    'Tesoura profissional de aço inox com fio convexo para cortes precisos.'));
  out.push(mk('kalma', 'beleza', 'barbeiro', 'Kit Pentes Profissionais 8un', 'Gato Preto', 39.90, IMG.barber[2],
    [{ label: 'Material', options: ['Plástico', 'Alumínio'] }],
    ['marca:Gato Preto', 'tipo:Pentes', 'material:Alumínio'],
    'Kit com 8 pentes de alumínio com numeração para diferentes comprimentos de corte.'));
  out.push(mk('kalma', 'beleza', 'barbeiro', 'Gel para Barbear Premium 150ml', 'Gillette', 24.90, IMG.barber[3],
    [{ label: 'Tipo', options: ['Gel', 'Espuma', 'Creme'] }],
    ['marca:Gillette', 'tipo:Gel', 'volume:150ml'],
    'Gel de barbear premium com hidratante para deslize suave e proteção da pele.'));
  out.push(mk('kalma', 'beleza', 'barbeiro', 'Maquininha Corte Ajustável Sem Fio', 'Wahl', 459.90, IMG.barber[0],
    [{ label: 'Modelo', options: ['Cordless', 'Com Fio'] }],
    ['marca:Wahl', 'tipo:Maquininha', 'voltagem:Bivolt'],
    'Maquininha de corte ajustável sem fio com bateria de 3h de duração contínua.'));

  // === K-ALMA — Cabeleireiro ===
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Secador Profissional 2200W', 'Taiff', 289.90, IMG.barber[3],
    [{ label: 'Modelo', options: ['Fox', 'Smart'] }, { label: 'Voltagem', options: ['110V', '220V'] }],
    ['marca:Taiff', 'tipo:Secador', 'voltagem:220V'],
    'Secador profissional Taiff com íons e temperatura controlável para secagem rápida.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Chapinha Cerâmica Profissional', 'Lola', 179.90, IMG.barber[0],
    [{ label: 'Largura', options: ['1"', '1.5"', '2"'] }, { label: 'Voltagem', options: ['110V', '220V'] }],
    ['marca:Lola', 'tipo:Chapinha', 'voltagem:Bivolt'],
    'Chapinha de cerâmica com placas flutuantes e temperatura ajustável até 230°C.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Tinta para Cabelo 100g', 'Wella', 49.90, IMG.beauty[3],
    [{ label: 'Cor', options: ['Loiro', 'Castanho', 'Preto', 'Ruivo'] }],
    ['marca:Wella', 'tipo:Tinta', 'cor:Castanho'],
    'Tinta permanente Wella com tecnologia nutritiva para cobertura uniforme.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Shampoo Detox 300ml', 'Lola', 32.90, IMG.beauty[0],
    [{ label: 'Volume', options: ['300ml', '500ml', '1L'] }],
    ['marca:Lola', 'tipo:Shampoo', 'volume:300ml'],
    'Shampoo detox purificante com carvão ativado para limpeza profunda do couro cabeludo.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Condicionador Hidratante 300ml', 'Truss', 38.90, IMG.beauty[1],
    [{ label: 'Volume', options: ['300ml', '500ml', '1L'] }],
    ['marca:Truss', 'tipo:Condicionador', 'volume:300ml'],
    'Condicionador hidratante com manteiga de karité e óleo de argan.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Máscara Tratamento 500g', 'Keune', 79.90, IMG.beauty[2],
    [{ label: 'Tipo', options: ['Hidratação', 'Reconstrução', 'Nutrição'] }],
    ['marca:Keune', 'tipo:Máscara', 'volume:500g'],
    'Máscara de tratamento capilar profundo com aminoácidos e proteínas.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Baby Liss Cone Profissional 25mm', 'Gama Italy', 199.90, IMG.barber[1],
    [{ label: 'Tamanho', options: ['19mm', '25mm', '32mm'] }, { label: 'Voltagem', options: ['110V', '220V'] }],
    ['marca:Gama Italy', 'tipo:Baby Liss', 'voltagem:Bivolt'],
    'Baby liss profissional em formato cone com revestimento cerâmico e turmalina.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Toca Luzes Descartável 10un', 'Vicenza', 19.90, IMG.barber[2],
    [{ label: 'Quantidade', options: ['5un', '10un', '30un'] }],
    ['marca:Vicenza', 'tipo:Toca Luzes', 'material:Alumínio'],
    'Tocas de alumínio para mechas e luzes, pacote com 10 unidades.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Escova Modeladora 100mm', 'Acca Kappa', 59.90, IMG.barber[3],
    [{ label: 'Tamanho', options: ['50mm', '75mm', '100mm'] }],
    ['marca:Acca Kappa', 'tipo:Escova', 'material:Madeira'],
    'Escova modeladora profissional com cerdas de javali e cabo de madeira.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Presilhas Cabelo Mix 20un', 'Pinz', 12.90, IMG.beauty[3],
    [{ label: 'Quantidade', options: ['10un', '20un', '50un'] }],
    ['marca:Pinz', 'tipo:Presilhas', 'material:Metal'],
    'Kit com 20 presilhas metálicas para segurar mechas durante cortes e coloração.'));

  // === NOVOS 40 PRODUTOS — 10 por setor ===

  // --- SISTEMA K +10 ---
  out.push(mk('sistema', 'servicos-profissionais', 'eletricista', 'Instalação Elétrica Residencial Completa', 'Korvil Serviços', 350.00, IMG.tools[0],
    [{ label: 'Tipo', options: ['Residencial', 'Comercial'] }, { label: 'Região', options: ['Capital', 'Baixada', 'Interior'] }],
    ['marca:Korvil Serviços', 'tipo:Serviço', 'região:Capital'],
    'Serviço de instalação elétrica residencial completa: troca de fiação, disjuntores, tomadas e pontos de luz com técnico credenciado.'));
  out.push(mk('sistema', 'servicos-profissionais', 'eletricista', 'Cabo Flexível 2.5mm Rolo 100m', 'Cobrecom', 189.00, IMG.tools[1],
    [{ label: 'Bitola', options: ['1.5mm', '2.5mm', '4mm', '6mm'] }, { label: 'Rolo', options: ['50m', '100m'] }],
    ['marca:Cobrecom', 'tipo:Cabo', 'bitola:2.5mm', 'material:Cobre'],
    'Rolo de cabo flexível de cobre 2.5mm para instalações elétricas residenciais e comerciais.'));
  out.push(mk('sistema', 'servicos-profissionais', 'eletricista', 'Disjuntor Unipolar 25A', 'GE', 28.90, IMG.tools[2],
    [{ label: 'Amperagem', options: ['10A', '16A', '25A', '40A', '63A'] }],
    ['marca:GE', 'tipo:Disjuntor', 'amperagem:25A'],
    'Disjuntor unipolar curva C 25A para proteção de circuitos elétricos contra sobrecarga e curto-circuito.'));
  out.push(mk('sistema', 'servicos-profissionais', 'carpinteiro', 'Serra Circular Manual 7"', 'Bosch', 219.90, IMG.tools[3],
    [{ label: 'Modelo', options: ['GKS 190', 'GKS 7000'] }, { label: 'Voltagem', options: ['110V', '220V', 'Bivolt'] }],
    ['marca:Bosch', 'tipo:Serra', 'voltagem:Bivolt', 'material:Aço'],
    'Serra circular Bosch com lâmina de 190mm, 1400W de potência e corte preciso em madeira e MDF.'));
  out.push(mk('sistema', 'servicos-profissionais', 'carpinteiro', 'Lixa D\'água Pacote 25un', '3M', 32.90, IMG.tools[0],
    [{ label: 'Grão', options: ['80', '120', '220', '400'] }],
    ['marca:3M', 'tipo:Lixa', 'grão:220'],
    'Pacote com 25 folhas de lixa d\'água para acabamento em madeira, metal e superfícies pintadas.'));
  out.push(mk('sistema', 'servicos-profissionais', 'faxineira', 'Diária de Faxina 8h', 'Korvil Serviços', 120.00, IMG.beauty[1],
    [{ label: 'Tipo', options: ['Diária 8h', 'Meia diária 4h'] }, { label: 'Região', options: ['Capital', 'Baixada'] }],
    ['marca:Korvil Serviços', 'tipo:Serviço', 'região:Capital'],
    'Diária de faxina com profissional qualificado: limpeza geral, cozinha, banheiros e quartos. Produtos inclusos.'));
  out.push(mk('sistema', 'servicos-profissionais', 'faxineira', 'Limpeza Pós-Obra Completa', 'Korvil Serviços', 280.00, IMG.beauty[2],
    [{ label: 'Tamanho', options: ['Apto 1-2 dorm', 'Casa térrea', 'Sobrado'] }],
    ['marca:Korvil Serviços', 'tipo:Serviço', 'tipo-limpeza:Pós-obra'],
    'Limpeza pós-obra: remoção de entulho, poeira, cimento e resíduos de pintura. Deixe pronto para mudar.'));
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'Criação de Loja Virtual Profissional', 'Korvil Tech', 899.00, IMG.electronics[1],
    [{ label: 'Plano', options: ['Básico', 'Profissional', 'Premium'] }],
    ['marca:Korvil Tech', 'tipo:Serviço', 'plano:Profissional'],
    'Criação de loja virtual completa: design responsivo, integração com Pix, gateway de pagamento e painel de gestão.'));
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'Sistema de Vendas com PDV', 'Korvil Tech', 1299.00, IMG.electronics[2],
    [{ label: 'Versão', options: ['Standard', 'Enterprise'] }],
    ['marca:Korvil Tech', 'tipo:Sistema', 'versão:Enterprise'],
    'Sistema de vendas completo com PDV, controle de estoque, relatórios financeiros e integração com e-commerce.'));
  out.push(mk('sistema', 'tecnologias', 'ecommerce', 'Roteador Wi-Fi 6 Mesh Pack 3', 'TP-Link', 599.90, IMG.electronics[3],
    [{ label: 'Modelo', options: ['Deco X20', 'Deco X60', 'Deco X75'] }],
    ['marca:TP-Link', 'tipo:Roteador', 'modelo:Deco X60'],
    'Sistema mesh Wi-Fi 6 com 3 unidades, cobertura até 550m² e velocidade até 3000Mbps.'));

  // --- K-TP +10 ---
  out.push(mk('ktp', 'fitness', 'suplementos', 'Pasta de Amendoim Integral 1kg', 'Growth', 27.90, IMG.fitness[3],
    [{ label: 'Sabor', options: ['Tradicional', 'Chocolate', 'Mel'] }, { label: 'Peso', options: ['500g', '1kg'] }],
    ['marca:Growth', 'tipo:Pasta', 'sabor:Tradicional', 'peso:1kg'],
    'Pasta de amendoim integral sem açúcar adicionado, rica em proteínas e gorduras boas.'));
  out.push(mk('ktp', 'fitness', 'suplementos', 'BCAA 2:1:1 240 cápsulas', 'Max Titanium', 69.90, IMG.fitness[4],
    [{ label: 'Quantidade', options: ['120 caps', '240 caps'] }],
    ['marca:Max Titanium', 'tipo:BCAA', 'quantidade:240 caps'],
    'BCAA 2:1:1 em cápsulas para recuperação muscular, redução de fadiga e proteção da massa magra.'));
  out.push(mk('ktp', 'fitness', 'suplementos', 'Hipercalórico 3kg', 'Growth', 149.90, IMG.fitness[0],
    [{ label: 'Sabor', options: ['Chocolate', 'Baunilha', 'Morango'] }, { label: 'Peso', options: ['1kg', '3kg'] }],
    ['marca:Growth', 'tipo:Hipercalórico', 'sabor:Chocolate', 'peso:3kg'],
    'Hipercalórico com 380kcal por dose para ganho de massa e peso de forma saudável.'));
  out.push(mk('ktp', 'fitness', 'produtos-alimentares', 'Aveia em Flocos 1kg', 'Taeq', 12.90, IMG.fitness[4],
    [{ label: 'Tipo', options: ['Flocos Finos', 'Flocos Grossos'] }, { label: 'Peso', options: ['500g', '1kg'] }],
    ['marca:Taeq', 'tipo:Aveia', 'peso:1kg'],
    'Aveia em flocos rica em fibras, ideal para vitaminas, bolos e consumo com frutas.'));
  out.push(mk('ktp', 'fitness', 'artigos-esportivos', 'Toalha Microfibra Esportiva', 'Athletic', 29.90, IMG.fitness[1],
    [{ label: 'Cor', options: ['Preto', 'Azul', 'Cinza', 'Verde'] }],
    ['marca:Athletic', 'tipo:Toalha', 'cor:Preto'],
    'Toalha de microfibra ultra absorvente, leve e compacta para academia e treinos.'));
  out.push(mk('ktp', 'fitness', 'vestuario', 'Shorts Treino Masculino', 'Olympikus', 49.90, IMG.clothes[0],
    [{ label: 'Tamanho', options: ['P', 'M', 'G', 'GG', 'XGG'] }, { label: 'Cor', options: ['Preto', 'Cinza', 'Azul'] }],
    ['marca:Olympikus', 'tipo:Shorts', 'tamanho:M', 'cor:Preto'],
    'Shorts de treino masculino com tecido leve, elástico na cintura e bolso interno.'));
  out.push(mk('ktp', 'fitness', 'calcados', 'Botina de Segurança Bico Aço', 'Marluvas', 189.90, IMG.shoes[2],
    [{ label: 'Tamanho', options: ['38', '39', '40', '41', '42', '43', '44'] }, { label: 'Cor', options: ['Preto', 'Marrom'] }],
    ['marca:Marluvas', 'tipo:Botina', 'tamanho:42', 'cor:Preto', 'material:Couro'],
    'Botina de segurança com bico de aço, solado antiderrapante e certificação NR-6.'));
  out.push(mk('ktp', 'fitness', 'acessorios-esportivos', 'Luva de Treino Feminina Par', 'Armagedon', 34.90, IMG.fitness[2],
    [{ label: 'Tamanho', options: ['P', 'M', 'G'] }, { label: 'Cor', options: ['Preto', 'Rosa', 'Cinza'] }],
    ['marca:Armagedon', 'tipo:Luva', 'tamanho:M', 'cor:Preto'],
    'Luva de treino com palma emborrachada antiderrapante e suporte para punho.'));
  out.push(mk('ktp', 'fitness', 'aparelhos-equipamentos', 'Banco Ajustável 3 Posições', 'Power Fitness', 299.90, IMG.weights[2],
    [{ label: 'Modelo', options: ['3 posições', '5 posições', 'Declinável'] }],
    ['marca:Power Fitness', 'tipo:Banco', 'material:Aço'],
    'Banco ajustável para musculação com 3 posições (plano, inclinado, declinado) e estrutura tubular reforçada.'));
  out.push(mk('ktp', 'fitness', 'aparelhos-equipamentos', 'Corda Naval 9m', 'Rogue', 119.90, IMG.weights[3],
    [{ label: 'Comprimento', options: ['6m', '9m', '12m'] }, { label: 'Espessura', options: ['38mm', '50mm'] }],
    ['marca:Rogue', 'tipo:Corda', 'comprimento:9m', 'material:Nylon'],
    'Corda naval para crossfit e condicionamento físico, construída em nylon resistente.'));

  // --- K-AFORTUNADO +10 ---
  out.push(mk('kafortunado', 'empreendedorismo', 'ebooks', 'E-book: Como Vender Online do Zero', 'Korvil', 34.90, IMG.books[0],
    [{ label: 'Formato', options: ['PDF', 'EPUB', 'Kindle'] }],
    ['marca:Korvil', 'tipo:E-book', 'formato:PDF'],
    'Guia prático para começar a vender online: plataformas, marketing, precificação e logística.'));
  out.push(mk('kafortunado', 'empreendedorismo', 'ebooks', 'E-book: Marketing Digital Prático', 'Korvil', 39.90, IMG.books[3],
    [{ label: 'Formato', options: ['PDF', 'EPUB'] }],
    ['marca:Korvil', 'tipo:E-book', 'formato:PDF'],
    'Aprenda marketing digital na prática: tráfego pago, redes sociais, e-mail marketing e funil de vendas.'));
  out.push(mk('kafortunado', 'empreendedorismo', 'livros', 'Livro: Mentalidade Milionária', 'Alta Books', 44.90, IMG.books[1],
    [{ label: 'Formato', options: ['Capa Dura', 'Brochura', 'Kindle'] }],
    ['marca:Alta Books', 'tipo:Livro', 'autor:T. Harv Eker'],
    'O best-seller sobre os 17 hábitos mentais que separam pessoas ricas das que nunca prosperam.'));
  out.push(mk('kafortunado', 'empreendedorismo', 'materiais-trabalho', 'Kit Materiais de Trabalho Empreendedor', 'Korvil', 89.90, IMG.books[2],
    [{ label: 'Itens', options: ['Kit Básico', 'Kit Completo', 'Kit Premium'] }],
    ['marca:Korvil', 'tipo:Kit', 'itens:Kit Completo'],
    'Kit com agenda, canetas, calculadora, bloco de notas e pasta executiva para o empreendedor organizado.'));
  out.push(mk('kafortunado', 'empreendedorismo', 'materiais-trabalho', 'Agenda Executiva 2026 Capa Dura', 'Foroni', 59.90, IMG.books[4],
    [{ label: 'Cor', options: ['Preto', 'Marrom', 'Azul'] }, { label: 'Modelo', options: ['Diária', 'Semanal'] }],
    ['marca:Foroni', 'tipo:Agenda', 'cor:Preto', 'material:Couro'],
    'Agenda executiva 2026 com capa em couro, calendário anual e páginas pautadas.'));
  out.push(mk('kafortunado', 'financas', 'ebooks-fin', 'E-book: Finanças Pessoais para Iniciantes', 'Korvil', 29.90, IMG.books[0],
    [{ label: 'Formato', options: ['PDF', 'EPUB'] }],
    ['marca:Korvil', 'tipo:E-book', 'formato:PDF'],
    'Aprenda a organizar suas finanças: orçamento, reserva de emergência, dívidas e primeiros investimentos.'));
  out.push(mk('kafortunado', 'financas', 'ebooks-fin', 'E-book: Controle de Gastos Mensal', 'Korvil', 19.90, IMG.books[3],
    [{ label: 'Formato', options: ['PDF', 'Planilha'] }],
    ['marca:Korvil', 'tipo:E-book', 'formato:PDF'],
    'Método simples para controlar gastos mensais e identificar onde seu dinheiro está indo.'));
  out.push(mk('kafortunado', 'financas', 'livros-fin', 'Livro: Investimentos para Iniciantes', 'Alta Books', 54.90, IMG.books[1],
    [{ label: 'Formato', options: ['Brochura', 'Kindle'] }],
    ['marca:Alta Books', 'tipo:Livro', 'autor:Marcos Silvestre'],
    'Guia de investimentos para quem está começando: renda fixa, ações, fundos imobiliários e mais.'));
  out.push(mk('kafortunado', 'financas', 'materiais-fin', 'Planilha Financeira Excel Premium', 'Korvil', 49.90, IMG.books[2],
    [{ label: 'Versão', options: ['Mensal', 'Anual', 'Familiar'] }],
    ['marca:Korvil', 'tipo:Planilha', 'versão:Anual'],
    'Planilha financeira em Excel com controle de receitas, despesas, metas e gráficos automáticos.'));
  out.push(mk('kafortunado', 'financas', 'materiais-fin', 'Organizador de Cartões e Contas', '3M', 24.90, IMG.books[4],
    [{ label: 'Modelo', options: ['12 divisórias', '24 divisórias'] }],
    ['marca:3M', 'tipo:Organizador', 'modelo:24 divisórias'],
    'Organizador com divisórias mensais para cartões, contas e comprovantes de pagamento.'));

  // --- K-ALMA +10 ---
  out.push(mk('kalma', 'massoterapia', 'oleos-essenciais', 'Óleo de Massagem Corporal Relaxante 200ml', 'Taeq', 29.90, IMG.beauty[0],
    [{ label: 'Aroma', options: ['Lavanda', 'Eucalipto', 'Camomila'] }, { label: 'Volume', options: ['100ml', '200ml'] }],
    ['marca:Taeq', 'tipo:Óleo', 'aroma:Lavanda', 'volume:200ml'],
    'Óleo de massagem corporal com base de amêndoas e essências relaxantes para massoterapia.'));
  out.push(mk('kalma', 'massoterapia', 'materiais-masso', 'Kit Pedras Quentes Basalto 20 peças', 'Therapy Stones', 129.90, IMG.beauty[3],
    [{ label: 'Quantidade', options: ['10 peças', '20 peças', '40 peças'] }],
    ['marca:Therapy Stones', 'tipo:Kit', 'material:Basalto', 'quantidade:20 peças'],
    'Kit de pedras quentes de basalto para massagem com pedras de tamanhos variados.'));
  out.push(mk('kalma', 'fisioterapia', 'produtos-fisio', 'Faixa Elástica de Resistência Kit 3 níveis', 'TheraBand', 59.90, IMG.fitness[0],
    [{ label: 'Nível', options: ['Iniciante', 'Intermediário', 'Avançado', 'Kit 3 níveis'] }],
    ['marca:TheraBand', 'tipo:Faixa', 'nível:Kit 3 níveis'],
    'Kit com 3 faixas elásticas de resistência (leve, média, pesada) para fisioterapia e reabilitação.'));
  out.push(mk('kalma', 'fisioterapia', 'aparelhos-fisio', 'Aparelho TENS Compacto 2 Canais', 'Carci', 199.90, IMG.beauty[1],
    [{ label: 'Modelo', options: ['2 Canais', '4 Canais'] }],
    ['marca:Carci', 'tipo:TENS', 'modelo:2 Canais', 'voltagem:Bivolt'],
    'Aparelho TENS compacto portátil com 2 canais e 20 modos para alívio de dores musculares.'));
  out.push(mk('kalma', 'estetica', 'aparelhos-estetica', 'Aparelho Vapor Facial Ozônio', 'L\'bel', 89.90, IMG.beauty[2],
    [{ label: 'Modelo', options: ['Básico', 'Com Ozônio', 'Profissional'] }],
    ['marca:L\'bel', 'tipo:Aparelho', 'modelo:Com Ozônio', 'voltagem:Bivolt'],
    'Aparelho de vapor facial com ozônio para limpeza profunda da pele e abertura dos poros.'));
  out.push(mk('kalma', 'estetica', 'produtos-estetica', 'Creme Hidratante Facial Ácido Hialurônico 50ml', 'Adcos', 79.90, IMG.beauty[0],
    [{ label: 'Volume', options: ['30ml', '50ml'] }, { label: 'Tipo', options: ['Normal', 'Seca', 'Oleosa'] }],
    ['marca:Adcos', 'tipo:Creme', 'volume:50ml', 'tipo-pele:Seca'],
    'Creme hidratante facial com ácido hialurônico para hidratação profunda e redução de linhas finas.'));
  out.push(mk('kalma', 'beleza', 'barbeiro', 'Kit Barbeiro Profissional 5 peças', 'Panasonic', 349.90, IMG.barber[0],
    [{ label: 'Itens', options: ['Kit 3 peças', 'Kit 5 peças', 'Kit 8 peças'] }],
    ['marca:Panasonic', 'tipo:Kit', 'itens:Kit 5 peças'],
    'Kit barbeiro profissional: máquina, tesoura, pente, navalha e capa de barbear.'));
  out.push(mk('kalma', 'beleza', 'barbeiro', 'Navalha Barbeiro Aço Inox', 'Kanso', 89.90, IMG.barber[1],
    [{ label: 'Modelo', options: ['Reta', 'Dobrável'] }],
    ['marca:Kanso', 'tipo:Navalha', 'material:Aço Inox'],
    'Navalha profissional de aço inox com cabo de madeira para barba e acabamento de precisão.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Cadeira Cabeleireiro Reclinável', 'Bel Design', 689.90, IMG.barber[3],
    [{ label: 'Cor', options: ['Preto', 'Vermelho', 'Branco'] }, { label: 'Modelo', options: ['Reclinável', 'Fixa'] }],
    ['marca:Bel Design', 'tipo:Cadeira', 'cor:Preto', 'material:Couro Sintético'],
    'Cadeira de cabeleireiro reclinável com base hidráulica giratória e encosto ajustável.'));
  out.push(mk('kalma', 'beleza', 'cabeleireiro', 'Secador Compacto 1875W Viagem', 'Taiff', 119.90, IMG.barber[2],
    [{ label: 'Modelo', options: ['Compacto', 'Dobrável'] }, { label: 'Voltagem', options: ['110V', '220V', 'Bivolt'] }],
    ['marca:Taiff', 'tipo:Secador', 'modelo:Dobrável', 'voltagem:Bivolt'],
    'Secador compacto dobrável de 1875W, ideal para viagens com potência de secador profissional.'));

  return out;
}

export const PRODUCTS = gen();

export const ALL_BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort();
