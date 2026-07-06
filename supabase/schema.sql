create table if not exists public.rooms (
  code text primary key,
  status text not null default 'lobby' check (status in ('lobby', 'live', 'finished')),
  started_at timestamptz,
  match_duration_ms integer not null default 60000,
  player1_id uuid not null,
  player1_name text not null default '',
  player1_score integer not null default 0,
  player2_id uuid not null,
  player2_name text not null default '',
  player2_score integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists rooms_updated_at_idx on public.rooms (updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
before update on public.rooms
for each row
execute function public.set_updated_at();

alter table public.rooms enable row level security;

drop policy if exists "public can read rooms" on public.rooms;
create policy "public can read rooms"
on public.rooms
for select
to anon, authenticated
using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rooms'
  ) then
    alter publication supabase_realtime add table public.rooms;
  end if;
end;
$$;
