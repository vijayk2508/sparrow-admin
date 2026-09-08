-- Disable RLS on admins table (backend API handles all admin access)
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;