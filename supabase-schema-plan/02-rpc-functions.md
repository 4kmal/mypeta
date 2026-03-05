# MyPeta RPC Functions

All write operations use `SECURITY DEFINER` PostgreSQL functions because Clerk authentication is external to Supabase Auth. The app calls these via `supabase.rpc('function_name', { params })`.

---

## 1. `get_or_create_user`

**Purpose:** On Clerk login, either find the existing user or create a new one.

**Called by:** `contexts/UserProfileContext.tsx` (line 79)

```
Parameters:
  p_clerk_user_id       TEXT     -- Clerk's user.id
  p_username            TEXT     -- Display name
  p_email               TEXT     -- Email address
  p_profile_picture_url TEXT     -- Avatar URL

Returns TABLE:
  user_id        UUID       -- Internal database UUID
  selected_state TEXT       -- User's selected Malaysian state (nullable)
  points         INTEGER    -- Current point balance
  exp            INTEGER    -- Current experience points
  is_new_user    BOOLEAN    -- true if just created
```

**Behavior:**
- If `clerk_user_id` exists → update `last_login`, `username`, `profile_picture_url` → return existing data
- If not → INSERT new user with 0 points/exp → return with `is_new_user = true`
- When `is_new_user` is true, the frontend shows the state selector dialog

---

## 2. `update_user_state`

**Purpose:** Set the user's selected Malaysian state.

**Called by:** `contexts/UserProfileContext.tsx` (line 140)

```
Parameters:
  p_clerk_user_id  TEXT     -- Clerk's user.id
  p_state_id       TEXT     -- State ID (e.g., 'selangor')

Returns: VOID
```

**Behavior:**
- Updates `users.selected_state` and `updated_at`
- The state ID must exist in the `states` table

---

## 3. `update_user_points_exp`

**Purpose:** Adjust a user's points and/or EXP by a delta amount.

**Called by:** `contexts/UserProfileContext.tsx` (lines 171, 206, 252, 291)

```
Parameters:
  p_clerk_user_id  TEXT      -- Clerk's user.id
  p_points_delta   INTEGER   -- Points to add (negative to deduct)
  p_exp_delta      INTEGER   -- EXP to add

Returns: VOID
```

**Behavior:**
- Adds deltas to current values: `points = points + delta`, `exp = exp + delta`
- Used by `addPoints()`, `addExp()`, `addPointsAndExp()`, `deductPoints()` in UserProfileContext
- Note: `cast_vote` and `create_poll` handle their own point/exp updates atomically

---

## 4. `cast_vote`

**Purpose:** Cast a vote on a poll. Atomically inserts vote + awards points/EXP.

**Called by:** `pages/polls/index.tsx` (line 434)

```
Parameters:
  p_poll_id        UUID     -- Poll to vote on
  p_option_id      UUID     -- Selected poll_option.id
  p_option_index   INTEGER  -- Selected option index (0, 1, ...)
  p_user_state     TEXT     -- User's current state
  p_clerk_user_id  TEXT     -- Clerk's user.id

Returns JSONB:
  {
    "success":       true,
    "points_earned": 10,
    "exp_earned":    10,
    "new_level":     2,
    "leveled_up":    false
  }
```

**Behavior:**
1. Looks up internal user ID from `clerk_user_id`
2. Checks if user already voted (unique constraint on `poll_id + user_id`)
3. Inserts into `votes` table
4. Awards +10 points, +10 EXP
5. Calculates level: `floor(exp / 1000) + 1`
6. Returns whether a level-up occurred

**Error cases:**
- `'User not found'` — invalid clerk_user_id
- `'User has already voted on this poll'` — duplicate vote attempt

---

## 5. `create_poll`

**Purpose:** Create a new user poll. Costs 200 points, awards 200 EXP.

**Called by:** `pages/polls/index.tsx` (line 701)

```
Parameters:
  p_question       TEXT          -- Poll question
  p_description    TEXT          -- Description
  p_category       TEXT          -- 'food'|'politics'|'culture'|'economy'|'social'
  p_options        JSONB         -- [{label: "...", emoji: "..."}, ...]
  p_clerk_user_id  TEXT          -- Clerk's user.id
  p_end_date       TIMESTAMPTZ   -- Optional end date (nullable)

Returns JSONB:
  {
    "poll_id":         "uuid-here",
    "points_deducted": 200,
    "exp_earned":      200,
    "new_level":       3,
    "leveled_up":      true
  }
```

**Behavior:**
1. Looks up internal user ID from `clerk_user_id`
2. Checks user has ≥ 200 points
3. Inserts into `polls` table (with `is_system_poll = false`)
4. Inserts each option into `poll_options` with incrementing `option_index`
5. Deducts 200 points, awards 200 EXP
6. Returns result with level-up info

**Error cases:**
- `'User not found'` — invalid clerk_user_id
- `'Insufficient points. Need 200 points.'` — not enough points

---

## 6. `get_all_poll_results`

**Purpose:** Get aggregated vote counts for all polls in a single query.

**Called by:** `pages/polls/index.tsx` (line 196)

```
Parameters: (none)

Returns TABLE:
  poll_id          UUID     -- Poll identifier
  option_index     INTEGER  -- Which option (0, 1, ...)
  total_votes      BIGINT   -- Total votes for this option
  state_breakdown  JSONB    -- { "selangor": 5, "johor": 3, ... }
```

**Behavior:**
- Joins `poll_options` with `votes` to count votes per option
- Aggregates state-level breakdown into a JSONB object
- Returns one row per poll option (so a 2-option poll returns 2 rows)
- The frontend transforms this into `{ [pollId]: { votes: [...], totalVotes, stateBreakdown } }`
