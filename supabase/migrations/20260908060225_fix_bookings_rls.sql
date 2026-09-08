-- Drop all existing policies on bookings
drop policy if exists "bookings_insert" on public.bookings;
drop policy if exists "bookings_admin_read" on public.bookings;
drop policy if exists "bookings_admin_update" on public.bookings;
drop policy if exists "bookings_admin_delete" on public.bookings;

-- Create comprehensive policies for bookings
-- Allow anyone to insert (public booking form)
create policy "bookings_insert" 
on public.bookings 
for insert 
to anon, authenticated 
with check (true);

-- Allow anyone to select their own bookings
create policy "bookings_select" 
on public.bookings 
for select 
to anon, authenticated 
using (true);

-- Allow admins to update
create policy "bookings_admin_update" 
on public.bookings 
for update 
to authenticated 
using (public.is_admin())
with check (public.is_admin());

-- Allow admins to delete
create policy "bookings_admin_delete" 
on public.bookings 
for delete 
to authenticated 
using (public.is_admin());
