-- ============================================================
-- Sparrow Training Club — Supabase schema + RLS policies
-- One-time setup: Supabase Dashboard -> SQL Editor -> paste & Run
-- ============================================================

-- ---------- 1. Admins --------------------------------------------------
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

-- NOTE: fix the first email if your Gmail address is
-- 'sparrowclubkotdwara@gmail.com' (with a trailing "a")
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
-- Firebase owns authentication; this table links a Firebase UID to the
-- application profile. role is derived from the `admins` table server-side.
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
-- No direct client policies: all access runs through the service-role key
-- in the backend API, which verifies the Firebase ID token first.

-- ---------- 3. Content tables (public read, admin write) --------------
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
  "type" text,
  "title" text not null,
  "dateMonth" text,
  "dateDay" text,
  "time" text,
  "price" numeric default 0,
  "priceLabel" text,
  "location" text,
  "description" text,
  "capacityText" text,
  "image" text,
  sort_order int,
  created_at timestamptz not null default now()
);

-- ---------- 3. Site settings (single row, id = 'settings') -----
create table if not exists public.site_settings (
  id text primary key default 'settings',
  "name" text,
  "tagline" text,
  "subtext" text,
  "city" text,
  "address" text,
  "phone" text,
  "email" text,
  "establishedYear" text,
  "heroImage" text,
  "sessionFee" numeric default 25,
  "currency" text default '$',
  "heroSubtext" text,
  "socials" jsonb default '{}'::jsonb,
  "hours" jsonb default '{}'::jsonb,
  "heroStats" jsonb default '[]'::jsonb,
  "whyChooseUs" jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- 4. User-generated tables ---------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  "userName" text not null,
  "userEmail" text not null,
  "userPhone" text,
  "serviceType" text,
  "classTitle" text,
  "coachName" text,
  "date" text,
  "timeSlot" text,
  "status" text default 'confirmed',
  "paymentStatus" text default 'pay_at_gym',
  "amount" numeric default 0,
  "notes" text,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  "razorpayOrderId" text,
  "razorpayPaymentId" text,
  "amount" numeric default 0,
  "currency" text default 'INR',
  "userEmail" text,
  "userName" text,
  "planOrSession" text,
  "status" text default 'captured',
  "createdAt" timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  "userName" text,
  "userEmail" text,
  "planName" text,
  "amount" numeric default 0,
  "billingCycle" text,
  "startDate" text,
  "status" text default 'active',
  "paymentId" text,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.contact_queries (
  id uuid primary key default gen_random_uuid(),
  "name" text not null,
  "email" text not null,
  "phone" text,
  "subject" text,
  "message" text not null,
  "status" text default 'new',
  "createdAt" timestamptz not null default now()
);

-- ---------- 5. Row Level Security -------------------------------
alter table public.admins enable row level security;
alter table public.coaches enable row level security;
alter table public.programs enable row level security;
alter table public.schedule enable row level security;
alter table public.membership_plans enable row level security;
alter table public.testimonials enable row level security;
alter table public.gallery enable row level security;
alter table public.events enable row level security;
alter table public.site_settings enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.memberships enable row level security;
alter table public.contact_queries enable row level security;

-- Content + settings: everyone reads, admins write
create policy "coaches_public_read" on public.coaches for select using (true);
create policy "coaches_admin_write" on public.coaches for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "programs_public_read" on public.programs for select using (true);
create policy "programs_admin_write" on public.programs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "schedule_public_read" on public.schedule for select using (true);
create policy "schedule_admin_write" on public.schedule for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "plans_public_read" on public.membership_plans for select using (true);
create policy "plans_admin_write" on public.membership_plans for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "testimonials_public_read" on public.testimonials for select using (true);
create policy "testimonials_admin_write" on public.testimonials for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "gallery_public_read" on public.gallery for select using (true);
create policy "gallery_admin_write" on public.gallery for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "events_public_read" on public.events for select using (true);
create policy "events_admin_write" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "settings_public_read" on public.site_settings for select using (true);
create policy "settings_admin_write" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- User-generated: anyone submits, admins read/update/delete
create policy "bookings_insert" on public.bookings for insert to anon, authenticated with check ("userName" is not null and "userEmail" is not null);
create policy "bookings_admin_read" on public.bookings for select to authenticated using (public.is_admin());
create policy "bookings_admin_update" on public.bookings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "bookings_admin_delete" on public.bookings for delete to authenticated using (public.is_admin());
create policy "payments_insert" on public.payments for insert to anon, authenticated with check ("amount" is not null);
create policy "payments_admin_read" on public.payments for select to authenticated using (public.is_admin());
create policy "payments_admin_update" on public.payments for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "payments_admin_delete" on public.payments for delete to authenticated using (public.is_admin());
create policy "memberships_insert" on public.memberships for insert to anon, authenticated with check ("userEmail" is not null);
create policy "memberships_admin_read" on public.memberships for select to authenticated using (public.is_admin());
create policy "memberships_admin_update" on public.memberships for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "memberships_admin_delete" on public.memberships for delete to authenticated using (public.is_admin());
create policy "queries_insert" on public.contact_queries for insert to anon, authenticated with check ("name" is not null and "email" is not null);
create policy "queries_admin_read" on public.contact_queries for select to authenticated using (public.is_admin());
create policy "queries_admin_update" on public.contact_queries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "queries_admin_delete" on public.contact_queries for delete to authenticated using (public.is_admin());

-- ---------- 6. Realtime (live updates in admin + site) ----------
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
  when duplicate_object then null; -- table already in publication
  when others then null;           -- publication may not exist yet
end $$;

-- ---------- 7. Storage bucket (image uploads) --------------------
-- Path convention (server-enforced): uploads/users/{firebase_uid}/...
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do update set public = true;

create policy "uploads_public_read" on storage.objects for select using (bucket_id = 'uploads');
create policy "uploads_admin_insert" on storage.objects for insert to authenticated with check (bucket_id = 'uploads' and public.is_admin());
create policy "uploads_admin_update" on storage.objects for update to authenticated using (bucket_id = 'uploads' and public.is_admin());
create policy "uploads_admin_delete" on storage.objects for delete to authenticated using (bucket_id = 'uploads' and public.is_admin());