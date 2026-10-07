-- =====================================================================
--  BARBERINA ESPAÑA · APP "Mi acompañamiento" — SQL COMPLETO (único)
--  Cole TUDO no Supabase → SQL Editor → New query → Run.
--  Pode rodar mais de uma vez (é idempotente). Não depende de outros SQL.
--
--  Modelo:
--   • A EQUIPE cria a clienta (nome, email, telefone, pedido) → recebe um LINK
--     próprio  https://SEU-APP/a/<token>  e manda por WhatsApp/email.
--   • A clienta abre o link e já entra com o nome dela (não digita nada).
--     Também pode entrar pelo email em /entrar.
--   • Tudo fica bloqueado até a equipe marcar o pedido como 'entregado'.
--     O app verifica sozinho (ao abrir e a cada 60 s) e libera.
-- =====================================================================

-- ---------- 1. TABELAS ----------
create table if not exists bm_clientas (
  id            uuid primary key default gen_random_uuid(),
  token         text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  nombre        text not null,                      -- como aparece no grupo: "María J."
  email         text,
  telefono      text,                               -- 9 dígitos, só para a equipe (nunca aparece no app)
  ciudad        text,
  pedido_id     text,
  estado_envio  text not null default 'preparando'
                check (estado_envio in ('preparando','enviado','reparto','entregado','devuelto','cancelado')),
  entregado_em  timestamptz,
  peso_inicial  numeric(5,1),
  objetivo      numeric(4,1),
  altura        numeric(5,1),
  edad          int,
  avatar        text default '🌸',
  publico       boolean not null default true,
  ultimo_acceso timestamptz,
  creado_em     timestamptz not null default now(),
  actualizado_em timestamptz not null default now()
);
create unique index if not exists bm_clientas_email_uk on bm_clientas (lower(email)) where email is not null;
create index if not exists bm_clientas_tel_ix on bm_clientas (telefono);

create table if not exists bm_registros (
  clienta_id  uuid not null references bm_clientas(id) on delete cascade,
  fecha       date not null,
  peso        numeric(5,1),
  sueno       smallint check (sueno between 1 and 5),
  despertares smallint,
  energia     smallint,
  antojos     smallint,
  tomo        boolean,
  nota        text,
  creado_em   timestamptz not null default now(),
  primary key (clienta_id, fecha)
);

-- RLS ligada e SEM policies: o app (chave anon) não lê as tabelas direto,
-- só pelas funções abaixo, que validam o token.
alter table bm_clientas  enable row level security;
alter table bm_registros enable row level security;

-- ---------- 2. GATILHOS ----------
create or replace function bm_clientas_touch() returns trigger language plpgsql as $$
begin
  if new.telefono is not null then new.telefono := right(regexp_replace(new.telefono, '\D', '', 'g'), 9); end if;
  if new.email is not null then new.email := lower(trim(new.email)); end if;
  new.actualizado_em := now();
  if new.estado_envio = 'entregado' and new.entregado_em is null then new.entregado_em := now(); end if;
  if new.estado_envio <> 'entregado' then new.entregado_em := null; end if;
  return new;
end $$;
drop trigger if exists trg_bm_clientas_touch on bm_clientas;
create trigger trg_bm_clientas_touch before insert or update on bm_clientas
for each row execute function bm_clientas_touch();

-- ---------- 3. FUNÇÕES QUE O APP USA (chave anon) ----------
create or replace function bm_json(c bm_clientas) returns jsonb language sql stable as $$
  select jsonb_build_object(
    'token', c.token, 'nombre', c.nombre, 'ciudad', c.ciudad,
    'estado_envio', c.estado_envio, 'entregado_em', c.entregado_em,
    'peso_inicial', c.peso_inicial, 'objetivo', c.objetivo, 'altura', c.altura, 'edad', c.edad,
    'avatar', c.avatar, 'publico', c.publico, 'creado_em', c.creado_em)
$$;

-- entrar pelo link próprio
create or replace function bm_acceso(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c bm_clientas;
begin
  select * into c from bm_clientas where token = trim(p_token);
  if c.id is null then return jsonb_build_object('ok', false, 'error', 'link'); end if;
  if c.estado_envio in ('devuelto','cancelado') then return jsonb_build_object('ok', false, 'error', 'cancelado'); end if;
  update bm_clientas set ultimo_acceso = now() where id = c.id;
  return jsonb_build_object('ok', true, 'clienta', bm_json(c));
end $$;

-- entrar pelo email (devolve o mesmo token do link)
create or replace function bm_acceso_email(p_email text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c bm_clientas;
begin
  select * into c from bm_clientas where lower(email) = lower(trim(p_email));
  if c.id is null then return jsonb_build_object('ok', false, 'error', 'email'); end if;
  if c.estado_envio in ('devuelto','cancelado') then return jsonb_build_object('ok', false, 'error', 'cancelado'); end if;
  update bm_clientas set ultimo_acceso = now() where id = c.id;
  return jsonb_build_object('ok', true, 'clienta', bm_json(c));
end $$;

-- estado do pedido (o app pergunta a cada 60 s enquanto espera)
create or replace function bm_estado(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c bm_clientas;
begin
  select * into c from bm_clientas where token = trim(p_token);
  if c.id is null then return jsonb_build_object('ok', false, 'error', 'link'); end if;
  return jsonb_build_object('ok', true, 'estado', c.estado_envio,
    'entregado', c.estado_envio = 'entregado', 'entregado_em', c.entregado_em);
end $$;

-- perfil (peso inicial, objetivo, avatar...). Nome NÃO é editável pela clienta.
create or replace function bm_perfil(p_token text, p_peso_inicial numeric default null, p_objetivo numeric default null,
  p_altura numeric default null, p_edad int default null, p_avatar text default null, p_publico boolean default null, p_ciudad text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from bm_clientas where token = trim(p_token);
  if v_id is null then return jsonb_build_object('ok', false, 'error', 'link'); end if;
  update bm_clientas set
    peso_inicial = coalesce(p_peso_inicial, peso_inicial),
    objetivo     = coalesce(p_objetivo, objetivo),
    altura       = coalesce(p_altura, altura),
    edad         = coalesce(p_edad, edad),
    avatar       = coalesce(left(p_avatar, 8), avatar),
    publico      = coalesce(p_publico, publico),
    ciudad       = coalesce(nullif(left(trim(p_ciudad), 40), ''), ciudad)
  where id = v_id;
  return jsonb_build_object('ok', true);
end $$;

-- registro diário (1 por dia, upsert)
create or replace function bm_registrar(p_token text, p_fecha date, p_peso numeric default null, p_sueno int default null,
  p_despertares int default null, p_energia int default null, p_antojos int default null, p_tomo boolean default null, p_nota text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from bm_clientas where token = trim(p_token);
  if v_id is null then return jsonb_build_object('ok', false, 'error', 'link'); end if;
  if p_fecha > (now() at time zone 'Europe/Madrid')::date + 1 or p_fecha < (now() at time zone 'Europe/Madrid')::date - 60 then
    return jsonb_build_object('ok', false, 'error', 'fecha');
  end if;
  insert into bm_registros (clienta_id, fecha, peso, sueno, despertares, energia, antojos, tomo, nota)
  values (v_id, p_fecha, p_peso, p_sueno, p_despertares, p_energia, p_antojos, p_tomo, left(p_nota, 280))
  on conflict (clienta_id, fecha) do update set
    peso = coalesce(excluded.peso, bm_registros.peso),
    sueno = coalesce(excluded.sueno, bm_registros.sueno),
    despertares = coalesce(excluded.despertares, bm_registros.despertares),
    energia = coalesce(excluded.energia, bm_registros.energia),
    antojos = coalesce(excluded.antojos, bm_registros.antojos),
    tomo = coalesce(excluded.tomo, bm_registros.tomo),
    nota = coalesce(excluded.nota, bm_registros.nota);
  return jsonb_build_object('ok', true, 'fecha', p_fecha);
end $$;

-- histórico privado da clienta
create or replace function bm_mis_registros(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from bm_clientas where token = trim(p_token);
  if v_id is null then return '[]'::jsonb; end if;
  return coalesce((select jsonb_agg(to_jsonb(r) - 'clienta_id' order by r.fecha)
                   from bm_registros r where r.clienta_id = v_id), '[]'::jsonb);
end $$;

-- ---------- 4. FUNÇÕES DA EQUIPE / OUTRA IA (só service_role ou SQL Editor) ----------
-- cria (ou atualiza) a clienta e devolve o token do link
create or replace function bm_crear_clienta(p_nombre text, p_email text default null, p_telefono text default null,
  p_ciudad text default null, p_pedido_id text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare c bm_clientas;
begin
  select * into c from bm_clientas
   where (p_email is not null and lower(email) = lower(trim(p_email)))
      or (p_telefono is not null and telefono = right(regexp_replace(p_telefono, '\D', '', 'g'), 9))
   limit 1;
  if c.id is null then
    insert into bm_clientas (nombre, email, telefono, ciudad, pedido_id)
    values (trim(p_nombre), p_email, p_telefono, p_ciudad, p_pedido_id) returning * into c;
  else
    update bm_clientas set nombre = coalesce(nullif(trim(p_nombre), ''), nombre), email = coalesce(p_email, email),
      telefono = coalesce(p_telefono, telefono), ciudad = coalesce(p_ciudad, ciudad), pedido_id = coalesce(p_pedido_id, pedido_id)
    where id = c.id returning * into c;
  end if;
  return jsonb_build_object('ok', true, 'id', c.id, 'token', c.token, 'nombre', c.nombre);
end $$;

-- muda o estado do envio por token, email, telefone ou pedido_id
-- p_estado: 'preparando' | 'enviado' | 'reparto' | 'entregado' | 'devuelto' | 'cancelado'
create or replace function bm_marcar_envio(p_busca text, p_estado text default 'entregado')
returns jsonb language plpgsql security definer set search_path = public as $$
declare n int;
begin
  update bm_clientas set estado_envio = p_estado
   where token = trim(p_busca) or lower(email) = lower(trim(p_busca))
      or telefono = right(regexp_replace(p_busca, '\D', '', 'g'), 9) or pedido_id = trim(p_busca);
  get diagnostics n = row_count;
  return jsonb_build_object('ok', n > 0, 'actualizadas', n);
end $$;

-- ---------- 5. PERMISSÕES ----------
revoke all on function bm_crear_clienta(text, text, text, text, text) from public, anon, authenticated;
revoke all on function bm_marcar_envio(text, text) from public, anon, authenticated;
grant execute on function bm_crear_clienta(text, text, text, text, text) to service_role;
grant execute on function bm_marcar_envio(text, text) to service_role;

grant execute on function bm_acceso(text) to anon, authenticated;
grant execute on function bm_acceso_email(text) to anon, authenticated;
grant execute on function bm_estado(text) to anon, authenticated;
grant execute on function bm_perfil(text, numeric, numeric, numeric, int, text, boolean, text) to anon, authenticated;
grant execute on function bm_registrar(text, date, numeric, int, int, int, int, boolean, text) to anon, authenticated;
grant execute on function bm_mis_registros(text) to anon, authenticated;

-- recarrega a API do Supabase para enxergar as funções novas
notify pgrst, 'reload schema';

-- =====================================================================
--  EXEMPLOS (rodar no SQL Editor quando quiser):
--  Criar clienta e pegar o link:
--    select bm_crear_clienta('María J.', 'maria@gmail.com', '612345678', 'Madrid', 'PED-1001');
--    → {"token": "a1b2c3d4e5f6", ...}  →  link: https://SEU-APP/a/a1b2c3d4e5f6
--  Marcar como entregado (libera o app sozinho em até 60 s):
--    select bm_marcar_envio('maria@gmail.com', 'entregado');
--  Ver todas:
--    select nombre, email, telefono, estado_envio, token, ultimo_acceso from bm_clientas order by creado_em desc;
-- =====================================================================
