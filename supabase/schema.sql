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

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Arena Fighter',
  avatar_url text not null default '',
  points integer not null default 0,
  rank text not null default 'Rookie',
  total_squats integer not null default 0,
  solo_sessions integer not null default 0,
  battle_matches integer not null default 0,
  battle_wins integer not null default 0,
  battle_losses integer not null default 0,
  best_stage integer not null default 1,
  daily_checkin_on date,
  daily_challenge_completed_on date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists profiles_points_idx on public.profiles (points desc);

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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.rooms enable row level security;

drop policy if exists "public can read rooms" on public.rooms;
create policy "public can read rooms"
on public.rooms
for select
to anon, authenticated
using (true);

alter table public.profiles enable row level security;

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

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
