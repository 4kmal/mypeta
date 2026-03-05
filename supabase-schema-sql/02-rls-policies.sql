-- =============================================================
-- MyPeta Supabase: Row Level Security Policies
-- Run AFTER 01-create-tables.sql
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- SELECT policies (public read access)
--
-- All tables allow public SELECT because:
-- - Poll data must be visible to all visitors
-- - Vote aggregation needs to read all votes
-- - Realtime subscription on users needs SELECT access
-- - No sensitive data is stored in these tables
-- - All write access is controlled via SECURITY DEFINER RPC functions
-- =============================================================

CREATE POLICY "Allow public read access"
    ON public.states FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access"
    ON public.polls FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access"
    ON public.poll_options FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access"
    ON public.votes FOR SELECT
    USING (true);

-- =============================================================
-- NOTE: No INSERT/UPDATE/DELETE policies are needed because
-- all write operations go through SECURITY DEFINER RPC functions
-- which bypass RLS entirely.
--
-- If you later add direct table access (e.g., admin dashboard),
-- you will need to add more restrictive write policies.
-- =============================================================
