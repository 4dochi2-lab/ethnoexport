-- EthnoExport — Supabase şema qurulumu
-- Yeni layihədə: SQL Editor → bunu yapışdır → Run

-- ============ PROFILES ============
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text default 'artisan',
  name       text,
  phone      text,
  location   text,
  craft      text,
  website    text,
  social     text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- ============ PRODUCTS ============
create table if not exists public.products (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid references auth.users(id) on delete cascade,
  owner_name text,
  material   text,
  manat      numeric,
  landed     numeric,
  title      text,
  tags       jsonb default '[]'::jsonb,
  photo_url  text,
  photos     jsonb default '[]'::jsonb,
  status     text default 'wait',
  created_at timestamptz default now()
);
alter table public.products enable row level security;

drop policy if exists "own products read"  on public.products;
drop policy if exists "public live read"    on public.products;
drop policy if exists "own products insert" on public.products;
drop policy if exists "own products update" on public.products;
create policy "own products read"  on public.products for select using (auth.uid() = owner);
create policy "public live read"    on public.products for select using (status in ('live','sold','paid'));
create policy "own products insert" on public.products for insert with check (auth.uid() = owner);
create policy "own products update" on public.products for update using (auth.uid() = owner);

-- ============ ADMIN (profillərdə role='admin' olan istifadəçi) ============
-- Rekursiyanın qarşısını almaq üçün security-definer funksiya
create or replace function public.is_admin() returns boolean
  language sql security definer stable as
$$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

drop policy if exists "admin read profiles" on public.profiles;
drop policy if exists "admin all products"  on public.products;
create policy "admin read profiles" on public.profiles for select using (public.is_admin());
create policy "admin all products"  on public.products for all    using (public.is_admin());

-- ============ STORAGE (foto bucket) ============
insert into storage.buckets (id, name, public) values ('photos','photos',true)
  on conflict (id) do nothing;

drop policy if exists "photos public read"   on storage.objects;
drop policy if exists "photos auth upload"    on storage.objects;
create policy "photos public read" on storage.objects for select using (bucket_id = 'photos');
create policy "photos auth upload" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
