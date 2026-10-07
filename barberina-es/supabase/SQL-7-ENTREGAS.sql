-- ============================================================
-- SQL-7 — LIBERAÇÃO POR ENTREGA (rodar DEPOIS do SQL-6)
-- A EQUIPE aprova as clientes cuja encomenda foi entregue
-- inserindo/atualizando uma linha em app_entregas (pode ser feito
-- pela outra IA / painel / transportadora). O app consulta
-- app_estado_entrega ao abrir e a cada 60 s e libera sozinho.
-- ============================================================

create table if not exists app_entregas (
  tel          text primary key,              -- 9 dígitos, sem +34 (ex.: 612345678)
  estado       text not null default 'preparando'
               check (estado in ('preparando','enviado','reparto','entregado','devuelto')),
  entregado_em timestamptz,                    -- preenchido quando estado = 'entregado'
  pedido_id    text,
  nota         text,
  actualizado_em timestamptz not null default now()
);
alter table app_entregas enable row level security;   -- sem policies: anon NÃO lê a tabela

-- preenche entregado_em automaticamente
create or replace function app_entregas_touch() returns trigger language plpgsql as $$
begin
  new.tel := right(regexp_replace(new.tel, '\D', '', 'g'), 9);
  new.actualizado_em := now();
  if new.estado = 'entregado' and new.entregado_em is null then new.entregado_em := now(); end if;
  return new;
end $$;
drop trigger if exists trg_app_entregas_touch on app_entregas;
create trigger trg_app_entregas_touch before insert or update on app_entregas
for each row execute function app_entregas_touch();

-- RPC lida pelo app (só devolve o estado da PRÓPRIA cliente, autenticada por tel+PIN)
create or replace function app_estado_entrega(p_tel text, p_pin text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_tel text := right(regexp_replace(coalesce(p_tel, ''), '\D', '', 'g'), 9);
  e app_entregas;
begin
  if not exists (select 1 from app_usuarias where tel = v_tel and pin = p_pin) then
    return jsonb_build_object('ok', false, 'error', 'auth');
  end if;
  select * into e from app_entregas where tel = v_tel;
  if e.tel is null then
    return jsonb_build_object('ok', true, 'entregado', false, 'estado', null);
  end if;
  return jsonb_build_object(
    'ok', true,
    'entregado', e.estado = 'entregado',
    'entregado_em', e.entregado_em,
    'estado', e.estado
  );
end $$;
grant execute on function app_estado_entrega(text, text) to anon;

-- ------------------------------------------------------------
-- COMO A EQUIPE / OUTRA IA LIBERA UMA CLIENTE:
--   insert into app_entregas (tel, estado) values ('612345678', 'entregado')
--   on conflict (tel) do update set estado = 'entregado';
-- Estados intermediários (opcionais, aparecem no rastreio do app):
--   'preparando' → 'enviado' → 'reparto' → 'entregado'
-- ------------------------------------------------------------
