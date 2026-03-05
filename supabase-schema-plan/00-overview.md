# MyPeta Supabase Schema Overview

## Summary

MyPeta uses **Supabase (PostgreSQL)** as its backend database with **Clerk** for authentication. Since Clerk handles auth externally (not via Supabase Auth), all write operations go through `SECURITY DEFINER` RPC functions.

## Architecture

```
┌─────────────┐     ┌───────────┐     ┌──────────────────────┐
│  Next.js    │────▶│  Clerk    │     │  Supabase            │
│  Frontend   │     │  (Auth)   │     │                      │
│             │────────────────────▶  │  PostgreSQL DB       │
│  Pages      │     clerk_user_id     │  ├── tables (5)      │
│  Contexts   │◀────realtime──────────│  ├── rpc functions(6)│
│  Hooks      │                       │  └── rls policies    │
└─────────────┘                       └──────────────────────┘
```

## Tables (5)

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `states` | 16 Malaysian states reference | Referenced by `users`, `votes` |
| `users` | User profiles synced from Clerk | FK to `states` |
| `polls` | Poll questions & metadata | FK to `users` (creator) |
| `poll_options` | Answer choices per poll | FK to `polls` |
| `votes` | Individual vote records | FK to `polls`, `users`, `poll_options`, `states` |

## RPC Functions (6)

| Function | Purpose | Called From |
|----------|---------|-------------|
| `get_or_create_user` | Create/return user on login | `UserProfileContext.tsx` |
| `update_user_state` | Set user's selected state | `UserProfileContext.tsx` |
| `update_user_points_exp` | Adjust points/EXP | `UserProfileContext.tsx` |
| `cast_vote` | Vote atomically + award rewards | `pages/polls/index.tsx` |
| `create_poll` | Create poll + deduct points | `pages/polls/index.tsx` |
| `get_all_poll_results` | Aggregated results + state breakdown | `pages/polls/index.tsx` |

## Realtime

- **Channel:** `user-changes` on `users` table (UPDATE events filtered by `id`)
- **Purpose:** Live sync of points/EXP changes to the UI

## Data Sources

This schema was reverse-engineered from:
1. `lib/supabase.ts` — TypeScript `Database` interface (lines 17-81)
2. All `supabase.from()` and `supabase.rpc()` calls across the codebase
3. Deleted `SUPABASE_INTEGRATION_PLAN.md` recovered from git commit `566a319`
4. `CLAUDE.md` and `README.md` architecture descriptions
