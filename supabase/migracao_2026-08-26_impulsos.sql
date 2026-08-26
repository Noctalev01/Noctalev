-- Migração: Impulsos Naturais (aceleradores) + horários de rotina
-- Rode no SQL Editor do Supabase (uma vez).

alter table profiles add column if not exists hora_jantar time;
alter table profiles add column if not exists hora_deitar time;
alter table profiles add column if not exists impulsos jsonb default '{}'::jsonb;
alter table profiles add column if not exists impulsos_feitos jsonb default '{}'::jsonb;
