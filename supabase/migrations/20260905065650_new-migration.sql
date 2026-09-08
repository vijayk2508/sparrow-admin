-- ============================================================
-- Sparrow Training Club — Supabase schema + RLS policies
-- ============================================================

-- ---------- 1. Admins --------------------------------------------------
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

insert into public.admins (email) values
  ('sparrowclubkotdwar@gmail.com'),
  ('official.vijay.2508@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql security definer stable
set search_path = public as
$$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.email(), ''))
  );
$$;

-- ---------- 2. Users (Firebase Auth ↔ Supabase link) ------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  firebase_uid text unique not null,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

-- ---------- 3. Content tables ----------------------------------------
create table if not exists public.coaches (
  id text primary key default gen_random_uuid()::text,
  "name" text not null,
  "role" text,
  "recordBadge" text,
  "bio" text,
  "image" text,
  "specialties" jsonb default '[]'::jsonb,
  "socials" jsonb default '{}'::jsonb,
  sort_order int,
  created_at timestamptz not null default now()
);

create table if not exists public.programs (
  id text primary key default gen_random_uuid()::text,
  "title" text not null,
  "category" text,
  "level" text,
  "badge" text,
  "duration" text,
  "price" numeric default 0,
  "period" text,
  "description" text,
  "image" text,
  "features" jsonb default '[]'::jsonb,
  "popular" boolean default false,
  sort_order int,
  created_at timestamptz not null default now()
);

create table if not exists public.schedule (
  id text primary key default gen_random_uuid()::text,
  "title" text not null,
  "serviceType" text,
  "coachName" text,
  "day" text,
  "time" text,
  "duration" text,
  "level" text,
  "colorTag" text,
  "description" text,
  "capacity" int default 0,
  "spotsLeft" int default 0,
  "price" numeric default 0,
  sort_order int,
  created_at timestamptz not null default now()
);

create table if not exists public.membership_plans (
  id text primary key default gen_random_uuid()::text,
  "name" text not null,
  "tagline" text,
  "price" numeric default 0,
  "currency" text default '$',
  "period" text,
  "badge" text,
  "popular" boolean default false,
  "features" jsonb default '[]'::jsonb,
  sort_order int,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id text primary key default gen_random_uuid()::text,
  "name" text not null,
  "age" int,
  "memberDuration" text,
  "quote" text,
  "resultBadge" text,
  "resultText" text,
  "avatar" text,
  "rating" numeric default 5,
  sort_order int,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id text primary key default gen_random_uuid()::text,
  "category" text,
  "image" text,
  "title" text,
  sort_order int,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key default gen_random_uuid()::text,
  "title" text not null,
  "description" text,
  "image" text,
  "date" text,
  "time" text,
  "location" text,
  "badge" text,
  "spots" text,
  sort_order int,
  created_at timestamptz not null default now()
);

-- ---------- 4. Site settings (single row) ----------------------------
create table if not exists public.site_settings (
  id text primary key default 'settings',
  "name" text,
  "phone" text,
  "email" text,
  "address" text,
  "logo" text,
  "favicon" text,
  "heroTitle" text,
  "heroSubtitle" text,
  "heroImage" text,
  "sessionFee" numeric default 0,
  "instagramUrl" text,
  "facebookUrl" text,
  "twitterUrl" text,
  "youtubeUrl" text,
  "mapEmbed" text,
  "whyChooseUs" jsonb default '[]'::jsonb,
  "faqs" jsonb default '[]'::jsonb,
  "galleryDescription" text,
  "bookingEnabled" boolean default true,
  "bookingDisabledMessage" text,
  "maintenanceMode" boolean default false,
  "paymentProvider" text,
  "paymentEnabled" boolean default false,
  "currencySymbol" text,
  "currencyCode" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

insert into public.site_settings (id) values ('settings')
on conflict (id) do nothing;

alter table public.site_settings enable row level security;
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- 5. User-generated content --------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  "userName" text not null,
  "userEmail" text not null,
  "userPhone" text,
  "serviceType" text,
  "bookingDate" text,
  "bookingTime" text,
  "notes" text,
  "status" text default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  "userName" text,
  "userEmail" text,
  "amount" numeric,
  "currency" text,
  "status" text default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  "userName" text,
  "userEmail" text,
  "plan" text,
  "status" text default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.contact_queries (
  id uuid primary key default gen_random_uuid(),
  "name" text not null,
  "email" text not null,
  "phone" text,
  "subject" text,
  "message" text,
  "status" text default 'pending',
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.memberships enable row level security;
alter table public.contact_queries enable row level security;

-- RLS policies for user-generated content
drop policy if exists "bookings_insert" on public.bookings;
create policy "bookings_insert" on public.bookings for insert to anon, authenticated with check ("userName" is not null and "userEmail" is not null);
drop policy if exists "bookings_admin_read" on public.bookings;
create policy "bookings_admin_read" on public.bookings for select to authenticated using (public.is_admin());
drop policy if exists "bookings_admin_update" on public.bookings;
create policy "bookings_admin_update" on public.bookings for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "bookings_admin_delete" on public.bookings;
create policy "bookings_admin_delete" on public.bookings for delete to authenticated using (public.is_admin());

drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert" on public.payments for insert to anon, authenticated with check ("amount" is not null);
drop policy if exists "payments_admin_read" on public.payments;
create policy "payments_admin_read" on public.payments for select to authenticated using (public.is_admin());
drop policy if exists "payments_admin_update" on public.payments;
create policy "payments_admin_update" on public.payments for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "payments_admin_delete" on public.payments;
create policy "payments_admin_delete" on public.payments for delete to authenticated using (public.is_admin());

drop policy if exists "memberships_insert" on public.memberships;
create policy "memberships_insert" on public.memberships for insert to anon, authenticated with check ("userEmail" is not null);
drop policy if exists "memberships_admin_read" on public.memberships;
create policy "memberships_admin_read" on public.memberships for select to authenticated using (public.is_admin());
drop policy if exists "memberships_admin_update" on public.memberships;
create policy "memberships_admin_update" on public.memberships for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "memberships_admin_delete" on public.memberships;
create policy "memberships_admin_delete" on public.memberships for delete to authenticated using (public.is_admin());

drop policy if exists "queries_insert" on public.contact_queries;
create policy "queries_insert" on public.contact_queries for insert to anon, authenticated with check ("name" is not null and "email" is not null);
drop policy if exists "queries_admin_read" on public.contact_queries;
create policy "queries_admin_read" on public.contact_queries for select to authenticated using (public.is_admin());
drop policy if exists "queries_admin_update" on public.contact_queries;
create policy "queries_admin_update" on public.contact_queries for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "queries_admin_delete" on public.contact_queries;
create policy "queries_admin_delete" on public.contact_queries for delete to authenticated using (public.is_admin());

-- ---------- 6. Realtime ---------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.coaches;
  alter publication supabase_realtime add table public.programs;
  alter publication supabase_realtime add table public.schedule;
  alter publication supabase_realtime add table public.membership_plans;
  alter publication supabase_realtime add table public.testimonials;
  alter publication supabase_realtime add table public.gallery;
  alter publication supabase_realtime add table public.events;
  alter publication supabase_realtime add table public.site_settings;
  alter publication supabase_realtime add table public.bookings;
  alter publication supabase_realtime add table public.payments;
  alter publication supabase_realtime add table public.memberships;
  alter publication supabase_realtime add table public.contact_queries;
  alter publication supabase_realtime add table public.users;
exception
  when duplicate_object then null;
  when others then null;
end $$;

-- ---------- 7. Storage bucket ----------------------------------------
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

drop policy if exists "uploads_public_read" on storage.objects;
create policy "uploads_public_read" on storage.objects for select using (bucket_id = 'uploads');
drop policy if exists "uploads_admin_insert" on storage.objects;
create policy "uploads_admin_insert" on storage.objects for insert to authenticated with check (bucket_id = 'uploads' and public.is_admin());
drop policy if exists "uploads_admin_update" on storage.objects;
create policy "uploads_admin_update" on storage.objects for update to authenticated using (bucket_id = 'uploads' and public.is_admin());
drop policy if exists "uploads_admin_delete" on storage.objects;
create policy "uploads_admin_delete" on storage.objects for delete to authenticated using (bucket_id = 'uploads' and public.is_admin());
