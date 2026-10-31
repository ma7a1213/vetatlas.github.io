create table if not exists public.conditions (
  id text primary key,
  animal text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.conditions enable row level security;
grant usage on schema public to anon, authenticated;

revoke all on public.conditions from anon, authenticated;
grant select, insert, update, delete on public.conditions to anon, authenticated;

drop policy if exists "Public can read conditions" on public.conditions;
drop policy if exists "Public can insert conditions" on public.conditions;
drop policy if exists "Public can update conditions" on public.conditions;
drop policy if exists "Public can delete conditions" on public.conditions;

create policy "Public can read conditions"
on public.conditions for select using (true);

create policy "Public can insert conditions"
on public.conditions for insert with check (true);

create policy "Public can update conditions"
on public.conditions for update using (true) with check (true);

create policy "Public can delete conditions"
on public.conditions for delete using (true);

-- Optional realtime support for immediate cross-device updates.
alter publication supabase_realtime add table public.conditions;
