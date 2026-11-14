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

const IMG = {
  electronics: [
    'https://images.pexels.com/photos/11129922/pexels-photo-11129922.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/4249193/pexels-photo-4249193.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/14713024/pexels-photo-14713024.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/10703759/pexels-photo-10703759.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/9984695/pexels-photo-9984695.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  speaker: [
    'https://images.pexels.com/photos/14017595/pexels-photo-14017595.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/1279365/pexels-photo-1279365.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/20323501/pexels-photo-20323501.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  fitness: [
    'https://images.pexels.com/photos/34114667/pexels-photo-34114667.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/36429456/pexels-photo-36429456.png?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/16513595/pexels-photo-16513595.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/3640733/pexels-photo-3640733.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/31443914/pexels-photo-31443914.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  shoes: [
    'https://images.pexels.com/photos/260044/pexels-photo-260044.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/1456733/pexels-photo-1456733.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/40054159/pexels-photo-40054159.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  clothes: [
    'https://images.pexels.com/photos/5036893/pexels-photo-5036893.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/5000490/pexels-photo-5000490.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/13740531/pexels-photo-13740531.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  weights: [
    'https://images.pexels.com/photos/19025674/pexels-photo-19025674.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/19025671/pexels-photo-19025671.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/37887283/pexels-photo-37887283.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/4753885/pexels-photo-4753885.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  tools: [
    'https://images.pexels.com/photos/5846253/pexels-photo-5846253.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/220639/pexels-photo-220639.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/5484718/pexels-photo-5484718.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/4312846/pexels-photo-4312846.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  beauty: [
    'https://images.pexels.com/photos/8015487/pexels-photo-8015487.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/7795758/pexels-photo-7795758.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/8015475/pexels-photo-8015475.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/6621353/pexels-photo-6621353.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  barber: [
    'https://images.pexels.com/photos/897271/pexels-photo-897271.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/3993294/pexels-photo-3993294.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/13058791/pexels-photo-13058791.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/14612735/pexels-photo-14612735.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  dental: [
    'https://images.pexels.com/photos/6627668/pexels-photo-6627668.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/6812483/pexels-photo-6812483.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/6502746/pexels-photo-6502746.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
  books: [
    'https://images.pexels.com/photos/5632406/pexels-photo-5632406.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/5632400/pexels-photo-5632400.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/8099485/pexels-photo-8099485.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/18880909/pexels-photo-18880909.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
    'https://images.pexels.com/photos/36696606/pexels-photo-36696606.jpeg?auto=compress&cs=tinysrgb&h=400&w=400',
  ],
};

function installment(price: number): string {
  const x = Math.min(12, Math.max(1, Math.round(price / 25)));
  const v = (price / x).toFixed(2).replace('.', ',');
  return `${x}x R$ ${v}`;
}

function gen(): Product[] {
  const out: Product[] = [];
  let n = 0;
  const mk = (
    sector: string, category: string, sub: string,
    name: string, brand: string, price: number,
    image: string, variations: ProductVariation[],
    tags: string[],
    desc: string,
  ): Product => ({
    id: `kl-${++n}`,
    name, sector, category, subcategory: sub, brand,
    price, installment: installment(price),
    shipping: 'Frete grátis',
    rating: 4.8, reviews: Math.floor(80 + Math.random() * 420),
    seller: 'Korvil Store',
    image,
    description: desc,
    variations,
    tags,
  });

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

  return out;
}

export const PRODUCTS = gen();

export const ALL_BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort();
