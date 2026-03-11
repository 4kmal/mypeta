-- ============================================
-- Phase 1: Schema & Foundations
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT,
  avatar_url TEXT,
  selected_state TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  exp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'user_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (but not points/exp/level - those go through RPC)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do anything (for triggers and RPCs)
CREATE POLICY "Service role has full access"
  ON public.profiles
  USING (auth.role() = 'service_role');

-- 5. Add unique constraint on votes to prevent duplicate voting
-- (Only run if votes table exists and constraint doesn't already exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'votes' AND table_schema = 'public') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'votes_poll_user_unique') THEN
      ALTER TABLE public.votes ADD CONSTRAINT votes_poll_user_unique UNIQUE (poll_id, user_id);
    END IF;
  END IF;
END;
$$;

-- 6. Atomic gamification RPC
CREATE OR REPLACE FUNCTION public.award_gamification(
  p_user_id UUID,
  p_points INTEGER,
  p_exp INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_result JSON;
BEGIN
  -- Get current level
  SELECT level INTO v_old_level FROM public.profiles WHERE id = p_user_id;

  IF v_old_level IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- Atomic update of points, exp, and level
  UPDATE public.profiles
  SET
    points = points + p_points,
    exp = exp + p_exp,
    level = FLOOR((exp + p_exp) / 1000) + 1
  WHERE id = p_user_id
  RETURNING json_build_object(
    'points', points,
    'exp', exp,
    'level', level,
    'level_up', level > v_old_level
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- 7. Update user state RPC (now uses auth.uid() directly)
CREATE OR REPLACE FUNCTION public.update_user_state_v2(
  p_state_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET selected_state = p_state_id
  WHERE id = auth.uid();
END;
$$;

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_gamification TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_state_v2 TO authenticated;

-- 9. Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
