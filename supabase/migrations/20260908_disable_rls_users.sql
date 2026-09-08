-- Disable RLS on users table (backend API handles auth via Firebase token)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
