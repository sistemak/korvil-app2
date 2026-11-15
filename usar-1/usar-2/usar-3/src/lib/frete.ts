/* Cálculo de frete por bairro — tabela interna da Korvil-Loja.
   Não mostra lista de bairros pro usuário, só calcula automaticamente. */

export interface FreteResult {
  clientePaga: number;
  entregadorGanha: number;
}

const TABELA: { match: string[]; clientePaga: number; entregadorGanha: number }[] = [
  { match: ['boracéia', 'boracea'], clientePaga: 45, entregadorGanha: 34 },
  { match: ['guaratuba'], clientePaga: 38, entregadorGanha: 29 },
  { match: ['costa do sol'], clientePaga: 35, entregadorGanha: 27 },
  { match: ['morada da praia'], clientePaga: 32, entregadorGanha: 25 },
  { match: ['são lourenço', 'sao lourenco', 'riviera'], clientePaga: 25, entregadorGanha: 20 },
  { match: ['indaiá', 'indaia'], clientePaga: 15, entregadorGanha: 13 },
  { match: ['vista linda', 'chácaras', 'chacaras'], clientePaga: 10, entregadorGanha: 9 },
  { match: ['jd albatroz', 'jardim albatroz', 'vdc', 'vd c'], clientePaga: 8, entregadorGanha: 7 },
  { match: ['centro'], clientePaga: 8, entregadorGanha: 7 },
  { match: ['maitinga'], clientePaga: 7, entregadorGanha: 7 },
  { match: ['rio da praia'], clientePaga: 6, entregadorGanha: 6 },
  { match: ['jd raphael', 'jardim raphael', 'buriqui'], clientePaga: 10, entregadorGanha: 8 },
  { match: ['caiubura'], clientePaga: 18, entregadorGanha: 16 },
  { match: ['são joão', 'sao joao', 'prainha'], clientePaga: 18, entregadorGanha: 15 },
  { match: ['caruara'], clientePaga: 35, entregadorGanha: 29 },
];

const DEFAULT_FRETE: FreteResult = { clientePaga: 8, entregadorGanha: 7 };

export function getFreteByBairro(bairro: string): FreteResult {
  const lower = bairro.trim().toLowerCase();
  for (const entry of TABELA) {
    if (entry.match.some((m) => lower.includes(m))) {
      return { clientePaga: entry.clientePaga, entregadorGanha: entry.entregadorGanha };
    }
  }
  return DEFAULT_FRETE;
}
