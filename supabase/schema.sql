-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Enums
create type lead_origin as enum ('anuncio', 'lp', 'organico', 'indicacao');
create type lead_stage  as enum ('novo', 'contato', 'orcamento', 'agendado', 'fechado', 'perdido');

-- profiles: one per authenticated user / studio
create table profiles (
  id          uuid references auth.users on delete cascade primary key,
  studio_name text not null,
  created_at  timestamptz default now()
);

-- leads
create table leads (
  id         uuid primary key default gen_random_uuid(),
  studio_id  uuid references profiles(id) on delete cascade not null,
  name       text not null,
  phone      text not null,
  origin     lead_origin not null,
  stage      lead_stage  not null default 'novo',
  notes      text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- lead_history: log of every stage change
create table lead_history (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid references leads(id) on delete cascade not null,
  from_stage text,
  to_stage   text not null,
  changed_at timestamptz default now()
);

-- Trigger: keep updated_at current on any leads UPDATE
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at();

-- Trigger: auto-create profile when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, studio_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'studio_name', 'Meu Estúdio')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Row Level Security
alter table profiles     enable row level security;
alter table leads        enable row level security;
alter table lead_history enable row level security;

create policy "own profile" on profiles
  for all using (id = auth.uid());

create policy "own leads" on leads
  for all using (studio_id = auth.uid());

create policy "own history" on lead_history
  for all using (
    lead_id in (select id from leads where studio_id = auth.uid())
  );
