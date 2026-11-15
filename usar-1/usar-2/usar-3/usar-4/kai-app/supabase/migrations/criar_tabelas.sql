-- K-AI App - Tabelas Supabase
create table if not exists public.kai_projetos (id uuid default gen_random_uuid() primary key, nome text not null, descricao text, arquivos jsonb default '[]'::jsonb, created_at timestamptz default now());
create table if not exists public.kai_mensagens (id uuid default gen_random_uuid() primary key, projeto_id uuid references public.kai_projetos(id) on delete cascade, papel text, conteudo text, created_at timestamptz default now());
alter table public.kai_projetos enable row level security;
alter table public.kai_mensagens enable row level security;
create policy "leitura publica projetos" on public.kai_projetos for select using (true);
create policy "escrita publica projetos" on public.kai_projetos for insert with check (true);
create policy "update publica projetos" on public.kai_projetos for update using (true);
create policy "leitura publica mensagens" on public.kai_mensagens for select using (true);
create policy "escrita publica mensagens" on public.kai_mensagens for insert with check (true);