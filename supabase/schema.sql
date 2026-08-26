-- ============================================================
-- NoctaLev — Schema Supabase (Postgres + RLS)
-- Modelo de dados conforme briefing §10
-- ============================================================

-- PROFILES (1:1 com auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  peso_inicial numeric(5,1),
  peso_meta numeric(5,1),
  perfil_dificuldade text check (perfil_dificuldade in ('ansiedade','madrugada','fome_tarde','inchaco')),
  refluxo boolean default false,
  sensivel_cafeina boolean default false,
  fase_atual smallint default 1,
  receita_preparada_em timestamptz,
  preparo_iniciado_em timestamptz,
  fase2_liberada_em timestamptz,
  fase2_paga boolean default false,
  fase3_liberada_em timestamptz,
  fase3_paga boolean default false,
  role text default 'user' check (role in ('user','admin')),
  criado_em timestamptz default now()
);

-- CHECK-INS (1 por dia por usuária)
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,
  sono_qualidade smallint not null check (sono_qualidade between 1 and 5),
  horas_sono text not null check (horas_sono in ('<5','5-6','6-7','7-8','8+')),
  acordou_madrugada boolean not null,
  peso numeric(5,1),
  criado_em timestamptz default now(),
  editado_em timestamptz default now(),
  unique (user_id, data)
);

-- RITUAIS NOTURNOS (1 por dia)
create table public.rituais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,
  horario time not null,
  criado_em timestamptz default now(),
  unique (user_id, data)
);

-- CONQUISTAS
create table public.conquistas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null,
  desbloqueada_em timestamptz default now(),
  unique (user_id, tipo)
);

-- CONTEÚDOS editáveis via admin (receitas, bônus, frases)
create table public.conteudos (
  id uuid primary key default gen_random_uuid(),
  chave text unique not null,
  titulo text not null,
  corpo text,              -- markdown
  fase smallint,
  ordem smallint default 0,
  publicado boolean default true,
  atualizado_em timestamptz default now()
);

-- CONFIGURAÇÕES (parâmetros da progressão oculta, URLs de checkout)
create table public.configuracoes (
  chave text primary key,
  valor jsonb not null,
  atualizado_em timestamptz default now()
);

insert into public.configuracoes (chave, valor) values
  ('progressao', '{"diasInternos":7,"minCheckins":4,"maxDias":14,"curva":{"1":30,"2":45,"3":60,"4":72,"5":80,"6":95,"7":100}}'),
  ('checkout', '{"fase2":"https://pay.cakto.com.br/SEU-LINK-FASE-2","fase3":"https://pay.cakto.com.br/SEU-LINK-FASE-3"}'),
  ('suporte', '{"whatsapp":"https://wa.me/5500000000000","email":"suporte@noctalev.com.br"}');

-- NOTAS INTERNAS DO ADMIN
create table public.notas_admin (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  texto text not null,
  criado_em timestamptz default now()
);

-- ============================================================
-- RLS: usuária só lê/escreve os próprios dados; admin lê tudo
-- ============================================================
alter table public.profiles enable row level security;
alter table public.checkins enable row level security;
alter table public.rituais enable row level security;
alter table public.conquistas enable row level security;
alter table public.conteudos enable row level security;
alter table public.configuracoes enable row level security;
alter table public.notas_admin enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile insert" on public.profiles for insert with check (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid() or public.is_admin());

-- checkins / rituais / conquistas: dona ou admin
create policy "own checkins" on public.checkins for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "own rituais" on public.rituais for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "own conquistas" on public.conquistas for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());

-- conteúdos/config: leitura pública autenticada; escrita só admin
create policy "conteudos read" on public.conteudos for select using (auth.uid() is not null);
create policy "conteudos write" on public.conteudos for all using (public.is_admin()) with check (public.is_admin());
create policy "config read" on public.configuracoes for select using (auth.uid() is not null);
create policy "config write" on public.configuracoes for all using (public.is_admin()) with check (public.is_admin());

-- notas: só admin
create policy "notas admin" on public.notas_admin for all using (public.is_admin()) with check (public.is_admin());

-- Índices úteis para o painel admin
create index idx_checkins_user_data on public.checkins (user_id, data desc);
create index idx_rituais_user_data on public.rituais (user_id, data desc);

-- ============================================================
-- COMPRADORAS (liberação de acesso por email — integração Cakto)
-- Sem policies = acessível APENAS via service_role (servidor)
-- ============================================================
create table public.compradoras (
  email text primary key,
  produto text default 'fase1',
  fase2_paga boolean default false,
  fase3_paga boolean default false,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);
alter table public.compradoras enable row level security;

-- email no profile para o painel admin
alter table public.profiles add column if not exists email text;

-- gamificação persistida no perfil
alter table public.profiles add column if not exists pontos integer default 0;
alter table public.profiles add column if not exists celebracao_vista boolean default false;

-- foto "antes" (dataURL JPEG comprimido) — privada, protegida por RLS
alter table public.profiles add column if not exists foto_antes text;
alter table public.profiles add column if not exists foto_antes_em timestamptz;
