import { createClient } from '@supabase/supabase-js';

const TRANSFORMACAO_SUPABASE_URL = 'https://vbckzfvqarcjadqxmdqc.supabase.co';
const TRANSFORMACAO_SUPABASE_KEY = 'sb_publishable_wLgarwd2MbIyT0ZSRvk6AA_bVH68AvD';

export const transformacaoDb = createClient(TRANSFORMACAO_SUPABASE_URL, TRANSFORMACAO_SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

export const TABELA_INSCRICOES = 'inscricoes_projeto_transformacao';
