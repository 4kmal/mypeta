-- =============================================================
-- MyPeta Supabase: RPC Functions
-- Run AFTER 01-create-tables.sql and 02-rls-policies.sql
-- =============================================================


-- =============================================================
-- 1. get_or_create_user
--    Called on every Clerk login to sync user data
-- =============================================================
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
    -- Try to find existing user
    SELECT u.id, u.selected_state, u.points, u.exp
    INTO v_user_id, v_selected_state, v_points, v_exp
    FROM public.users u
    WHERE u.clerk_user_id = p_clerk_user_id;

    IF v_user_id IS NULL THEN
        -- Create new user
        INSERT INTO public.users (clerk_user_id, username, email, profile_picture_url, points, exp)
        VALUES (p_clerk_user_id, p_username, p_email, p_profile_picture_url, 0, 0)
        RETURNING id, public.users.selected_state, public.users.points, public.users.exp
        INTO v_user_id, v_selected_state, v_points, v_exp;

        v_is_new := true;
    ELSE
        -- Update existing user's login info
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


-- =============================================================
-- 2. update_user_state
--    Sets the user's selected Malaysian state
-- =============================================================
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


-- =============================================================
-- 3. update_user_points_exp
--    Adjusts points and/or EXP by delta amounts
-- =============================================================
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


-- =============================================================
-- 4. cast_vote
--    Atomically: insert vote + award +10 points & +10 EXP
-- =============================================================
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
    -- Get user ID and current EXP
    SELECT id, exp INTO v_user_id, v_old_exp
    FROM public.users
    WHERE clerk_user_id = p_clerk_user_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    -- Check if already voted (unique constraint will also catch this)
    IF EXISTS (SELECT 1 FROM public.votes WHERE poll_id = p_poll_id AND user_id = v_user_id) THEN
        RAISE EXCEPTION 'User has already voted on this poll';
    END IF;

    -- Insert vote
    INSERT INTO public.votes (poll_id, user_id, poll_option_id, option_index, user_state)
    VALUES (p_poll_id, v_user_id, p_option_id, p_option_index, p_user_state);

    -- Award points and EXP
    UPDATE public.users
    SET points = points + v_points_earned,
        exp = exp + v_exp_earned,
        updated_at = now()
    WHERE id = v_user_id
    RETURNING exp INTO v_new_exp;

    -- Calculate levels (1000 EXP per level)
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


-- =============================================================
-- 5. create_poll
--    Atomically: create poll + options, deduct 200 pts, award 200 EXP
-- =============================================================
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
    -- Get user ID, points, and EXP
    SELECT id, points, exp
    INTO v_user_id, v_points, v_old_exp
    FROM public.users
    WHERE clerk_user_id = p_clerk_user_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;

    IF v_points < v_cost THEN
        RAISE EXCEPTION 'Insufficient points. Need % points.', v_cost;
    END IF;

    -- Create poll
    INSERT INTO public.polls (question, description, category, created_by, is_system_poll, end_date)
    VALUES (p_question, p_description, p_category, v_user_id, false, p_end_date)
    RETURNING id INTO v_poll_id;

    -- Create options
    FOR v_option IN SELECT * FROM jsonb_array_elements(p_options)
    LOOP
        INSERT INTO public.poll_options (poll_id, option_index, label, emoji)
        VALUES (v_poll_id, v_index, v_option->>'label', v_option->>'emoji');
        v_index := v_index + 1;
    END LOOP;

    -- Deduct points and grant EXP
    UPDATE public.users
    SET points = points - v_cost,
        exp = exp + v_exp_earned,
        updated_at = now()
    WHERE id = v_user_id
    RETURNING exp INTO v_new_exp;

    -- Calculate levels
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


-- =============================================================
-- 6. get_all_poll_results
--    Returns aggregated vote counts with state breakdown for all polls
-- =============================================================
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
