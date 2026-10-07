-- ============================================================
-- SQL-7 — Desbloqueio por FRASCO RECEBIDO (rodar DEPOIS do SQL-6)
-- O app fica com quase tudo bloqueado até a cliente receber o frasco
-- (COD: ela só paga ao receber). Duas formas de liberar:
--   1) a cliente digita o código impresso no folheto da caixa → RPC app_frasco_recibido
--   2) o backend (transportadora/Camila/crear_pedido) grava frasco_recibido_em
--      direto em app_usuarias — o app lê isso no login (app_login → usuaria.frasco_recibido_em)
-- ============================================================

alter table app_usuarias add column if not exists frasco_recibido_em timestamptz;
alter table app_usuarias add column if not exists frasco_codigo text;

-- códigos válidos (um por lote / campanha). Trocar à vontade.
create table if not exists app_codigos_frasco (
  codigo text primary key,
  activo boolean not null default true,
  creado_em timestamptz not null default now()
);
insert into app_codigos_frasco (codigo) values ('BMAX') on conflict do nothing;
alter table app_codigos_frasco enable row level security; -- sem policies: anon não lê

create or replace function app_frasco_recibido(p_tel text, p_pin text, p_codigo text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tel text := right(regexp_replace(coalesce(p_tel, ''), '\D', '', 'g'), 9);
  v_ok boolean;
begin
  if not exists (select 1 from app_usuarias where tel = v_tel and pin = p_pin) then
    return jsonb_build_object('ok', false, 'error', 'auth');
  end if;
  select exists(select 1 from app_codigos_frasco where codigo = upper(trim(p_codigo)) and activo) into v_ok;
  if not v_ok then
    return jsonb_build_object('ok', false, 'error', 'codigo');
  end if;
  update app_usuarias
     set frasco_recibido_em = coalesce(frasco_recibido_em, now()),
         frasco_codigo = upper(trim(p_codigo))
   where tel = v_tel;
  insert into app_feed (tipo, texto)
  select 'logro', coalesce(nombre, 'Una compañera') || ' ha recibido su Barberina Max 📦'
    from app_usuarias where tel = v_tel and publico;
  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function app_frasco_recibido(text, text, text) to anon;

-- NOTA: confira os nomes de colunas (tel, pin, nombre, publico) e de app_feed (tipo, texto)
-- com o SQL-6. Se diferirem, ajuste aqui antes de rodar. Garanta que app_login
-- devolva frasco_recibido_em dentro de "usuaria" (to_jsonb(u) já devolve).
