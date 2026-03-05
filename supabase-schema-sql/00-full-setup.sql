-- =============================================================
-- MyPeta Supabase: FULL SETUP (Combined Script)
--
-- This is a combined version of all individual SQL scripts.
-- Run this single file in Supabase SQL Editor to set up
-- the entire database from scratch.
--
-- Individual scripts (if you prefer running step by step):
--   01-create-tables.sql  - Table DDL
--   02-rls-policies.sql   - Row Level Security
--   03-rpc-functions.sql  - PostgreSQL RPC functions
--   04-seed-data.sql      - States + 20 system polls
-- =============================================================


-- =============================================================
-- PART 1: CREATE TABLES
-- =============================================================

CREATE TABLE IF NOT EXISTS public.states (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    username TEXT,
    email TEXT,
    profile_picture_url TEXT,
    selected_state TEXT REFERENCES public.states(id),
    points INTEGER DEFAULT 0,
    exp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_id TEXT UNIQUE,
    question TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_system_poll BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    label TEXT NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(poll_id, option_index)
);

CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    poll_option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
    option_index INTEGER NOT NULL,
    user_state TEXT REFERENCES public.states(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(poll_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON public.users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_points ON public.users(points);
CREATE INDEX IF NOT EXISTS idx_polls_category ON public.polls(category);
CREATE INDEX IF NOT EXISTS idx_polls_is_active ON public.polls(is_active);
CREATE INDEX IF NOT EXISTS idx_polls_created_at ON public.polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poll_options_poll_id ON public.poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_poll_id ON public.votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_state ON public.votes(user_state);


-- =============================================================
-- PART 2: ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.states FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.votes FOR SELECT USING (true);


-- =============================================================
-- PART 3: RPC FUNCTIONS
-- =============================================================

-- get_or_create_user
CREATE OR REPLACE FUNCTION public.get_or_create_user(
    p_clerk_user_id TEXT,
    p_username TEXT,
    p_email TEXT,
    p_profile_picture_url TEXT
)
RETURNS TABLE (
    user_id UUID,
    selected_state TEXT,
    points INTEGER,
    exp INTEGER,
    is_new_user BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_selected_state TEXT;
    v_points INTEGER;
    v_exp INTEGER;
    v_is_new BOOLEAN := false;
BEGIN
    SELECT u.id, u.selected_state, u.points, u.exp
    INTO v_user_id, v_selected_state, v_points, v_exp
    FROM public.users u
    WHERE u.clerk_user_id = p_clerk_user_id;

    IF v_user_id IS NULL THEN
        INSERT INTO public.users (clerk_user_id, username, email, profile_picture_url, points, exp)
        VALUES (p_clerk_user_id, p_username, p_email, p_profile_picture_url, 0, 0)
        RETURNING id, public.users.selected_state, public.users.points, public.users.exp
        INTO v_user_id, v_selected_state, v_points, v_exp;
        v_is_new := true;
    ELSE
        UPDATE public.users
        SET last_login = now(),
            username = COALESCE(p_username, username),
            profile_picture_url = COALESCE(p_profile_picture_url, profile_picture_url),
            updated_at = now()
        WHERE id = v_user_id;
    END IF;

    RETURN QUERY SELECT v_user_id, v_selected_state, v_points, v_exp, v_is_new;
END;
$$;

-- update_user_state
CREATE OR REPLACE FUNCTION public.update_user_state(
    p_clerk_user_id TEXT,
    p_state_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users
    SET selected_state = p_state_id,
        updated_at = now()
    WHERE clerk_user_id = p_clerk_user_id;
END;
$$;

-- update_user_points_exp
CREATE OR REPLACE FUNCTION public.update_user_points_exp(
    p_clerk_user_id TEXT,
    p_points_delta INTEGER,
    p_exp_delta INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users
    SET points = points + p_points_delta,
        exp = exp + p_exp_delta,
        updated_at = now()
    WHERE clerk_user_id = p_clerk_user_id;
END;
$$;

-- cast_vote
CREATE OR REPLACE FUNCTION public.cast_vote(
    p_poll_id UUID,
    p_option_id UUID,
    p_option_index INTEGER,
    p_user_state TEXT,
    p_clerk_user_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_exp_earned INTEGER := 10;
    v_points_earned INTEGER := 10;
    v_old_exp INTEGER;
    v_new_exp INTEGER;
    v_old_level INTEGER;
    v_new_level INTEGER;
BEGIN
    SELECT id, exp INTO v_user_id, v_old_exp
    FROM public.users WHERE clerk_user_id = p_clerk_user_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF EXISTS (SELECT 1 FROM public.votes WHERE poll_id = p_poll_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'User has already voted on this poll';
    END IF;

    INSERT INTO public.votes (poll_id, user_id, poll_option_id, option_index, user_state)
    VALUES (p_poll_id, v_user_id, p_option_id, p_option_index, p_user_state);

    UPDATE public.users
    SET points = points + v_points_earned,
        exp = exp + v_exp_earned,
        updated_at = now()
    WHERE id = v_user_id
    RETURNING exp INTO v_new_exp;

    v_old_level := floor(v_old_exp / 1000) + 1;
    v_new_level := floor(v_new_exp / 1000) + 1;

    RETURN jsonb_build_object(
        'success', true,
        'points_earned', v_points_earned,
        'exp_earned', v_exp_earned,
        'new_level', v_new_level,
        'leveled_up', v_new_level > v_old_level
    );
END;
$$;

-- create_poll
CREATE OR REPLACE FUNCTION public.create_poll(
    p_question TEXT,
    p_description TEXT,
    p_category TEXT,
    p_options JSONB,
    p_clerk_user_id TEXT,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_poll_id UUID;
    v_option JSONB;
    v_index INTEGER := 0;
    v_exp_earned INTEGER := 200;
    v_cost INTEGER := 200;
    v_points INTEGER;
    v_old_exp INTEGER;
    v_new_exp INTEGER;
    v_old_level INTEGER;
    v_new_level INTEGER;
BEGIN
    SELECT id, points, exp
    INTO v_user_id, v_points, v_old_exp
    FROM public.users WHERE clerk_user_id = p_clerk_user_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF v_points < v_cost THEN
        RAISE EXCEPTION 'Insufficient points. Need % points.', v_cost;
    END IF;

    INSERT INTO public.polls (question, description, category, created_by, is_system_poll, end_date)
    VALUES (p_question, p_description, p_category, v_user_id, false, p_end_date)
    RETURNING id INTO v_poll_id;

    FOR v_option IN SELECT * FROM jsonb_array_elements(p_options)
    LOOP
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji)
        VALUES (v_poll_id, v_index, v_option->>'label', v_option->>'emoji');
        v_index := v_index + 1;
    END LOOP;

    UPDATE public.users
    SET points = points - v_cost,
        exp = exp + v_exp_earned,
        updated_at = now()
    WHERE id = v_user_id
    RETURNING exp INTO v_new_exp;

    v_old_level := floor(v_old_exp / 1000) + 1;
    v_new_level := floor(v_new_exp / 1000) + 1;

    RETURN jsonb_build_object(
        'poll_id', v_poll_id,
        'points_deducted', v_cost,
        'exp_earned', v_exp_earned,
        'new_level', v_new_level,
        'leveled_up', v_new_level > v_old_level
    );
END;
$$;

-- get_all_poll_results
CREATE OR REPLACE FUNCTION public.get_all_poll_results()
RETURNS TABLE (
    poll_id UUID,
    option_index INTEGER,
    total_votes BIGINT,
    state_breakdown JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH state_counts AS (
        SELECT
            v.poll_id,
            v.option_index,
            v.user_state,
            COUNT(*) AS state_count
        FROM public.votes v
        GROUP BY v.poll_id, v.option_index, v.user_state
    ),
    state_json AS (
        SELECT
            sc.poll_id,
            sc.option_index,
            jsonb_object_agg(sc.user_state, sc.state_count) AS breakdown
        FROM state_counts sc
        GROUP BY sc.poll_id, sc.option_index
    )
    SELECT
        o.poll_id,
        o.option_index,
        COUNT(v.id) AS total_votes,
        COALESCE(sj.breakdown, '{}'::jsonb) AS state_breakdown
    FROM public.poll_options o
    LEFT JOIN public.votes v ON o.poll_id = v.poll_id AND o.option_index = v.option_index
    LEFT JOIN state_json sj ON o.poll_id = sj.poll_id AND o.option_index = sj.option_index
    GROUP BY o.poll_id, o.option_index, sj.breakdown
    ORDER BY o.poll_id, o.option_index;
END;
$$;


-- =============================================================
-- PART 4: SEED DATA
-- =============================================================

-- States
INSERT INTO public.states (id, name, display_order) VALUES
    ('perlis', 'Perlis', 1),
    ('kedah', 'Kedah', 2),
    ('penang', 'Pulau Pinang', 3),
    ('perak', 'Perak', 4),
    ('kelantan', 'Kelantan', 5),
    ('terengganu', 'Terengganu', 6),
    ('pahang', 'Pahang', 7),
    ('selangor', 'Selangor', 8),
    ('kualalumpur', 'Kuala Lumpur', 9),
    ('putrajaya', 'Putrajaya', 10),
    ('negerisembilan', 'Negeri Sembilan', 11),
    ('malacca', 'Melaka', 12),
    ('johor', 'Johor', 13),
    ('sabah', 'Sabah', 14),
    ('sarawak', 'Sarawak', 15),
    ('labuan', 'Labuan', 16)
ON CONFLICT (id) DO NOTHING;

-- System Polls (all 20 from data/polls.ts)
DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'nasi-lemak-best') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('nasi-lemak-best', 'Is Nasi Lemak the best breakfast in the world?', 'The eternal debate about Malaysia''s national dish', 'food', true, true, '2025-12-31', '2024-01-15')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, absolutely!', '🇲🇾'),
            (v_poll_id, 1, 'No, there are better options', '🌍');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'toll-abolishment') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('toll-abolishment', 'Should all highway tolls in Malaysia be abolished?', 'A hot topic affecting daily commuters', 'economy', true, true, '2025-06-30', '2024-01-14')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, abolish all tolls', '🚫'),
            (v_poll_id, 1, 'No, keep tolls for maintenance', '💰');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'roti-canai-vs-prata') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('roti-canai-vs-prata', 'Roti Canai or Roti Prata - which name is correct?', 'The naming controversy that divides a nation', 'food', true, true, '2024-01-13')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Roti Canai', '🇲🇾'),
            (v_poll_id, 1, 'Roti Prata', '🇸🇬');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'kl-traffic') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('kl-traffic', 'Is KL traffic worse than Jakarta''s?', 'Battle of Southeast Asian traffic nightmares', 'social', true, true, '2024-01-12')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, KL is worse', '🚗'),
            (v_poll_id, 1, 'No, Jakarta wins', '🏙️');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'bahasa-importance') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('bahasa-importance', 'Should Bahasa Malaysia be the primary language in all schools?', 'Education and language policy debate', 'politics', true, true, '2024-11-30', '2024-01-11')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, prioritize BM', '📚'),
            (v_poll_id, 1, 'No, maintain multilingual education', '🌐');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'durian-king') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('durian-king', 'Is Musang King truly the best durian variety?', 'The thorny debate among durian lovers', 'food', true, true, '2024-01-10')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, Musang King is supreme', '👑'),
            (v_poll_id, 1, 'No, other varieties are better', '🌟');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'public-transport') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('public-transport', 'Will Malaysia ever have world-class public transport?', 'Hopes and dreams for better connectivity', 'economy', true, true, '2025-12-31', '2024-01-09')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, within 10 years', '🚄'),
            (v_poll_id, 1, 'No, unlikely to happen', '😔');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'mamak-24-7') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('mamak-24-7', 'Should all mamak restaurants be 24/7?', 'Late night food culture preservation', 'culture', true, true, '2024-01-08')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, keep them 24/7', '🌙'),
            (v_poll_id, 1, 'No, workers need rest', '😴');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'sg-water-price') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('sg-water-price', 'Should Malaysia increase water price to Singapore?', 'The long-standing water agreement controversy', 'politics', true, true, '2024-12-31', '2024-01-07')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, increase the price', '💧'),
            (v_poll_id, 1, 'No, honor the agreement', '🤝');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'chili-sauce-debate') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('chili-sauce-debate', 'Which is better: Sambal or Chili Sauce?', 'The condiment that defines your identity', 'food', true, true, '2024-01-06')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Sambal all the way', '🌶️'),
            (v_poll_id, 1, 'Chili sauce is superior', '🍅');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'mrt-coverage') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('mrt-coverage', 'Should MRT lines reach all states by 2030?', 'Infrastructure expansion dreams', 'economy', true, true, '2025-06-30', '2024-01-05')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, connect all states', '🚇'),
            (v_poll_id, 1, 'No, focus on major cities first', '🏙️');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'teh-tarik-vs-kopi') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('teh-tarik-vs-kopi', 'Teh Tarik or Kopi O - which represents Malaysia better?', 'The beverage identity crisis', 'culture', true, true, '2024-01-04')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Teh Tarik', '🍵'),
            (v_poll_id, 1, 'Kopi O', '☕');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'gst-return') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('gst-return', 'Should GST (Goods and Services Tax) be reintroduced?', 'The taxation system debate', 'politics', true, true, '2024-12-31', '2024-01-03')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, bring back GST', '💳'),
            (v_poll_id, 1, 'No, keep SST', '🚫');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'weekend-friday') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('weekend-friday', 'Should the weekend be Friday-Saturday nationwide?', 'Work-life balance and religious harmony', 'social', true, true, '2024-01-02')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, align with Middle East', '🕌'),
            (v_poll_id, 1, 'No, keep Saturday-Sunday', '📅');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'char-kuey-teow') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('char-kuey-teow', 'Does Penang have the best Char Kuey Teow in Malaysia?', 'Regional food supremacy battle', 'food', true, true, '2024-08-31', '2024-01-01')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, Penang is #1', '🏝️'),
            (v_poll_id, 1, 'No, other states are better', '🍜');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'english-proficiency') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('english-proficiency', 'Is declining English proficiency a national crisis?', 'Language skills and global competitiveness', 'social', true, true, '2023-12-31')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, it''s a crisis', '⚠️'),
            (v_poll_id, 1, 'No, it''s exaggerated', '✅');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'anwar-pm') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('anwar-pm', 'Will Anwar Ibrahim serve a full term as PM?', 'Political stability predictions', 'politics', true, true, '2024-12-31', '2023-12-30')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, full 5 years', '🗳️'),
            (v_poll_id, 1, 'No, coalition will collapse', '💥');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'proton-future') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('proton-future', 'Can Proton compete globally with EVs?', 'National automotive industry future', 'economy', true, true, '2023-12-29')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, Proton can compete', '🚗'),
            (v_poll_id, 1, 'No, too far behind', '⚡');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'malaysia-world-cup') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, end_date, created_at)
        VALUES ('malaysia-world-cup', 'Will Malaysia qualify for FIFA World Cup by 2050?', 'Football dreams and national pride', 'culture', true, true, '2024-12-31', '2023-12-28')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, we can make it!', '⚽'),
            (v_poll_id, 1, 'No, unrealistic dream', '🎯');
    END IF;
END $$;

DO $$
DECLARE v_poll_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.polls WHERE legacy_id = 'cinema-seat-kicking') THEN
        INSERT INTO public.polls (legacy_id, question, description, category, is_system_poll, is_active, created_at)
        VALUES ('cinema-seat-kicking', 'Is seat-kicking at cinemas Malaysia''s #1 social problem?', 'The etiquette issue that unites all Malaysians', 'social', true, true, '2023-12-27')
        RETURNING id INTO v_poll_id;
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji) VALUES
            (v_poll_id, 0, 'Yes, it''s a plague', '😤'),
            (v_poll_id, 1, 'No, there are bigger issues', '🤷');
    END IF;
END $$;


-- =============================================================
-- SETUP COMPLETE!
--
-- Don't forget to also:
-- 1. Enable Realtime on the `users` table
--    (Supabase Dashboard → Database → Replication)
-- 2. Verify your .env.local has correct values:
--    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
--    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
-- =============================================================
