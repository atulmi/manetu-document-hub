-- Profiles: one row per authenticated user, auto-created on signup.
-- This is deliberately separate from the app's RoleSwitcher (public.profiles
-- has nothing to do with viewer/developer/auditor/etc. demo roles) — it only
-- identifies who is allowed to use the agent at all on a hosted deployment.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usage log: one row per agent run, used to enforce a daily per-user quota
-- against the shared Claude API key on a hosted deployment. Rows are
-- written by the backend with the service role key, which bypasses RLS,
-- so there is no insert policy for regular users here.
create table public.usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.usage_log enable row level security;

create policy "Users can view their own usage"
  on public.usage_log for select
  using (auth.uid() = user_id);

create index usage_log_user_id_created_at_idx
  on public.usage_log (user_id, created_at desc);
