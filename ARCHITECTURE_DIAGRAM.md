# My Peta Malaysia - System Architecture

## 🏗️ Complete System Architecture (After Supabase Integration)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────┐          │
│  │                    Next.js Application                        │          │
│  │  ┌────────────────────────────────────────────────────────┐  │          │
│  │  │              Pages (UI Components)                      │  │          │
│  │  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐   │  │          │
│  │  │  │  Home    │  │  Polls   │  │  User Profile     │   │  │          │
│  │  │  │  /       │  │  /polls  │  │  (Dialog)         │   │  │          │
│  │  │  └──────────┘  └──────────┘  └───────────────────┘   │  │          │
│  │  └────────────────────────────────────────────────────────┘  │          │
│  │                            │                                   │          │
│  │  ┌─────────────────────────▼──────────────────────────────┐  │          │
│  │  │              React Contexts (State Management)          │  │          │
│  │  │  ┌────────────────┐  ┌─────────────────────────────┐  │  │          │
│  │  │  │ UserProfile    │  │ Data Context               │  │  │          │
│  │  │  │ Context        │  │ (External Gov APIs)        │  │  │          │
│  │  │  │                │  │                             │  │  │          │
│  │  │  │ - State        │  │ - Income Data              │  │  │          │
│  │  │  │ - Points       │  │ - Population Data          │  │  │          │
│  │  │  │ - EXP          │  │ - Crime Data               │  │  │          │
│  │  │  │ - Level        │  │ - Water Consumption        │  │  │          │
│  │  │  └────────────────┘  └─────────────────────────────┘  │  │          │
│  │  │              │                      │                   │  │          │
│  │  │              └──────────┬───────────┘                   │  │          │
│  │  └─────────────────────────┼───────────────────────────────┘  │          │
│  │                            │                                   │          │
│  │  ┌─────────────────────────▼──────────────────────────────┐  │          │
│  │  │              Supabase Client SDK                        │  │          │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  │          │
│  │  │  │ PostgreSQL   │  │ Real-time    │  │ Auth        │  │  │          │
│  │  │  │ REST API     │  │ WebSocket    │  │ (Privy JWT) │  │  │          │
│  │  │  └──────────────┘  └──────────────┘  └─────────────┘  │  │          │
│  │  │                                                          │  │          │
│  │  │  Client Cache: 60s TTL, Optimistic Updates             │  │          │
│  │  └──────────────────────────────────────────────────────────┘  │          │
│  └──────────────────────────────────────────────────────────────────┘          │
│                                 │                                             │
└─────────────────────────────────┼─────────────────────────────────────────────┘
                                  │ HTTPS / WSS
                    ┌─────────────┴─────────────┐
                    │                           │
┌───────────────────▼────────────┐  ┌──────────▼────────────────────────────────┐
│     Privy Platform             │  │     External Government APIs              │
│  ┌──────────────────────────┐  │  │  ┌────────────────────────────────────┐  │
│  │  X/Twitter OAuth         │  │  │  │  Department of Statistics          │  │
│  │  - User Authentication   │  │  │  │  - Income Data                     │  │
│  │  - Profile Data          │  │  │  │  - Population Data                 │  │
│  │  - JWT Token Generation  │  │  │  │  - Household Expense               │  │
│  └──────────────────────────┘  │  │  │                                    │  │
└─────────────────────────────────┘  │  │  Royal Malaysia Police             │  │
                                     │  │  - Crime Statistics                │  │
                                     │  │                                    │  │
                                     │  │  National Water Services           │  │
                                     │  │  - Water Consumption Data          │  │
                                     │  └────────────────────────────────────┘  │
                                     └───────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼─────────────────────────────────────────────┐
│                           SUPABASE PLATFORM                                   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     PostgreSQL Database                                │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        Tables                                    │  │  │
│  │  │                                                                  │  │  │
│  │  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │  │  │
│  │  │  │   users      │    │    polls     │    │poll_options  │     │  │  │
│  │  │  ├──────────────┤    ├──────────────┤    ├──────────────┤     │  │  │
│  │  │  │ id           │◄───┤ created_by   │◄───┤ poll_id      │     │  │  │
│  │  │  │ privy_id (UK)│    │ question     │    │ option_index │     │  │  │
│  │  │  │ username     │    │ description  │    │ label        │     │  │  │
│  │  │  │ email        │    │ category     │    │ emoji        │     │  │  │
│  │  │  │ state_id (FK)│    │ is_active    │    └──────────────┘     │  │  │
│  │  │  │ points       │    │ end_date     │           │             │  │  │
│  │  │  │ exp          │    └──────────────┘           │             │  │  │
│  │  │  │ created_at   │           │                   │             │  │  │
│  │  │  └──────────────┘           │                   │             │  │  │
│  │  │         │                   │                   │             │  │  │
│  │  │         │    ┌──────────────▼───────────────────▼──────────┐  │  │  │
│  │  │         │    │              votes                           │  │  │  │
│  │  │         │    ├──────────────────────────────────────────────┤  │  │  │
│  │  │         └────┤ user_id (FK)                                 │  │  │  │
│  │  │              │ poll_id (FK)                                 │  │  │  │
│  │  │              │ poll_option_id (FK)                          │  │  │  │
│  │  │              │ option_index                                 │  │  │  │
│  │  │              │ user_state (FK)                              │  │  │  │
│  │  │              │ created_at                                   │  │  │  │
│  │  │              │ UNIQUE(poll_id, user_id) ← No double voting │  │  │  │
│  │  │              └──────────────────────────────────────────────┘  │  │  │
│  │  │                         │                                       │  │  │
│  │  │              ┌──────────▼────────────────────────────────┐     │  │  │
│  │  │              │    vote_state_breakdown                   │     │  │  │
│  │  │              ├───────────────────────────────────────────┤     │  │  │
│  │  │              │ poll_id (FK)                              │     │  │  │
│  │  │              │ option_index                              │     │  │  │
│  │  │              │ state_id (FK)                             │     │  │  │
│  │  │              │ vote_count (Auto-updated by trigger)      │     │  │  │
│  │  │              └───────────────────────────────────────────┘     │  │  │
│  │  │                                                                 │  │  │
│  │  │  ┌──────────────────────────────────────────────────────────┐ │  │  │
│  │  │  │              user_transactions (Audit Trail)             │ │  │  │
│  │  │  ├──────────────────────────────────────────────────────────┤ │  │  │
│  │  │  │ user_id (FK)                                             │ │  │  │
│  │  │  │ transaction_type (vote, poll_create, admin_adjustment)  │ │  │  │
│  │  │  │ points_change                                            │ │  │  │
│  │  │  │ exp_change                                               │ │  │  │
│  │  │  │ balance_after_points                                     │ │  │  │
│  │  │  │ balance_after_exp                                        │ │  │  │
│  │  │  │ reference_id (poll_id or vote_id)                        │ │  │  │
│  │  │  │ created_at (Immutable - never delete/update)             │ │  │  │
│  │  │  └──────────────────────────────────────────────────────────┘ │  │  │
│  │  │                                                                 │  │  │
│  │  │  ┌──────────────┐                                              │  │  │
│  │  │  │   states     │ (Reference table - 16 Malaysian states)     │  │  │
│  │  │  ├──────────────┤                                              │  │  │
│  │  │  │ id (PK)      │ (johor, selangor, penang, etc.)             │  │  │
│  │  │  │ name         │                                              │  │  │
│  │  │  │ display_order│                                              │  │  │
│  │  │  └──────────────┘                                              │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Database Functions (SECURITY DEFINER)              │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ get_or_create_user()                                    │   │  │  │
│  │  │  │ - Creates user if not exists                            │   │  │  │
│  │  │  │ - Updates profile on login                              │   │  │  │
│  │  │  │ - Returns full user object                              │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ cast_vote(poll_id, option_id, option_index, state)      │   │  │  │
│  │  │  │ - Validates poll is active                              │   │  │  │
│  │  │  │ - Checks for double voting                              │   │  │  │
│  │  │  │ - Inserts vote                                           │   │  │  │
│  │  │  │ - Awards points (+10) and EXP (+10) ATOMICALLY          │   │  │  │
│  │  │  │ - Logs transaction                                       │   │  │  │
│  │  │  │ - Returns level up status                               │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ create_poll(question, description, category, options)   │   │  │  │
│  │  │  │ - Validates user has 200 points                         │   │  │  │
│  │  │  │ - Creates poll and options                              │   │  │  │
│  │  │  │ - Deducts points (-200) and awards EXP (+200)           │   │  │  │
│  │  │  │ - Logs transaction                                       │   │  │  │
│  │  │  │ - Returns poll ID and level up status                   │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ update_user_state(state_id)                             │   │  │  │
│  │  │  │ - Validates state exists                                │   │  │  │
│  │  │  │ - Updates user's selected state                         │   │  │  │
│  │  │  │ - Logs activity                                          │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    Database Triggers                            │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ trigger_update_vote_state_breakdown                     │   │  │  │
│  │  │  │ ON votes INSERT                                          │   │  │  │
│  │  │  │ → Automatically updates vote_state_breakdown table      │   │  │  │
│  │  │  │ → Maintains real-time state statistics                  │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │              Materialized Views (Performance)                   │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ poll_statistics                                          │   │  │  │
│  │  │  │ - Pre-computed vote counts per poll                     │   │  │  │
│  │  │  │ - Pre-computed percentages                              │   │  │  │
│  │  │  │ - Refreshed after votes                                 │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ user_leaderboard                                         │   │  │  │
│  │  │  │ - Ranked by points and EXP                              │   │  │  │
│  │  │  │ - Includes vote counts and poll creation counts         │   │  │  │
│  │  │  │ - Refreshed periodically                                │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │            Row Level Security (RLS) Policies                    │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ users: Can view own profile, update own data            │   │  │  │
│  │  │  │        CANNOT directly change points/exp                │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ polls: Anyone can view active polls                     │   │  │  │
│  │  │  │        Creators can update their own polls              │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ votes: Users can view own votes only                    │   │  │  │
│  │  │  │        Votes enforced via cast_vote() function          │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  │  ┌─────────────────────────────────────────────────────────┐   │  │  │
│  │  │  │ vote_state_breakdown: Read-only for everyone            │   │  │  │
│  │  │  │                       Updated by triggers only          │   │  │  │
│  │  │  └─────────────────────────────────────────────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                      Indexes (Performance)                      │  │  │
│  │  │  • users(privy_user_id) - UNIQUE                                │  │  │
│  │  │  • users(points, exp) - For leaderboards                        │  │  │
│  │  │  • polls(category, is_active, created_at) - For filtering       │  │  │
│  │  │  • votes(poll_id, user_id) - UNIQUE constraint + fast lookup    │  │  │
│  │  │  • votes(user_state) - For state-based analytics               │  │  │
│  │  │  • All foreign keys automatically indexed                       │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     Real-time Engine (WebSocket)                      │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │  │
│  │  │  Subscriptions:                                                  │ │  │
│  │  │  • votes table → Live vote counts per poll                      │ │  │
│  │  │  • users table → Live points/exp updates                        │ │  │
│  │  │  • polls table → New poll notifications                         │ │  │
│  │  │                                                                  │ │  │
│  │  │  Channels:                                                       │ │  │
│  │  │  • poll-{id} → Updates for specific poll                        │ │  │
│  │  │  • user-{id} → Updates for specific user                        │ │  │
│  │  │  • leaderboard → Global leaderboard changes                     │ │  │
│  │  └─────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     Backups & Recovery                                │  │
│  │  • Automated daily backups (Pro tier+)                               │  │
│  │  • Point-in-time recovery (Team tier+)                               │  │
│  │  • Download backups anytime                                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Example 1: User Casts a Vote

```
User clicks vote button
    │
    ▼
React Component (Optimistic Update - Instant UI feedback)
    │
    ▼
Supabase Client: supabase.rpc('cast_vote', { poll_id, option_id, ... })
    │
    ▼
Supabase Platform (HTTPS)
    │
    ├─► Validates JWT token
    │
    ├─► Executes cast_vote() function
    │   │
    │   ├─► Check poll is active ✓
    │   ├─► Check user hasn't voted ✓
    │   ├─► INSERT INTO votes
    │   ├─► UPDATE users SET points = points + 10, exp = exp + 10
    │   ├─► INSERT INTO user_transactions (audit)
    │   └─► RETURN { success: true, points_earned: 10, leveled_up: false }
    │
    ├─► Trigger: update_vote_state_breakdown
    │   └─► UPDATE vote_state_breakdown (state analytics)
    │
    └─► Real-time broadcast to subscribers
        └─► WebSocket message to all clients watching this poll
    │
    ▼
React Component receives response
    │
    ├─► Update local state (votes, points, exp)
    ├─► Show success toast notification
    └─► Trigger confetti if level up 🎉
```

**Time: ~300ms** (database write + real-time broadcast)

---

### Example 2: User Creates a Poll

```
User fills poll form and clicks "Create"
    │
    ▼
React Component validates inputs
    │
    ▼
Supabase Client: supabase.rpc('create_poll', { question, options, ... })
    │
    ▼
Supabase Platform (HTTPS)
    │
    ├─► Validates JWT token
    │
    ├─► Executes create_poll() function
    │   │
    │   ├─► Check user has ≥200 points ✓
    │   ├─► INSERT INTO polls
    │   ├─► INSERT INTO poll_options (for each option)
    │   ├─► UPDATE users SET points = points - 200, exp = exp + 200
    │   ├─► INSERT INTO user_transactions (audit)
    │   └─► RETURN { success: true, poll_id, leveled_up: true }
    │
    └─► Real-time broadcast
        └─► New poll notification to subscribers
    │
    ▼
React Component receives response
    │
    ├─► Update local polls list
    ├─► Update user points/exp
    ├─► Show success + level up notification
    └─► Close create poll dialog
```

**Time: ~400ms** (multiple inserts + point deduction)

---

### Example 3: Page Load (First Visit)

```
User visits /polls
    │
    ▼
React Component mounts
    │
    ├─► Load user data (if authenticated)
    │   │
    │   ▼
    │   Supabase: rpc('get_or_create_user', { privy_user_id, ... })
    │   │
    │   ▼
    │   UserProfileContext updated (state, points, exp)
    │   │
    │   └─► Subscribe to user changes (real-time)
    │
    └─► Load polls
        │
        ▼
        Supabase: from('polls_with_stats').select('*').eq('is_active', true)
        │
        ▼
        Client Cache (60s TTL) ← Store result
        │
        └─► For each poll, load options
            │
            ▼
            Supabase: from('poll_options').select('*').eq('poll_id', ...)
            │
            ▼
            Polls rendered on screen
            │
            └─► Subscribe to vote changes (real-time)
```

**Time: ~800ms first load, ~50ms subsequent (cached)**

---

## 🔐 Security Layers

```
┌────────────────────────────────────────────────────────┐
│ Layer 1: Authentication (Privy)                       │
│ ✓ OAuth with X/Twitter                                │
│ ✓ JWT tokens with expiration                          │
│ ✓ Automatic session refresh                           │
└───────────────────────────────┬────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────┐
│ Layer 2: Transport Security                            │
│ ✓ HTTPS only (TLS 1.3)                                │
│ ✓ WebSocket Secure (WSS)                              │
│ ✓ Certificate pinning                                 │
└───────────────────────────────┬────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────┐
│ Layer 3: Supabase Auth                                │
│ ✓ Validate JWT signature                              │
│ ✓ Check token expiration                              │
│ ✓ Extract user identity                               │
└───────────────────────────────┬────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────┐
│ Layer 4: Row Level Security (RLS)                     │
│ ✓ Check user can access this row                      │
│ ✓ Filter results to allowed data only                 │
│ ✓ Enforce business rules (e.g., can't modify points)  │
└───────────────────────────────┬────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────┐
│ Layer 5: Database Constraints                          │
│ ✓ UNIQUE constraints (no double voting)               │
│ ✓ CHECK constraints (valid categories)                │
│ ✓ Foreign keys (referential integrity)                │
└───────────────────────────────┬────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────┐
│ Layer 6: Audit Trail                                   │
│ ✓ Log all transactions (immutable)                    │
│ ✓ Track all user activities                           │
│ ✓ Timestamps on all records                           │
└────────────────────────────────────────────────────────┘
```

---

## 📊 Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                    Performance Strategy                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Level 1: Database Optimization                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Indexes on all foreign keys                      │    │
│  │ • Indexes on frequently queried columns            │    │
│  │ • Materialized views for expensive queries         │    │
│  │ • Denormalized data where appropriate              │    │
│  │   (e.g., points/exp in users table)               │    │
│  └────────────────────────────────────────────────────┘    │
│                         ▼                                    │
│  Level 2: Application Cache (Client-side)                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • 60 second TTL for poll data                      │    │
│  │ • Automatic invalidation on updates                │    │
│  │ • In-memory cache (React state + Map)              │    │
│  └────────────────────────────────────────────────────┘    │
│                         ▼                                    │
│  Level 3: Server-side Cache (API Routes)                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • s-maxage=60, stale-while-revalidate              │    │
│  │ • Edge caching via Vercel                          │    │
│  │ • Cached at edge locations globally                │    │
│  └────────────────────────────────────────────────────┘    │
│                         ▼                                    │
│  Level 4: CDN (Vercel Edge Network)                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Static assets cached globally                    │    │
│  │ • API responses cached at edge                     │    │
│  │ • Automatic geographic routing                     │    │
│  └────────────────────────────────────────────────────┘    │
│                         ▼                                    │
│  Level 5: Optimistic UI Updates                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Instant feedback on user actions                 │    │
│  │ • Update UI before server response                 │    │
│  │ • Rollback if server returns error                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Result: 
- First load: ~800ms (includes auth)
- Subsequent loads: ~50ms (cached)
- Vote action: ~300ms (database write)
- Perceived latency: <100ms (optimistic updates)
```

---

## 🚀 Scaling Strategy

```
┌─────────────┬──────────────┬────────────────────────────────────┐
│ User Count  │ Infrastructure│ Optimizations                     │
├─────────────┼──────────────┼────────────────────────────────────┤
│ 0 - 1,000   │ Supabase Free│ • Basic indexes                   │
│             │              │ • No special optimization needed   │
│             │              │ • Single database instance         │
├─────────────┼──────────────┼────────────────────────────────────┤
│ 1k - 10k    │ Supabase Pro │ • All indexes in place            │
│             │              │ • Materialized views               │
│             │              │ • Client-side caching              │
│             │              │ • Daily backups                    │
├─────────────┼──────────────┼────────────────────────────────────┤
│ 10k - 50k   │ Supabase Pro │ • Read replicas                   │
│             │ + CDN        │ • Aggressive edge caching          │
│             │              │ • Connection pooling               │
│             │              │ • Table partitioning (votes)       │
├─────────────┼──────────────┼────────────────────────────────────┤
│ 50k - 100k+ │ Supabase Team│ • Multiple read replicas          │
│             │              │ • Global CDN                       │
│             │              │ • Scheduled materialized refresh   │
│             │              │ • Point-in-time recovery           │
│             │              │ • Custom optimization             │
└─────────────┴──────────────┴────────────────────────────────────┘
```

---

## 📁 File Structure

```
petamalaysia/
├── lib/
│   ├── supabase.ts           # Supabase client initialization
│   ├── cache.ts              # Client-side caching utilities
│   └── constants.ts          # Existing constants
├── contexts/
│   ├── UserProfileContext.tsx  # Updated with Supabase
│   ├── DataContext.tsx         # Unchanged (external APIs)
│   └── ThemeContext.tsx        # Unchanged
├── pages/
│   ├── index.tsx              # Home (data visualization)
│   ├── polls/
│   │   └── index.tsx          # Updated with Supabase
│   └── api/
│       └── polls/
│           └── [...].ts       # Optional API routes
├── scripts/
│   └── migrate-polls.ts       # Migration utilities
├── data/
│   └── polls.ts               # Default polls data
└── docs/ (NEW)
    ├── SUPABASE_INTEGRATION_PLAN.md
    ├── SUPABASE_SOLUTION_VALIDATION.md
    ├── SUPABASE_QUICKSTART.md
    ├── DATABASE_INTEGRATION_SUMMARY.md
    └── ARCHITECTURE_DIAGRAM.md (this file)
```

---

## 🎓 Key Architectural Decisions

### ✅ Why PostgreSQL (via Supabase)?
- **Relational data** (users, polls, votes have clear relationships)
- **ACID compliance** (critical for point/exp transactions)
- **Mature indexing** (fast queries on large datasets)
- **Powerful querying** (complex analytics queries)
- **Standard SQL** (easy to understand and optimize)

### ✅ Why Denormalize Points/EXP?
- **Performance:** No JOIN needed to get user stats
- **Atomic updates:** Single UPDATE statement
- **Audit trail:** Transactions table provides history
- **Frequent access:** Points/exp displayed on every page

### ✅ Why Materialized Views?
- **Performance:** Pre-computed complex queries
- **Consistency:** Refreshed on schedule or after updates
- **Simplicity:** Acts like a regular table to clients

### ✅ Why Triggers for State Breakdown?
- **Automatic:** Updates happen without client code
- **Consistency:** Can't forget to update breakdown
- **Atomic:** Updated in same transaction as vote

### ✅ Why SECURITY DEFINER Functions?
- **Security:** Users can't bypass business logic
- **Atomicity:** All operations in single transaction
- **Validation:** Server-side validation guaranteed

---

**Last Updated:** October 30, 2025  
**For:** My Peta Malaysia - Supabase Integration

