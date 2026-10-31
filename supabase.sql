-- Replace these two values with your Supabase admin email, then run in SQL Editor.
create table if not exists public.vetatlas_animals (
  id text primary key,
  name jsonb not null default '{}'::jsonb
);

create table if not exists public.vetatlas_diseases (
  id text not null,
  animal text not null references public.vetatlas_animals(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  primary key (animal, id)
);

insert into public.vetatlas_animals (id, name) values
  ('cattle', '{"en":"Cattle","ku":"مانگا","ar":"الأبقار"}'::jsonb),
  ('sheep', '{"en":"Sheep","ku":"مەڕ","ar":"الأغنام"}'::jsonb)
on conflict (id) do update set name = excluded.name;

alter table public.vetatlas_animals enable row level security;
alter table public.vetatlas_diseases enable row level security;

drop policy if exists "vetatlas public read animals" on public.vetatlas_animals;
drop policy if exists "vetatlas admin animals" on public.vetatlas_animals;
drop policy if exists "vetatlas public read diseases" on public.vetatlas_diseases;
drop policy if exists "vetatlas admin diseases" on public.vetatlas_diseases;

create policy "vetatlas public read animals" on public.vetatlas_animals for select using (true);
create policy "vetatlas admin animals" on public.vetatlas_animals for all using ((auth.jwt() ->> 'email') = 'admin@example.com') with check ((auth.jwt() ->> 'email') = 'admin@example.com');
create policy "vetatlas public read diseases" on public.vetatlas_diseases for select using (true);
create policy "vetatlas admin diseases" on public.vetatlas_diseases for all using ((auth.jwt() ->> 'email') = 'admin@example.com') with check ((auth.jwt() ->> 'email') = 'admin@example.com');

insert into storage.buckets (id, name, public)
values ('vetatlas-images', 'vetatlas-images', true)
on conflict (id) do update set public = true;

drop policy if exists "vetatlas public image read" on storage.objects;
drop policy if exists "vetatlas admin image write" on storage.objects;
drop policy if exists "vetatlas admin image update" on storage.objects;
drop policy if exists "vetatlas admin image delete" on storage.objects;
create policy "vetatlas public image read" on storage.objects for select using (bucket_id = 'vetatlas-images');
create policy "vetatlas admin image write" on storage.objects for insert with check (bucket_id = 'vetatlas-images' and (auth.jwt() ->> 'email') = 'admin@example.com');
create policy "vetatlas admin image update" on storage.objects for update using (bucket_id = 'vetatlas-images' and (auth.jwt() ->> 'email') = 'admin@example.com') with check (bucket_id = 'vetatlas-images' and (auth.jwt() ->> 'email') = 'admin@example.com');
create policy "vetatlas admin image delete" on storage.objects for delete using (bucket_id = 'vetatlas-images' and (auth.jwt() ->> 'email') = 'admin@example.com');
