-- Disable RLS on admins table for backend API access
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Seed admin emails (run this on cloud Supabase to whitelist admin users)
INSERT INTO admins (email) VALUES
  ('sparrowclubkotdwar@gmail.com'),
  ('official.vijay.2508@gmail.com')
ON CONFLICT (email) DO NOTHING;
