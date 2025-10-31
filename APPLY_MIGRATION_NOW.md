# 🚨 URGENT: Apply This Migration Now

## Why State Saving Isn't Working

Your code is calling database functions with `p_clerk_user_id`, but the database still expects `p_privy_user_id`.

**Error you're probably seeing in console:**
```
function update_user_state(p_state_id => ..., p_clerk_user_id => ...) does not exist
```

## Quick Fix - Apply Migration Now

### Option 1: Supabase Dashboard (FASTEST - 2 minutes)

1. **Go to**: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

2. **Copy and paste this entire SQL** (from `supabase/migrations/rename_privy_to_clerk.sql`):

```sql
-- Migration: Rename all privy references to clerk
-- This migration renames database columns, constraints, and function parameters
-- to use 'clerk' instead of 'privy' for clarity

-- Step 1: Rename the column in users table
ALTER TABLE users 
RENAME COLUMN privy_user_id TO clerk_user_id;

-- Step 2: Rename the unique constraint
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_privy_user_id_key;

ALTER TABLE users 
ADD CONSTRAINT users_clerk_user_id_key UNIQUE (clerk_user_id);

-- Step 3: Update the get_or_create_user function
CREATE OR REPLACE FUNCTION get_or_create_user(
  p_clerk_user_id TEXT,
  p_username TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_profile_picture_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  clerk_user_id TEXT,
  username TEXT,
  email TEXT,
  profile_picture_url TEXT,
  selected_state TEXT,
  points INTEGER,
  exp INTEGER,
  is_new_user BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  v_is_new BOOLEAN := FALSE;
BEGIN
  -- Try to find existing user
  SELECT id INTO v_user_id
  FROM users
  WHERE users.clerk_user_id = p_clerk_user_id;

  -- If user doesn't exist, create them
  IF v_user_id IS NULL THEN
    INSERT INTO users (clerk_user_id, username, email, profile_picture_url)
    VALUES (p_clerk_user_id, p_username, p_email, p_profile_picture_url)
    RETURNING id INTO v_user_id;
    
    v_is_new := TRUE;
  ELSE
    -- Update user info if provided
    UPDATE users
    SET 
      username = COALESCE(p_username, users.username),
      email = COALESCE(p_email, users.email),
      profile_picture_url = COALESCE(p_profile_picture_url, users.profile_picture_url),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- Return user data
  RETURN QUERY
  SELECT 
    u.id,
    u.clerk_user_id,
    u.username,
    u.email,
    u.profile_picture_url,
    u.selected_state,
    u.points,
    u.exp,
    v_is_new
  FROM users u
  WHERE u.id = v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Update the update_user_state function
CREATE OR REPLACE FUNCTION update_user_state(
  p_state_id TEXT,
  p_clerk_user_id TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET 
    selected_state = p_state_id,
    updated_at = NOW()
  WHERE clerk_user_id = p_clerk_user_id;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Update the cast_vote function
CREATE OR REPLACE FUNCTION cast_vote(
  p_poll_id TEXT,
  p_option_id UUID,
  p_option_index INTEGER,
  p_user_state TEXT,
  p_clerk_user_id TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  points_earned INTEGER,
  exp_earned INTEGER,
  leveled_up BOOLEAN,
  new_level INTEGER
) AS $$
DECLARE
  v_user_id UUID;
  v_old_exp INTEGER;
  v_new_exp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_points_reward INTEGER := 10;
  v_exp_reward INTEGER := 10;
BEGIN
  -- Get user ID from clerk_user_id
  SELECT id, exp INTO v_user_id, v_old_exp
  FROM users
  WHERE clerk_user_id = p_clerk_user_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if user has already voted on this poll
  IF EXISTS (
    SELECT 1 FROM votes
    WHERE user_id = v_user_id AND poll_id = p_poll_id
  ) THEN
    RAISE EXCEPTION 'User has already voted on this poll';
  END IF;

  -- Calculate levels
  v_old_level := FLOOR(v_old_exp / 1000) + 1;
  v_new_exp := v_old_exp + v_exp_reward;
  v_new_level := FLOOR(v_new_exp / 1000) + 1;

  -- Insert vote
  INSERT INTO votes (poll_id, option_id, option_index, user_id, user_state)
  VALUES (p_poll_id, p_option_id, p_option_index, v_user_id, p_user_state);

  -- Update user stats
  UPDATE users
  SET 
    points = points + v_points_reward,
    exp = v_new_exp,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Return results
  RETURN QUERY SELECT 
    TRUE,
    v_points_reward,
    v_exp_reward,
    v_new_level > v_old_level,
    v_new_level;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Update the create_poll function
CREATE OR REPLACE FUNCTION create_poll(
  p_question TEXT,
  p_description TEXT,
  p_category TEXT,
  p_options JSONB,
  p_clerk_user_id TEXT,
  p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
  poll_id TEXT,
  success BOOLEAN,
  exp_earned INTEGER,
  leveled_up BOOLEAN,
  new_level INTEGER
) AS $$
DECLARE
  v_user_id UUID;
  v_poll_id TEXT;
  v_option JSONB;
  v_option_index INTEGER := 0;
  v_points_cost INTEGER := 200;
  v_exp_reward INTEGER := 200;
  v_current_points INTEGER;
  v_old_exp INTEGER;
  v_new_exp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get user data
  SELECT id, points, exp INTO v_user_id, v_current_points, v_old_exp
  FROM users
  WHERE clerk_user_id = p_clerk_user_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if user has enough points
  IF v_current_points < v_points_cost THEN
    RAISE EXCEPTION 'Insufficient points to create poll';
  END IF;

  -- Calculate levels
  v_old_level := FLOOR(v_old_exp / 1000) + 1;
  v_new_exp := v_old_exp + v_exp_reward;
  v_new_level := FLOOR(v_new_exp / 1000) + 1;

  -- Generate poll ID
  v_poll_id := 'poll_' || gen_random_uuid()::TEXT;

  -- Create poll
  INSERT INTO polls (id, question, description, category, created_by, end_date, is_active)
  VALUES (v_poll_id, p_question, p_description, p_category, v_user_id, p_end_date, TRUE);

  -- Create poll options
  FOR v_option IN SELECT * FROM jsonb_array_elements(p_options)
  LOOP
    INSERT INTO poll_options (poll_id, option_index, label, emoji)
    VALUES (v_poll_id, v_option_index, v_option->>'label', v_option->>'emoji');
    v_option_index := v_option_index + 1;
  END LOOP;

  -- Update user stats (deduct points, add exp)
  UPDATE users
  SET 
    points = points - v_points_cost,
    exp = v_new_exp,
    updated_at = NOW()
  WHERE id = v_user_id;

  -- Return results
  RETURN QUERY SELECT 
    v_poll_id,
    TRUE,
    v_exp_reward,
    v_new_level > v_old_level,
    v_new_level;
END;
$$ LANGUAGE plpgsql;

-- Add comment to document the change
COMMENT ON COLUMN users.clerk_user_id IS 'User ID from Clerk authentication (formerly privy_user_id)';
```

3. **Click "Run"** (bottom right)

4. **Verify success** - you should see "Success. No rows returned"

5. **Refresh your app** and try saving state again - it will work!

---

### Option 2: Check Current Status First

Before applying, you can check if migration is needed:

```sql
-- Run this in Supabase SQL Editor
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('privy_user_id', 'clerk_user_id');
```

**If you see**: `privy_user_id` → Migration needed
**If you see**: `clerk_user_id` → Migration already applied (check for other issues)

---

## After Migration

1. **Refresh your app** (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)
2. **Try selecting a state again**
3. **It should work!** ✅

---

## What This Migration Does

- Renames: `users.privy_user_id` → `users.clerk_user_id`
- Updates 4 database functions to accept `p_clerk_user_id` instead of `p_privy_user_id`
- **Zero data loss** - all your existing user data is preserved
- **Takes < 1 second** to run

---

## Need Help?

If you see any errors:
1. Copy the error message
2. Check that you copied the ENTIRE SQL (scroll down in the migration file)
3. Make sure you're in the correct Supabase project

