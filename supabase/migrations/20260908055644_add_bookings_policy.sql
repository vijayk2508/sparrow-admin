-- Fix bookings RLS policy to allow anonymous inserts from public booking form
drop policy if exists "bookings_insert" on public.bookings;

create policy "bookings_insert" 
on public.bookings 
for insert 
to anon, authenticated 
with check ("userName" is not null and "userEmail" is not null);
