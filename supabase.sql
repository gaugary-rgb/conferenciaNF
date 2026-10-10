-- Controle de Entrega NF-e — tabela Supabase
-- Rode no SQL Editor do Supabase (uma vez).
-- Corresponde ao provider 'supabase' em src/lib/backend.js

create table if not exists public.entregas (
  id uuid primary key default gen_random_uuid(),
  numero_nfe text not null,
  chave text not null constraint entregas_chave_key unique,
  entregador text,
  created_at timestamptz not null default now()
);

create index if not exists idx_entregas_numero on public.entregas (numero_nfe);
create index if not exists idx_entregas_created on public.entregas (created_at desc);

-- RLS: para o MVP com anon key, libera INSERT + SELECT.
-- Depois restrinja (ex.: só autenticados) quando ativar login.
alter table public.entregas enable row level security;

drop policy if exists "entregas_insert_anon" on public.entregas;
create policy "entregas_insert_anon"
  on public.entregas for insert to anon
  with check (true);

drop policy if exists "entregas_select_anon" on public.entregas;
create policy "entregas_select_anon"
  on public.entregas for select to anon
  using (true);
