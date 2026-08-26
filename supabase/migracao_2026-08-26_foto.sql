-- MIGRAÇÃO: rode este arquivo no SQL Editor do Supabase
-- (https://supabase.com/dashboard/project/ctnyilyoyzutpqlnleqx/sql/new)
-- Adiciona a foto "antes" ao perfil. Seguro rodar mais de uma vez.
alter table public.profiles add column if not exists foto_antes text;
alter table public.profiles add column if not exists foto_antes_em timestamptz;
