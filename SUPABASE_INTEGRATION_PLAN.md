# Supabase Database Integration Plan for My Peta Malaysia

## 📋 Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [Database Schema Design](#database-schema-design)
3. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
4. [Migration Strategy](#migration-strategy)
5. [API Integration Plan](#api-integration-plan)
6. [Real-time Features](#real-time-features)
7. [Caching Strategy](#caching-strategy)
8. [Future-Proofing](#future-proofing)
9. [Implementation Phases](#implementation-phases)
10. [Testing Plan](#testing-plan)

---

## 🔍 Current State Analysis

### Existing Data Flow
**1. External Data Sources (Read-only)**
- Income, Population, Crime, Water Consumption, Household Expense
- Fetched from government APIs via `useDataFetching` hook
- No persistence needed (already from external sources)

**2. User Data (localStorage - Needs Migration)**
```
localStorage Keys:
├── user_state_${userId}          // User's selected state
├── user_stats_${userId}          // { points: number, exp: number }
├── poll_votes_${userId}          // { pollId: { selectedOption, state, timestamp } }
├── poll_results                  // Aggregated poll results
├── poll_votes_detailed           // Individual vote records
└── custom_polls                  // User-created polls
```

### Current Features Requiring Database Support
1. **User Profile System**
   - State selection
   - Points & Experience tracking
   - Level progression (1000 EXP per level)

2. **Polls System**
   - Pre-defined polls (20 default polls)
   - User-created polls (cost: 200 points)
   - Voting (reward: +10 points, +10 EXP)
   - State-based vote breakdown
   - Poll end dates
   - Vote history per user

3. **Authentication**
   - Privy OAuth with X/Twitter
   - User ID provided by Privy

---

## 🗄️ Database Schema Design

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  privy_user_id TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  profile_picture_url TEXT,
  selected_state TEXT REFERENCES states(id),
  points INTEGER NOT NULL DEFAULT 0,
  exp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_privy_user_id ON users(privy_user_id);
CREATE INDEX idx_users_points ON users(points);
CREATE INDEX idx_users_exp ON users(exp);
```

**Rationale:**
- Separate internal UUID from Privy's user ID for flexibility
- Denormalized points/exp for fast queries (updated atomically)
- Track last_login for engagement metrics
- State is a foreign key for data integrity

---

### 2. States Reference Table
```sql
CREATE TABLE states (
  id TEXT PRIMARY KEY, -- 'selangor', 'johor', etc.
  name TEXT NOT NULL,  -- 'Selangor', 'Johor', etc.
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pre-populate with Malaysian states
INSERT INTO states (id, name, display_order) VALUES
  ('johor', 'Johor', 1),
  ('kedah', 'Kedah', 2),
  ('kelantan', 'Kelantan', 3),
  ('malacca', 'Melaka', 4),
  ('negerisembilan', 'Negeri Sembilan', 5),
  ('pahang', 'Pahang', 6),
  ('penang', 'Penang', 7),
  ('perak', 'Perak', 8),
  ('perlis', 'Perlis', 9),
  ('sabah', 'Sabah', 10),
  ('sarawak', 'Sarawak', 11),
  ('selangor', 'Selangor', 12),
  ('terengganu', 'Terengganu', 13),
  ('kualalumpur', 'Kuala Lumpur', 14),
  ('labuan', 'Labuan', 15),
  ('putrajaya', 'Putrajaya', 16);
```

---

### 3. Polls Table
```sql
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id TEXT UNIQUE, -- For migration of existing polls ('nasi-lemak-best', etc.)
  question TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('food', 'politics', 'culture', 'economy', 'social')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for system polls
  is_system_poll BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_polls_category ON polls(category);
CREATE INDEX idx_polls_created_by ON polls(created_by);
CREATE INDEX idx_polls_is_active ON polls(is_active);
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);
CREATE INDEX idx_polls_end_date ON polls(end_date);

-- View for active polls
CREATE VIEW active_polls AS
SELECT * FROM polls 
WHERE is_active = true 
  AND (end_date IS NULL OR end_date > NOW());
```

**Rationale:**
- `legacy_id` for backward compatibility with existing poll IDs
- `is_system_poll` flag to distinguish pre-defined vs user-created
- `created_by` can be NULL for system polls
- Efficient querying with proper indexes
- View for common query pattern (active polls)

---

### 4. Poll Options Table
```sql
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL, -- 0, 1, 2, ...
  label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique option order per poll
  UNIQUE(poll_id, option_index)
);

-- Index for fast option retrieval
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
```

**Rationale:**
- Normalized design allows polls with 2+ options (future flexibility)
- Cascade delete ensures orphaned options are cleaned up
- `option_index` maintains display order

---

### 5. Votes Table
```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  poll_option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL, -- Denormalized for performance
  user_state TEXT NOT NULL REFERENCES states(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One vote per user per poll
  UNIQUE(poll_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_user_state ON votes(user_state);
CREATE INDEX idx_votes_created_at ON votes(created_at);
```

**Rationale:**
- Unique constraint prevents double voting
- Denormalized `option_index` for faster aggregation queries
- Stores user's state at time of vote for analytics
- Cascade delete maintains referential integrity

---

### 6. Poll Statistics (Materialized View)
```sql
-- Materialized view for aggregated poll statistics
CREATE MATERIALIZED VIEW poll_statistics AS
SELECT 
  p.id AS poll_id,
  p.question,
  p.category,
  COUNT(DISTINCT v.user_id) AS total_votes,
  po.id AS option_id,
  po.option_index,
  po.label AS option_label,
  po.emoji AS option_emoji,
  COUNT(v.id) AS option_votes,
  ROUND(
    CASE 
      WHEN COUNT(v.id) OVER (PARTITION BY p.id) > 0 
      THEN (COUNT(v.id)::NUMERIC / COUNT(v.id) OVER (PARTITION BY p.id) * 100)
      ELSE 0 
    END, 
    2
  ) AS vote_percentage
FROM polls p
LEFT JOIN poll_options po ON p.id = po.poll_id
LEFT JOIN votes v ON po.id = v.poll_option_id
GROUP BY p.id, p.question, p.category, po.id, po.option_index, po.label, po.emoji;

-- Index for fast lookups
CREATE INDEX idx_poll_statistics_poll_id ON poll_statistics(poll_id);

-- Refresh function (call after votes are cast)
CREATE OR REPLACE FUNCTION refresh_poll_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY poll_statistics;
END;
$$ LANGUAGE plpgsql;
```

**Rationale:**
- Pre-computed statistics for fast read performance
- Reduces load on main tables
- Refreshed periodically or after votes
- Essential for scaling

---

### 7. State-Level Vote Breakdown Table
```sql
CREATE TABLE vote_state_breakdown (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  state_id TEXT NOT NULL REFERENCES states(id),
  vote_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(poll_id, option_index, state_id)
);

-- Indexes
CREATE INDEX idx_vote_state_breakdown_poll_id ON vote_state_breakdown(poll_id);
CREATE INDEX idx_vote_state_breakdown_state_id ON vote_state_breakdown(state_id);

-- Trigger to update vote_state_breakdown on new vote
CREATE OR REPLACE FUNCTION update_vote_state_breakdown()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment vote count for this poll option in user's state
  INSERT INTO vote_state_breakdown (poll_id, option_index, state_id, vote_count)
  VALUES (NEW.poll_id, NEW.option_index, NEW.user_state, 1)
  ON CONFLICT (poll_id, option_index, state_id)
  DO UPDATE SET 
    vote_count = vote_state_breakdown.vote_count + 1,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_state_breakdown
AFTER INSERT ON votes
FOR EACH ROW
EXECUTE FUNCTION update_vote_state_breakdown();
```

**Rationale:**
- Maintains state-level breakdown automatically via trigger
- Efficient for analytics and visualizations
- Updated atomically with votes

---

### 8. User Activity Log (Optional but Recommended)
```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('vote', 'poll_create', 'login', 'state_select')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
```

**Rationale:**
- Audit trail for user actions
- Useful for analytics and debugging
- JSONB field allows flexible metadata storage
- Can be partitioned by date for large datasets

---

### 9. Transactions Table (For Point/EXP History)
```sql
CREATE TABLE user_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('vote', 'poll_create', 'admin_adjustment')),
  points_change INTEGER NOT NULL DEFAULT 0,
  exp_change INTEGER NOT NULL DEFAULT 0,
  balance_after_points INTEGER NOT NULL,
  balance_after_exp INTEGER NOT NULL,
  reference_id UUID, -- poll_id or vote_id
  reference_type TEXT CHECK (reference_type IN ('poll', 'vote', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX idx_user_transactions_created_at ON user_transactions(created_at DESC);
CREATE INDEX idx_user_transactions_reference ON user_transactions(reference_id, reference_type);
```

**Rationale:**
- Immutable transaction log (never delete/update)
- Enables point/EXP history tracking
- Useful for debugging balance issues
- Can verify user balance by summing transactions

---

## 🔒 Row Level Security (RLS) Policies

### Enable RLS on All Tables
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_state_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;
```

---

### Users Table Policies
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (privy_user_id = auth.jwt() ->> 'sub');

-- Users can update their own profile (except points/exp - use functions)
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (privy_user_id = auth.jwt() ->> 'sub')
WITH CHECK (
  privy_user_id = auth.jwt() ->> 'sub' AND
  -- Prevent direct point/exp manipulation
  points = (SELECT points FROM users WHERE privy_user_id = auth.jwt() ->> 'sub') AND
  exp = (SELECT exp FROM users WHERE privy_user_id = auth.jwt() ->> 'sub')
);

-- Anyone can view basic user info (for leaderboards, etc.)
CREATE POLICY "Public users read"
ON users FOR SELECT
USING (true);
```

---

### Polls Table Policies
```sql
-- Anyone can view active polls
CREATE POLICY "Anyone can view active polls"
ON polls FOR SELECT
USING (is_active = true);

-- Authenticated users can create polls (enforce via function)
CREATE POLICY "Authenticated users can create polls"
ON polls FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  created_by = (SELECT id FROM users WHERE privy_user_id = auth.jwt() ->> 'sub')
);

-- Poll creators can update their own polls
CREATE POLICY "Creators can update own polls"
ON polls FOR UPDATE
USING (
  created_by = (SELECT id FROM users WHERE privy_user_id = auth.jwt() ->> 'sub')
);
```

---

### Poll Options Policies
```sql
-- Anyone can view poll options
CREATE POLICY "Anyone can view poll options"
ON poll_options FOR SELECT
USING (true);

-- Only poll creators can insert options (via function)
CREATE POLICY "Poll creators can add options"
ON poll_options FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM polls 
    WHERE id = poll_id 
      AND created_by = (SELECT id FROM users WHERE privy_user_id = auth.jwt() ->> 'sub')
  )
);
```

---

### Votes Table Policies
```sql
-- Users can view their own votes
CREATE POLICY "Users can view own votes"
ON votes FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE privy_user_id = auth.jwt() ->> 'sub')
);

-- Users can insert votes (enforced via function to prevent double voting and award points)
CREATE POLICY "Authenticated users can vote"
ON votes FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  user_id = (SELECT id FROM users WHERE privy_user_id = auth.jwt() ->> 'sub')
);

-- Admins can view all votes (add admin role check)
CREATE POLICY "Admins can view all votes"
ON votes FOR SELECT
USING (
  (SELECT is_admin FROM users WHERE privy_user_id = auth.jwt() ->> 'sub') = true
);
```

---

### Vote State Breakdown Policies
```sql
-- Anyone can view state breakdowns (for charts)
CREATE POLICY "Anyone can view state breakdowns"
ON vote_state_breakdown FOR SELECT
USING (true);

-- Only triggers can modify (no direct user access)
-- This is enforced by not having INSERT/UPDATE policies for users
```

---

### User Activities & Transactions Policies
```sql
-- Users can view their own activities
CREATE POLICY "Users can view own activities"
ON user_activities FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE privy_user_id = auth.jwt() ->> 'sub')
);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
ON user_transactions FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE privy_user_id = auth.jwt() ->> 'sub')
);
```

---

## 🔧 Database Functions & Triggers

### 1. Atomic Vote Function
```sql
CREATE OR REPLACE FUNCTION cast_vote(
  p_poll_id UUID,
  p_option_id UUID,
  p_option_index INTEGER,
  p_user_state TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_poll_active BOOLEAN;
  v_has_voted BOOLEAN;
  v_points_earned INTEGER := 10;
  v_exp_earned INTEGER := 10;
  v_old_exp INTEGER;
  v_new_exp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_leveled_up BOOLEAN := false;
BEGIN
  -- Get user ID from Privy user ID
  SELECT id, exp INTO v_user_id, v_old_exp
  FROM users 
  WHERE privy_user_id = auth.jwt() ->> 'sub';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check if poll is active
  SELECT 
    is_active AND (end_date IS NULL OR end_date > NOW())
    INTO v_poll_active
  FROM polls 
  WHERE id = p_poll_id;
  
  IF NOT v_poll_active THEN
    RAISE EXCEPTION 'Poll is not active';
  END IF;
  
  -- Check if user already voted
  SELECT EXISTS(
    SELECT 1 FROM votes 
    WHERE poll_id = p_poll_id AND user_id = v_user_id
  ) INTO v_has_voted;
  
  IF v_has_voted THEN
    RAISE EXCEPTION 'User has already voted on this poll';
  END IF;
  
  -- Insert vote
  INSERT INTO votes (poll_id, user_id, poll_option_id, option_index, user_state)
  VALUES (p_poll_id, v_user_id, p_option_id, p_option_index, p_user_state);
  
  -- Update user points and exp atomically
  UPDATE users 
  SET 
    points = points + v_points_earned,
    exp = exp + v_exp_earned,
    updated_at = NOW()
  WHERE id = v_user_id
  RETURNING exp INTO v_new_exp;
  
  -- Check for level up (1000 EXP per level)
  v_old_level := FLOOR(v_old_exp / 1000) + 1;
  v_new_level := FLOOR(v_new_exp / 1000) + 1;
  v_leveled_up := v_new_level > v_old_level;
  
  -- Log transaction
  INSERT INTO user_transactions (
    user_id, 
    transaction_type, 
    points_change, 
    exp_change,
    balance_after_points,
    balance_after_exp,
    reference_id,
    reference_type
  )
  SELECT 
    v_user_id,
    'vote',
    v_points_earned,
    v_exp_earned,
    points,
    exp,
    p_poll_id,
    'poll'
  FROM users WHERE id = v_user_id;
  
  -- Log activity
  INSERT INTO user_activities (user_id, activity_type, metadata)
  VALUES (v_user_id, 'vote', jsonb_build_object(
    'poll_id', p_poll_id,
    'option_id', p_option_id,
    'state', p_user_state
  ));
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'points_earned', v_points_earned,
    'exp_earned', v_exp_earned,
    'leveled_up', v_leveled_up,
    'new_level', v_new_level
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Rationale:**
- Atomic transaction ensures data consistency
- Awards points/exp automatically
- Prevents double voting
- Checks poll validity
- Returns level up status for UI feedback
- SECURITY DEFINER allows execution with elevated privileges

---

### 2. Create Poll Function
```sql
CREATE OR REPLACE FUNCTION create_poll(
  p_question TEXT,
  p_description TEXT,
  p_category TEXT,
  p_options JSONB, -- [{ label: string, emoji: string }]
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_poll_id UUID;
  v_user_points INTEGER;
  v_poll_cost INTEGER := 200;
  v_exp_reward INTEGER := 200;
  v_option JSONB;
  v_option_index INTEGER := 0;
  v_old_exp INTEGER;
  v_new_exp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_leveled_up BOOLEAN := false;
BEGIN
  -- Get user ID and current points/exp
  SELECT id, points, exp 
  INTO v_user_id, v_user_points, v_old_exp
  FROM users 
  WHERE privy_user_id = auth.jwt() ->> 'sub';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check if user has enough points
  IF v_user_points < v_poll_cost THEN
    RAISE EXCEPTION 'Insufficient points. Required: %, Available: %', v_poll_cost, v_user_points;
  END IF;
  
  -- Validate inputs
  IF p_question IS NULL OR TRIM(p_question) = '' THEN
    RAISE EXCEPTION 'Question is required';
  END IF;
  
  IF jsonb_array_length(p_options) < 2 THEN
    RAISE EXCEPTION 'At least 2 options are required';
  END IF;
  
  -- Create poll
  INSERT INTO polls (question, description, category, created_by, end_date)
  VALUES (p_question, p_description, p_category, v_user_id, p_end_date)
  RETURNING id INTO v_poll_id;
  
  -- Insert poll options
  FOR v_option IN SELECT * FROM jsonb_array_elements(p_options)
  LOOP
    INSERT INTO poll_options (poll_id, option_index, label, emoji)
    VALUES (
      v_poll_id, 
      v_option_index,
      v_option->>'label',
      v_option->>'emoji'
    );
    v_option_index := v_option_index + 1;
  END LOOP;
  
  -- Deduct points and award exp atomically
  UPDATE users 
  SET 
    points = points - v_poll_cost,
    exp = exp + v_exp_reward,
    updated_at = NOW()
  WHERE id = v_user_id
  RETURNING exp INTO v_new_exp;
  
  -- Check for level up
  v_old_level := FLOOR(v_old_exp / 1000) + 1;
  v_new_level := FLOOR(v_new_exp / 1000) + 1;
  v_leveled_up := v_new_level > v_old_level;
  
  -- Log transaction
  INSERT INTO user_transactions (
    user_id, 
    transaction_type, 
    points_change, 
    exp_change,
    balance_after_points,
    balance_after_exp,
    reference_id,
    reference_type
  )
  SELECT 
    v_user_id,
    'poll_create',
    -v_poll_cost,
    v_exp_reward,
    points,
    exp,
    v_poll_id,
    'poll'
  FROM users WHERE id = v_user_id;
  
  -- Log activity
  INSERT INTO user_activities (user_id, activity_type, metadata)
  VALUES (v_user_id, 'poll_create', jsonb_build_object(
    'poll_id', v_poll_id,
    'question', p_question,
    'category', p_category
  ));
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'poll_id', v_poll_id,
    'points_cost', v_poll_cost,
    'exp_earned', v_exp_reward,
    'leveled_up', v_leveled_up,
    'new_level', v_new_level
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 3. Update User State Function
```sql
CREATE OR REPLACE FUNCTION update_user_state(p_state_id TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM users 
  WHERE privy_user_id = auth.jwt() ->> 'sub';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Validate state exists
  IF NOT EXISTS(SELECT 1 FROM states WHERE id = p_state_id) THEN
    RAISE EXCEPTION 'Invalid state ID';
  END IF;
  
  -- Update user state
  UPDATE users 
  SET 
    selected_state = p_state_id,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Log activity
  INSERT INTO user_activities (user_id, activity_type, metadata)
  VALUES (v_user_id, 'state_select', jsonb_build_object('state_id', p_state_id));
  
  RETURN json_build_object('success', true, 'state', p_state_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 4. Get or Create User Function
```sql
CREATE OR REPLACE FUNCTION get_or_create_user(
  p_privy_user_id TEXT,
  p_username TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_profile_picture_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  privy_user_id TEXT,
  username TEXT,
  email TEXT,
  profile_picture_url TEXT,
  selected_state TEXT,
  points INTEGER,
  exp INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  is_new_user BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  v_is_new BOOLEAN := false;
BEGIN
  -- Try to get existing user
  SELECT id INTO v_user_id
  FROM users 
  WHERE users.privy_user_id = p_privy_user_id;
  
  -- Create user if not exists
  IF v_user_id IS NULL THEN
    INSERT INTO users (privy_user_id, username, email, profile_picture_url)
    VALUES (p_privy_user_id, p_username, p_email, p_profile_picture_url)
    RETURNING id INTO v_user_id;
    v_is_new := true;
  ELSE
    -- Update user info on login
    UPDATE users 
    SET 
      username = COALESCE(p_username, username),
      email = COALESCE(p_email, email),
      profile_picture_url = COALESCE(p_profile_picture_url, profile_picture_url),
      last_login = NOW(),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;
  
  -- Return user data
  RETURN QUERY
  SELECT 
    u.id,
    u.privy_user_id,
    u.username,
    u.email,
    u.profile_picture_url,
    u.selected_state,
    u.points,
    u.exp,
    u.created_at,
    v_is_new
  FROM users u
  WHERE u.id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📊 Views for Common Queries

### 1. Polls with Vote Counts
```sql
CREATE VIEW polls_with_stats AS
SELECT 
  p.id,
  p.legacy_id,
  p.question,
  p.description,
  p.category,
  p.created_by,
  p.is_system_poll,
  p.is_active,
  p.end_date,
  p.created_at,
  u.username AS creator_username,
  COUNT(DISTINCT v.user_id) AS total_votes,
  CASE 
    WHEN p.end_date IS NULL THEN true
    WHEN p.end_date > NOW() THEN true
    ELSE false
  END AS is_live
FROM polls p
LEFT JOIN users u ON p.created_by = u.id
LEFT JOIN votes v ON p.id = v.poll_id
GROUP BY p.id, u.username;
```

---

### 2. User Leaderboard
```sql
CREATE VIEW user_leaderboard AS
SELECT 
  id,
  username,
  selected_state,
  points,
  exp,
  FLOOR(exp / 1000) + 1 AS level,
  (exp % 1000) AS exp_in_current_level,
  (SELECT COUNT(*) FROM votes WHERE user_id = users.id) AS total_votes,
  (SELECT COUNT(*) FROM polls WHERE created_by = users.id) AS total_polls_created,
  RANK() OVER (ORDER BY points DESC) AS points_rank,
  RANK() OVER (ORDER BY exp DESC) AS exp_rank
FROM users
ORDER BY points DESC;
```

---

## 🚀 Migration Strategy

### Phase 1: Preparation
1. **Set up Supabase Project**
   - Create new Supabase project
   - Note connection strings and API keys
   - Set up environment variables

2. **Install Dependencies**
```bash
npm install @supabase/supabase-js
```

3. **Create Database Schema**
   - Run all table creation scripts
   - Set up RLS policies
   - Create functions and triggers
   - Populate states reference table
   - Migrate 20 default polls to database

---

### Phase 2: Dual-Write Strategy (Testing)
1. **Implement Supabase Client**
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

2. **Dual-Write for User Data**
   - Write to both localStorage AND Supabase
   - Read from Supabase with localStorage fallback
   - Monitor for discrepancies

3. **Testing Phase**
   - Test all features with Supabase
   - Monitor performance and error rates
   - Fix issues before full migration

---

### Phase 3: Full Migration
1. **Migrate Existing User Data**
```typescript
// Migration script to move localStorage data to Supabase
async function migrateUserData(privyUserId: string) {
  // Get data from localStorage
  const state = localStorage.getItem(`user_state_${privyUserId}`);
  const stats = JSON.parse(localStorage.getItem(`user_stats_${privyUserId}`) || '{}');
  const votes = JSON.parse(localStorage.getItem(`poll_votes_${privyUserId}`) || '{}');
  
  // Migrate to Supabase
  // ... (implementation in next phase)
}
```

2. **Switch to Supabase-only**
   - Remove localStorage writes
   - Use Supabase as single source of truth
   - Keep localStorage as backup cache

3. **Cleanup**
   - Remove old localStorage migration code after stable period
   - Monitor for any issues

---

### Phase 4: Data Migration Script
```typescript
// scripts/migrate-to-supabase.ts
import { supabase } from '@/lib/supabase';

interface LocalStoragePoll {
  id: string;
  question: string;
  description: string;
  category: string;
  options: { label: string; emoji: string }[];
  createdAt: Date;
  endDate?: Date;
}

async function migratePollData() {
  // Migrate custom polls from localStorage
  const customPollsStr = localStorage.getItem('custom_polls');
  if (!customPollsStr) return;
  
  const customPolls: LocalStoragePoll[] = JSON.parse(customPollsStr);
  
  for (const poll of customPolls) {
    // Create poll in Supabase
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .insert({
        legacy_id: poll.id,
        question: poll.question,
        description: poll.description,
        category: poll.category,
        end_date: poll.endDate,
        created_by: null, // Will need to map to actual user
        is_system_poll: false,
        is_active: true
      })
      .select()
      .single();
    
    if (pollError) {
      console.error('Error migrating poll:', pollError);
      continue;
    }
    
    // Create poll options
    for (let i = 0; i < poll.options.length; i++) {
      await supabase
        .from('poll_options')
        .insert({
          poll_id: pollData.id,
          option_index: i,
          label: poll.options[i].label,
          emoji: poll.options[i].emoji
        });
    }
  }
}

async function migrateVoteData(privyUserId: string, internalUserId: string) {
  // Migrate user votes
  const votesStr = localStorage.getItem(`poll_votes_${privyUserId}`);
  if (!votesStr) return;
  
  const votes: Record<string, any> = JSON.parse(votesStr);
  
  for (const [pollId, voteData] of Object.entries(votes)) {
    // Find poll in database
    const { data: poll } = await supabase
      .from('polls')
      .select('id, legacy_id')
      .or(`id.eq.${pollId},legacy_id.eq.${pollId}`)
      .single();
    
    if (!poll) continue;
    
    // Find option
    const { data: option } = await supabase
      .from('poll_options')
      .select('id')
      .eq('poll_id', poll.id)
      .eq('option_index', voteData.selectedOption)
      .single();
    
    if (!option) continue;
    
    // Insert vote (will trigger automatic breakdown updates)
    await supabase
      .from('votes')
      .insert({
        poll_id: poll.id,
        user_id: internalUserId,
        poll_option_id: option.id,
        option_index: voteData.selectedOption,
        user_state: voteData.state,
        created_at: new Date(voteData.timestamp).toISOString()
      });
  }
}
```

---

## 🔌 API Integration Plan

### 1. Context Updates

#### UserProfileContext Updates
```typescript
// contexts/UserProfileContext.tsx
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, authenticated } = usePrivy();
  const [selectedState, setSelectedStateInternal] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [internalUserId, setInternalUserId] = useState<string | null>(null);

  // Load user data from Supabase on mount
  useEffect(() => {
    if (authenticated && user) {
      loadUserData();
    }
  }, [authenticated, user]);

  const loadUserData = async () => {
    if (!user) return;

    // Get or create user in Supabase
    const { data, error } = await supabase
      .rpc('get_or_create_user', {
        p_privy_user_id: user.id,
        p_username: user.twitter?.username || user.email?.address?.split('@')[0],
        p_email: user.email?.address,
        p_profile_picture_url: user.twitter?.profilePictureUrl
      });

    if (error) {
      console.error('Error loading user data:', error);
      return;
    }

    const userData = data[0];
    setInternalUserId(userData.user_id);
    setSelectedStateInternal(userData.selected_state);
    setStats({
      points: userData.points,
      exp: userData.exp
    });

    // Show state selector if no state selected
    if (!userData.selected_state) {
      setShowStateSelector(true);
    }
  };

  const setSelectedState = async (state: string) => {
    if (!user) return;

    const { error } = await supabase
      .rpc('update_user_state', { p_state_id: state });

    if (error) {
      console.error('Error updating state:', error);
      return;
    }

    setSelectedStateInternal(state);
    setShowStateSelector(false);
  };

  // Subscribe to user data changes (real-time)
  useEffect(() => {
    if (!internalUserId) return;

    const subscription = supabase
      .channel('user-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${internalUserId}`
        },
        (payload) => {
          const newData = payload.new;
          setStats({
            points: newData.points,
            exp: newData.exp
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [internalUserId]);

  // ... rest of context implementation
};
```

---

### 2. Polls Page Integration

```typescript
// pages/polls/index.tsx - Key Changes

// Load polls from Supabase
useEffect(() => {
  loadPolls();
}, []);

const loadPolls = async () => {
  const { data, error } = await supabase
    .from('polls_with_stats')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading polls:', error);
    return;
  }

  // Transform to Poll[] format
  const pollsWithOptions = await Promise.all(
    data.map(async (poll) => {
      const { data: options } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', poll.id)
        .order('option_index');

      return {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        category: poll.category,
        createdAt: new Date(poll.created_at),
        endDate: poll.end_date ? new Date(poll.end_date) : undefined,
        options: options?.map(o => ({ label: o.label, emoji: o.emoji })) || [],
        totalVotes: poll.total_votes,
        isLive: poll.is_live
      };
    })
  );

  setAllPolls(pollsWithOptions);
};

// Load user votes
useEffect(() => {
  if (authenticated && internalUserId) {
    loadUserVotes();
  }
}, [authenticated, internalUserId]);

const loadUserVotes = async () => {
  const { data, error } = await supabase
    .from('votes')
    .select('poll_id, option_index, user_state, created_at')
    .eq('user_id', internalUserId);

  if (error) {
    console.error('Error loading votes:', error);
    return;
  }

  // Transform to VoteData format
  const votes: VoteData = {};
  data?.forEach(vote => {
    votes[vote.poll_id] = {
      selectedOption: vote.option_index,
      state: vote.user_state,
      timestamp: new Date(vote.created_at).getTime()
    };
  });

  setUserVotes(votes);
};

// Load poll results
useEffect(() => {
  loadPollResults();
}, [allPolls]);

const loadPollResults = async () => {
  const results: PollResults = {};

  for (const poll of allPolls) {
    // Get vote counts per option
    const { data: voteCounts } = await supabase
      .from('votes')
      .select('option_index')
      .eq('poll_id', poll.id);

    const votes = new Array(poll.options.length).fill(0);
    voteCounts?.forEach(v => {
      votes[v.option_index]++;
    });

    // Get state breakdown
    const { data: stateBreakdown } = await supabase
      .from('vote_state_breakdown')
      .select('*')
      .eq('poll_id', poll.id);

    const stateBreakdownMap: Record<string, number[]> = {};
    stateBreakdown?.forEach(sb => {
      if (!stateBreakdownMap[sb.state_id]) {
        stateBreakdownMap[sb.state_id] = new Array(poll.options.length).fill(0);
      }
      stateBreakdownMap[sb.state_id][sb.option_index] = sb.vote_count;
    });

    results[poll.id] = {
      votes,
      totalVotes: votes.reduce((a, b) => a + b, 0),
      stateBreakdown: stateBreakdownMap
    };
  }

  setPollResults(results);
};

// Handle vote
const handleVote = async (pollId: string, optionIndex: number) => {
  if (!authenticated) {
    toast.error('Please sign in to vote');
    return;
  }

  if (!selectedState) {
    toast.warning('Please select your state before voting');
    return;
  }

  // Get poll option ID
  const { data: optionData } = await supabase
    .from('poll_options')
    .select('id')
    .eq('poll_id', pollId)
    .eq('option_index', optionIndex)
    .single();

  if (!optionData) {
    toast.error('Invalid option');
    return;
  }

  // Call vote function (handles everything atomically)
  const { data, error } = await supabase
    .rpc('cast_vote', {
      p_poll_id: pollId,
      p_option_id: optionData.id,
      p_option_index: optionIndex,
      p_user_state: selectedState
    });

  if (error) {
    if (error.message.includes('already voted')) {
      toast.info('You have already voted on this poll');
    } else {
      toast.error('Failed to cast vote: ' + error.message);
    }
    return;
  }

  const result = data;

  // Update local state
  setUserVotes(prev => ({
    ...prev,
    [pollId]: {
      selectedOption: optionIndex,
      state: selectedState,
      timestamp: Date.now()
    }
  }));

  // Reload poll results
  await loadPollResults();

  // Show success message
  if (result.leveled_up) {
    toast.success('Level Up!', {
      description: `You reached level ${result.new_level}! 🎉`
    });
  } else {
    toast.success('Vote recorded!', {
      description: `You earned +${result.points_earned} points and +${result.exp_earned} EXP!`
    });
  }
};

// Handle create poll
const handleCreatePoll = async () => {
  if (!authenticated) {
    toast.error('Please sign in to create a poll');
    return;
  }

  // Validation
  if (!newPoll.question.trim()) {
    toast.error('Please enter a question');
    return;
  }

  const options = newPoll.options.map(o => ({
    label: o.label.trim(),
    emoji: o.emoji.trim()
  }));

  // Call create poll function
  const { data, error } = await supabase
    .rpc('create_poll', {
      p_question: newPoll.question.trim(),
      p_description: newPoll.description.trim() || 'User-created poll',
      p_category: newPoll.category,
      p_options: options,
      p_end_date: newPoll.endDate ? new Date(newPoll.endDate).toISOString() : null
    });

  if (error) {
    if (error.message.includes('Insufficient points')) {
      toast.error('Insufficient points', {
        description: 'You need 200 points to create a poll'
      });
    } else {
      toast.error('Failed to create poll: ' + error.message);
    }
    return;
  }

  const result = data;

  // Reload polls
  await loadPolls();

  // Reset form
  setNewPoll({
    question: '',
    description: '',
    category: 'food',
    options: [{ label: '', emoji: '' }, { label: '', emoji: '' }],
    endDate: ''
  });
  setShowCreatePoll(false);

  // Show success message
  if (result.leveled_up) {
    toast.success('Poll created! Level Up!', {
      description: `You reached level ${result.new_level}! 🎉`
    });
  } else {
    toast.success('Poll created successfully!', {
      description: 'You earned +200 EXP!'
    });
  }
};
```

---

### 3. Real-time Subscriptions

```typescript
// hooks/useRealtimePolls.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const useRealtimePolls = (pollId: string) => {
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    // Subscribe to vote changes
    const subscription = supabase
      .channel(`poll-${pollId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter: `poll_id=eq.${pollId}`
        },
        () => {
          // Increment local count
          setVoteCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [pollId]);

  return { voteCount };
};
```

---

## ⚡ Real-time Features

### 1. Live Poll Updates
```typescript
// Real-time vote counter for each poll
const { voteCount } = useRealtimePolls(poll.id);
```

### 2. Live Leaderboard
```typescript
// Subscribe to leaderboard changes
useEffect(() => {
  const subscription = supabase
    .channel('leaderboard')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'users'
      },
      () => {
        // Refresh leaderboard
        loadLeaderboard();
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

### 3. Real-time Notifications
```typescript
// Notify when someone votes on your poll
useEffect(() => {
  if (!internalUserId) return;

  const subscription = supabase
    .channel('user-notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'votes',
        filter: `poll_id=in.(SELECT id FROM polls WHERE created_by = '${internalUserId}')`
      },
      (payload) => {
        toast.info('Someone voted on your poll!');
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, [internalUserId]);
```

---

## 💾 Caching Strategy

### 1. Client-Side Cache
```typescript
// lib/cache.ts
import { supabase } from './supabase';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number = 60000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const dataCache = new DataCache();

// Example usage
export async function getPolls(category?: string) {
  const cacheKey = `polls-${category || 'all'}`;
  
  // Check cache first
  const cached = dataCache.get<Poll[]>(cacheKey);
  if (cached) return cached;

  // Fetch from Supabase
  let query = supabase
    .from('polls_with_stats')
    .select('*')
    .eq('is_active', true);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Cache for 1 minute
  dataCache.set(cacheKey, data, 60000);

  return data;
}
```

---

### 2. Server-Side Cache (Next.js API Routes)
```typescript
// pages/api/polls/[category].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Cache at edge with Vercel
export const config = {
  runtime: 'edge',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { category } = req.query;

  // Set cache headers (1 minute)
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  let query = supabase
    .from('polls_with_stats')
    .select('*')
    .eq('is_active', true);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}
```

---

## 🔮 Future-Proofing

### 1. Planned Features & Database Support

#### A. Comments on Polls
```sql
CREATE TABLE poll_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES poll_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_poll_comments_poll_id ON poll_comments(poll_id);
CREATE INDEX idx_poll_comments_user_id ON poll_comments(user_id);
CREATE INDEX idx_poll_comments_parent_id ON poll_comments(parent_comment_id);
```

---

#### B. Poll Reactions/Likes
```sql
CREATE TABLE poll_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'fire', 'thinking', 'laugh')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(poll_id, user_id)
);

CREATE INDEX idx_poll_reactions_poll_id ON poll_reactions(poll_id);
```

---

#### C. User Badges/Achievements
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  criteria JSONB, -- { type: 'votes_count', threshold: 100 }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);
```

---

#### D. Notifications System
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  reference_id UUID,
  reference_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

---

#### E. Poll Reports/Moderation
```sql
CREATE TABLE poll_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_poll_reports_poll_id ON poll_reports(poll_id);
CREATE INDEX idx_poll_reports_status ON poll_reports(status);
```

---

#### F. User Followers/Social Features
```sql
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
```

---

### 2. Scalability Considerations

#### A. Partitioning Strategy
```sql
-- Partition votes table by created_at (monthly)
CREATE TABLE votes_partitioned (
  LIKE votes INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE votes_2024_01 PARTITION OF votes_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE votes_2024_02 PARTITION OF votes_partitioned
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Auto-create new partitions with pg_cron or application logic
```

---

#### B. Read Replicas
- Use Supabase's read replicas for analytics queries
- Separate read-heavy operations (leaderboards, statistics)
- Write to primary, read from replicas

---

#### C. CDN & Edge Caching
```typescript
// Use Vercel Edge Functions for API routes
// Cached at edge locations for faster global access
export const config = {
  runtime: 'edge',
  regions: ['sin1', 'hkg1'], // Singapore, Hong Kong (close to Malaysia)
};
```

---

### 3. Analytics Tables
```sql
-- Daily aggregated statistics
CREATE TABLE daily_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  total_users INTEGER,
  total_polls INTEGER,
  total_votes INTEGER,
  active_users INTEGER, -- Users who voted that day
  new_users INTEGER,
  new_polls INTEGER,
  new_votes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll performance metrics
CREATE TABLE poll_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2), -- (votes / views) * 100
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(poll_id, date)
);
```

---

## 📈 Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up Supabase project
- [ ] Create all tables and relationships
- [ ] Set up RLS policies
- [ ] Create database functions
- [ ] Populate reference data (states, default polls)
- [ ] Set up environment variables

### Phase 2: Core Integration (Week 2)
- [ ] Install Supabase client
- [ ] Implement `get_or_create_user` function
- [ ] Update UserProfileContext to use Supabase
- [ ] Implement user state selection with Supabase
- [ ] Test authentication flow end-to-end

### Phase 3: Polls Migration (Week 3)
- [ ] Migrate 20 default polls to database
- [ ] Implement poll loading from Supabase
- [ ] Implement vote casting with `cast_vote` function
- [ ] Implement poll creation with `create_poll` function
- [ ] Test points/EXP rewards
- [ ] Test level up functionality

### Phase 4: Data Migration (Week 4)
- [ ] Create data migration scripts
- [ ] Test migration with sample data
- [ ] Implement dual-write strategy
- [ ] Monitor for data consistency issues
- [ ] Full migration of existing localStorage data

### Phase 5: Real-time Features (Week 5)
- [ ] Implement real-time vote updates
- [ ] Implement real-time user stats updates
- [ ] Add live poll counters
- [ ] Test real-time subscriptions

### Phase 6: Optimization (Week 6)
- [ ] Implement caching strategy
- [ ] Optimize database queries
- [ ] Add materialized views
- [ ] Set up database indexes
- [ ] Performance testing and tuning

### Phase 7: Future Features (Week 7+)
- [ ] Implement leaderboard system
- [ ] Add user profile pages
- [ ] Implement notifications
- [ ] Add poll analytics dashboard
- [ ] Implement admin moderation tools

---

## 🧪 Testing Plan

### 1. Unit Tests
```typescript
// tests/supabase/vote.test.ts
import { supabase } from '@/lib/supabase';

describe('Vote Functionality', () => {
  it('should cast a vote successfully', async () => {
    const { data, error } = await supabase.rpc('cast_vote', {
      p_poll_id: 'test-poll-id',
      p_option_id: 'test-option-id',
      p_option_index: 0,
      p_user_state: 'selangor'
    });

    expect(error).toBeNull();
    expect(data.success).toBe(true);
    expect(data.points_earned).toBe(10);
    expect(data.exp_earned).toBe(10);
  });

  it('should prevent double voting', async () => {
    // Cast first vote
    await supabase.rpc('cast_vote', { /* ... */ });

    // Try to vote again
    const { error } = await supabase.rpc('cast_vote', { /* ... */ });

    expect(error).not.toBeNull();
    expect(error.message).toContain('already voted');
  });
});
```

---

### 2. Integration Tests
```typescript
// tests/integration/polls-flow.test.ts
describe('Polls Flow', () => {
  it('should complete full voting flow', async () => {
    // 1. Login
    // 2. Select state
    // 3. Load polls
    // 4. Cast vote
    // 5. Verify vote recorded
    // 6. Verify points awarded
    // 7. Verify poll results updated
  });

  it('should create and vote on custom poll', async () => {
    // 1. Login
    // 2. Create poll (costs 200 points)
    // 3. Verify poll created
    // 4. Verify points deducted
    // 5. Verify EXP awarded
    // 6. Vote on own poll (should fail or succeed based on business logic)
  });
});
```

---

### 3. Performance Tests
```typescript
// tests/performance/load.test.ts
describe('Performance', () => {
  it('should handle 100 concurrent votes', async () => {
    const promises = Array.from({ length: 100 }, () =>
      supabase.rpc('cast_vote', { /* ... */ })
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    expect(successful).toBe(100);
  });

  it('should load polls in under 500ms', async () => {
    const start = Date.now();
    await supabase.from('polls_with_stats').select('*');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(500);
  });
});
```

---

### 4. Security Tests
```typescript
// tests/security/rls.test.ts
describe('RLS Policies', () => {
  it('should prevent users from modifying others points', async () => {
    // Try to directly update another user's points
    const { error } = await supabase
      .from('users')
      .update({ points: 9999999 })
      .eq('id', 'other-user-id');

    expect(error).not.toBeNull();
  });

  it('should prevent users from viewing other user votes', async () => {
    const { data } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', 'other-user-id');

    expect(data).toEqual([]);
  });
});
```

---

## 📚 Environment Variables

Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Privy (existing)
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

---

## 🔐 Security Best Practices

1. **Never expose service_role key on client**
   - Use anon key for client-side operations
   - Use RLS to enforce data access rules

2. **Always use parameterized queries**
   - Prevents SQL injection
   - Supabase client handles this automatically

3. **Implement rate limiting**
   - Prevent abuse of vote/create poll functions
   - Use Supabase Edge Functions or API routes for rate limiting

4. **Validate all inputs**
   - Server-side validation in database functions
   - Client-side validation for UX

5. **Audit user actions**
   - Use `user_activities` table
   - Monitor for suspicious patterns

---

## 📊 Monitoring & Observability

1. **Supabase Dashboard**
   - Monitor query performance
   - Track RLS policy execution
   - View database logs

2. **Custom Metrics**
```typescript
// lib/metrics.ts
export async function trackMetric(name: string, value: number, metadata?: any) {
  // Send to analytics service (PostHog, Mixpanel, etc.)
  // Or store in custom analytics table
  await supabase
    .from('metrics')
    .insert({
      metric_name: name,
      value,
      metadata,
      timestamp: new Date().toISOString()
    });
}
```

3. **Error Tracking**
```typescript
// Sentry, LogRocket, etc.
import * as Sentry from '@sentry/nextjs';

export async function handleSupabaseError(error: any, context: any) {
  console.error('Supabase error:', error);
  Sentry.captureException(error, { extra: context });
}
```

---

## ✅ Pre-Launch Checklist

- [ ] All tables created with proper indexes
- [ ] RLS policies tested and verified
- [ ] Database functions tested
- [ ] Migration scripts tested with sample data
- [ ] Real-time subscriptions working
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Documentation complete
- [ ] Team trained on new system

---

## 🎯 Success Metrics

**Technical:**
- Query response time < 200ms (p95)
- Real-time message delivery < 500ms
- 99.9% uptime
- Zero data loss during migration

**Business:**
- User engagement (votes per user)
- Poll creation rate
- User retention
- System reliability

---

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/plpgsql.html)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

## 🤝 Support & Maintenance

**Post-Launch:**
1. Monitor database performance daily for first week
2. Check error logs regularly
3. Gather user feedback
4. Iterate on performance optimizations
5. Plan for future feature additions based on usage patterns

---

**Document Version:** 1.0  
**Last Updated:** October 30, 2025  
**Prepared for:** My Peta Malaysia - Supabase Integration  
**Status:** Ready for Review & Implementation

