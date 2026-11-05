import { supabase } from '@/lib/korvilAuth';

export const DONOS = [
  'korvilloja@gmail.com',
  'korvil.p@gmail.com',
  'korvil.tp@gmail.com',
  'sistemak.srv@gmail.com',
  'saydavid02@gmail.com',
  'saykorvil@gmail.com',
  'kalmacdc@gmail.com',
  'kafortunado@gmail.com',
];

export const PROJETO = 'KORVIL App';

interface AppConfig {
  versao: string;
  setores: string[];
  portavel: boolean;
  central: string;
  dono_central: string;
  funciona_em: string[];
  criado: string;
}

export async function carregarConfig(): Promise<AppConfig | null> {
  try {
    const { data } = await supabase
      .from('app_config')
      .select('config')
      .eq('projeto_id', PROJETO)
      .limit(1)
      .maybeSingle();
    return (data?.config as AppConfig) ?? null;
  } catch {
    return null;
  }
}

export async function salvarConfig(cfg: AppConfig): Promise<void> {
  await supabase.from('app_config').upsert(
    {
      projeto_id: PROJETO,
      dono: 'sistemak.srv@gmail.com',
      config: cfg,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'projeto_id' }
  );
}

export async function initApp(): Promise<AppConfig | null> {
  let cfg = await carregarConfig();
  if (!cfg) {
    cfg = {
      versao: '1.0-portavel',
      setores: ['KORVIL', 'SISTEMA K', 'K-TP', 'K-AFORTUNADO', 'K-ALMA', 'KORVIL Loja', 'K-OMFOME', 'TRANSFORMAÇÃO'],
      portavel: true,
      central: 'supabase-sistemak',
      dono_central: 'sistemak.srv@gmail.com',
      funciona_em: DONOS,
      criado: new Date().toISOString(),
    };
    await salvarConfig(cfg);
  }
  return cfg;
}
