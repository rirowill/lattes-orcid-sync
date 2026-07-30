-- Execute este script no SQL Editor do Supabase (dashboard do projeto).
-- Cria a tabela de controle de uso e a única forma de acesso a ela: a função
-- consume_usage. A tabela em si não tem políticas de RLS permissivas, então
-- não pode ser lida/escrita diretamente pela Data API — só via RPC.

create table if not exists usage (
  email text primary key,
  uses_count integer not null default 0,
  created_at timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);

alter table usage enable row level security;

create or replace function public.consume_usage(p_email text, p_limit integer)
returns table(allowed boolean, remaining integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  insert into usage (email)
  values (p_email)
  on conflict (email) do nothing;

  select u.uses_count into current_count from usage u where u.email = p_email;

  if current_count >= p_limit then
    return query select false, 0;
  else
    update usage set uses_count = uses_count + 1, last_used_at = now()
    where email = p_email;
    return query select true, (p_limit - current_count - 1);
  end if;
end;
$$;

grant execute on function public.consume_usage(text, integer) to anon;

-- Tabela de feedback (erros reportados e sugestões). Mesma lógica de acesso:
-- RLS ligado, sem políticas permissivas, só acessível via submit_feedback.

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('erro', 'sugestao')),
  message text not null,
  email text,
  created_at timestamptz not null default now()
);

alter table feedback enable row level security;

create or replace function public.submit_feedback(p_type text, p_message text, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into feedback (type, message, email)
  values (p_type, p_message, nullif(trim(p_email), ''));
end;
$$;

grant execute on function public.submit_feedback(text, text, text) to anon;
