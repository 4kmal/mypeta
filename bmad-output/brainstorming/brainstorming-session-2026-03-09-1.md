---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Migrating from Clerk to Supabase Auth in mypeta'
session_goals: 'Develop a solid migration strategy — approach options, sequencing, risks, and architectural decisions'
selected_approach: 'user-selected'
techniques_used: ['SCAMPER Method']
ideas_generated: [37]
session_active: false
workflow_completed: true
facilitation_notes: 'User made clear, decisive choices throughout. Strong instinct for separation of concerns (profiles vs auth.users, ThemeProvider vs LanguageProvider). Most energised during gamification enhancement ideas — atomic transactions was the standout breakthrough.'
---

# Brainstorming Session Results

**Facilitator:** akmal
**Date:** 2026-03-09

---

## Session Overview

**Topic:** Migrating from Clerk to Supabase Auth in mypeta
**Goals:** Develop a solid migration strategy — approach options, sequencing, risks, and architectural decisions

### Session Setup

Fresh session. No prior context file. User chose User-Selected Techniques approach, then selected SCAMPER Method from the Structured Thinking category.

---

## Technique Selection

**Approach:** User-Selected Techniques
**Selected Techniques:**

- **SCAMPER Method:** Systematically examines the Clerk auth system through 7 lenses to reveal every possible migration approach, substitution, and simplification opportunity. Perfect for mapping what to keep, what to cut, and what to transform.

**Selection Rationale:** SCAMPER is well-suited for a migration task because it forces examination of each component of the existing system from multiple creative angles — not just "swap Clerk for Supabase" but questioning every assumption about what needs to exist at all.

---

## SCAMPER Brainstorming

### S — Substitute

**[Substitute #1]: The Identity Anchor Swap**
_Concept:_ Replace `clerk_user_id` (a string like `user_2abc...`) as the users table foreign key with Supabase's native `auth.users.id` UUID. Every downstream table — `votes`, `polls`, `states` — would reference a real Postgres UUID that Supabase Auth owns natively.
_Novelty:_ This isn't just a column rename. It means Row Level Security (RLS) policies can now use `auth.uid()` directly — no more custom RPC workarounds to validate identity.

**[Substitute #2]: Split Identity from Profile**
_Concept:_ `auth.users` owns identity (email, OAuth tokens, session) — a new `profiles` table owns app data (points, exp, selected_state, username). Linked by `id UUID REFERENCES auth.users(id)`. The profiles row gets created automatically via a Postgres trigger on `auth.users` INSERT.
_Novelty:_ Eliminates the Clerk sync problem entirely. No more `get_or_create_user` RPC called from the frontend on every login — the database creates the profile itself the moment Supabase Auth creates the user.

**[Substitute #3]: Trigger-Born Profiles**
_Concept:_ Replace the `get_or_create_user` frontend RPC call with a Postgres function + trigger: `CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users → INSERT INTO profiles(id, ...)`. Profile creation becomes atomic with sign-up — zero race conditions.
_Novelty:_ Removes an entire class of bugs where a user signs in but their Supabase profile doesn't exist yet because the RPC failed silently.

**[Substitute #4]: Auth-On-Demand Instead of Route-Guard** _(considered, not selected)_
_Concept:_ Make the entire app publicly browsable — auth only required at the action level.
_Novelty:_ Reduces friction for casual visitors. Not selected — user preferred Option A (direct middleware swap).

**[Substitute #5]: Lean Middleware** _(considered, not selected)_
_Concept:_ Middleware only refreshes sessions; auth gates live at component/API level.
_Novelty:_ Eliminates public routes list maintenance. Not selected — user preferred familiar route-guard pattern.

**[Substitute #6]: Direct Middleware Swap**
_Concept:_ Replace `clerkMiddleware()` with Supabase SSR's `updateSession()` keeping the same public/protected route pattern. Public routes stay public, everything else requires a valid Supabase session cookie. Shape of the middleware stays identical — only the auth engine changes.
_Novelty:_ Lowest-risk substitution. The mental model for the app doesn't change, only the underlying auth provider does. Easier to test, easier to roll back if needed.

---

### C — Combine

**[Combine #1]: Unified SupabaseContext**
_Concept:_ Merge `ClerkProvider` auth state, `UserProfileContext` (points, exp, selected_state, internalUserId), and the Supabase real-time subscription into a single `SupabaseProvider`. One hook — `useSupabase()` — replaces `useUser()`, `useClerk()`, and `useUserProfile()` across the entire app.
_Novelty:_ Eliminates the awkward two-step dance where Clerk loads first, then `UserProfileContext` fires a Supabase RPC. Now it's one `onAuthStateChange` listener that populates everything atomically.

**[Combine #2]: Profile Fetch + Real-time in One**
_Concept:_ Instead of fetching the profile once on login then setting up a separate real-time subscription, combine them — subscribe to `profiles` immediately on auth, and let the subscription's initial payload serve as the first fetch. One channel, zero duplicate requests.
_Novelty:_ Removes the 500ms artificial delay krackeddev-main uses after sign-in to wait for the trigger to create the profile. The subscription catches the INSERT event itself.

**[Combine #3]: Auth + Onboarding as One Flow**
_Concept:_ After successful sign-up (detected via `onAuthStateChange` with a new user), immediately trigger the state selector dialog as step 2 of onboarding — combined into one sequential experience rather than two disconnected events.
_Novelty:_ New users instantly feel the app's core value proposition (choosing your Malaysian state) as part of getting started, not as an afterthought popup.

**[Combine #4]: Streamlined Provider Stack**
_Concept:_ Replace `ClerkProvider + UserProfileProvider` with a single `SupabaseProvider`. Provider stack becomes: `SupabaseProvider → ThemeProvider → LanguageProvider → DataProvider` — four providers instead of five, each with a single clear responsibility. ThemeProvider and LanguageProvider remain separate (different concerns).
_Novelty:_ Cleaner mental model. Auth/profile in one place, UI preferences separate, data separate. No cross-provider dependencies.

---

### A — Adapt

**[Adapt #1]: GitHub + Google OAuth**
_Concept:_ Adapt krackeddev-main's OAuth flow (GitHub + Google via Supabase Auth providers) into mypeta. The `auth/callback` route exchanges the OAuth code for a session, stores provider metadata in `profiles`, and redirects back to the user's previous page.
_Novelty:_ Mypeta currently has zero social login — Clerk handles it invisibly. Owning the OAuth flow means you control the UX, the redirect behavior, and what gets stored post-login.

**[Adapt #2]: Forgot Password / Reset Flow**
_Concept:_ Adapt krackeddev-main's `forgot-password` + `update-password` pages directly into mypeta's Pages Router structure as `pages/auth/forgot-password.tsx` and `pages/auth/update-password.tsx`. Supabase's `resetPasswordForEmail()` handles the email; the update page validates the recovery session before allowing password change.
_Novelty:_ Clerk handled this silently — users never saw a custom reset page. Now you own the experience and can style it to match mypeta's theme.

**[Adapt #3]: Login Modal Pattern**
_Concept:_ Adapt krackeddev-main's `LoginModal` + `auth-modal.tsx` pattern — a global modal controlled by `SupabaseContext` (`isLoginModalOpen`, `openLoginModal()`, `closeLoginModal()`). The existing `AuthButton` triggers it; poll voting and other gated actions call `openLoginModal()` directly instead of redirecting.
_Novelty:_ Mypeta already uses modal patterns (state selector, user stats). A login modal fits naturally — no page navigation disruption when a user tries to vote while browsing.

**[Adapt #4]: Soft Ban System**
_Concept:_ Add a `status` column to `profiles` (`'active'` | `'banned'`). Adapt krackeddev-main's middleware ban check — if `profiles.status = 'banned'`, redirect to a `/banned` page.
_Novelty:_ Mypeta has a polling system with gamification points — ban evasion and vote manipulation are real concerns. A lightweight ban system prevents the need for full account deletion.

**[Adapt #5]: State Selection as Onboarding Enforcement**
_Concept:_ Adapt krackeddev-main's onboarding middleware check — but instead of enforcing `onboarding_completed`, enforce `selected_state IS NOT NULL`. New users who haven't picked a Malaysian state get redirected to a `/onboarding` page before accessing gated features.
_Novelty:_ `selected_state` is mypeta's core identity feature. Enforcing selection at the middleware level ensures no user slips through without it.

**[Adapt #6]: Admin Role for Poll Management**
_Concept:_ Add an `is_admin` boolean to `profiles`. Adapt krackeddev-main's admin middleware check using `getUser()` (server-verified) to protect a future `/admin` route for managing polls, categories, and featured states.
_Novelty:_ Poll creation (`is_system_poll`) is already in the schema — this makes a future admin UI straightforward.

**[Adapt #7]: Rate Limiting on Vote API**
_Concept:_ Adapt krackeddev-main's in-process rate limiter (30 req/60s per user) wrapping the middleware. Apply to mypeta's mutation endpoints — `/api/polls/vote`, `/api/user/update-state`, `/api/user/update-points`. Extracts user ID from the Supabase JWT `sub` claim, falls back to IP.
_Novelty:_ Without this, a determined user could spam vote calls and game the points/EXP system.

---

### M — Modify

**[Modify #1]: Atomic Gamification Transactions** ⭐ _Breakthrough_
_Concept:_ Replace separate `addPoints()` and `addExp()` calls with a single Postgres function `award_gamification(p_user_id uuid, p_points int, p_exp int, p_reason text)` wrapped in a transaction. Both columns update atomically — if either fails, both roll back. The RPC returns the new totals for optimistic update confirmation.
_Novelty:_ Eliminates silent partial updates where a user gains points but not exp (or vice versa) if the connection drops mid-update — corrupting their level calculation.

**[Modify #2]: Server-Side Level Calculation**
_Concept:_ Move `level = Math.floor(exp / 1000) + 1` out of the React context and into the `award_gamification` Postgres function. The RPC calculates and stores the new level server-side, returning `{ points, exp, level, level_up: boolean }`.
_Novelty:_ Level becomes tamper-proof. A user cannot manipulate their displayed level by modifying context state in DevTools.

**[Modify #3]: Level-Up Event Broadcasting**
_Concept:_ When `award_gamification` detects a level-up, it inserts a row into a `gamification_events` table (`user_id, event_type: 'level_up', old_level, new_level, created_at`). The real-time subscription in `SupabaseContext` listens for this and triggers a celebration animation.
_Novelty:_ The database tells the frontend "this user just levelled up" rather than the frontend constantly checking if exp crossed a threshold.

**[Modify #4]: Magnified Optimistic Updates with Rollback Queue**
_Concept:_ Extend the current optimistic update pattern with a rollback queue — before any gamification RPC call, push the previous state onto a queue. If the call fails, pop the queue and restore exact previous values. Handles rapid sequential actions correctly.
_Novelty:_ Current implementation doesn't handle rapid sequential actions — the second vote could optimistically update on top of an already-rolled-back state from the first.

**[Modify #5]: Minimise — Remove `internalUserId`**
_Concept:_ Eliminate the `internalUserId` concept from context entirely. After migration, `user.id` from `supabase.auth.getUser()` is the profile ID directly — one ID, used everywhere, always from `auth.uid()`.
_Novelty:_ Removes an entire category of bugs where the wrong ID gets passed to an RPC.

---

### P — Put to Other Uses

**[Put #1]: RLS as Vote Integrity Enforcer**
_Concept:_ Use `auth.uid()` in a Postgres unique constraint on `votes(poll_id, user_id)` combined with an RLS INSERT policy that checks `auth.uid() = user_id`. The database rejects duplicate votes as a constraint violation.
_Novelty:_ Moves vote integrity from application-level logic to database-level physics.

**[Put #2]: RLS as Points Tamper Shield**
_Concept:_ Add an RLS UPDATE policy on `profiles` that only allows updating `points` and `exp` via the service role (used by RPC functions) — never directly from the client.
_Novelty:_ Prevents `supabase.from('profiles').update({ points: 99999 })` from the browser console.

**[Put #3]: Auth Session as API Rate Limit Key**
_Concept:_ Put the Supabase JWT `sub` claim to use as a rate limit identifier in middleware for all API mutations — not just auth but for all protected endpoints.
_Novelty:_ Reuses the auth token as a fair, user-specific rate limit key rather than unreliable IP addresses.

**[Put #4]: `selected_state` in RLS for State-Level Data**
_Concept:_ Use `profiles.selected_state` in RLS policies on a future `state_leaderboards` table — users can only see the full leaderboard for their own state without an extra API call.
_Novelty:_ Turns a profile preference into a data access pattern — auth context carries state membership implicitly.

**[Put #5]: Auth Webhooks for Audit Trail**
_Concept:_ Use Supabase Auth's webhook events (`user.created`, `user.deleted`) as triggers for an audit log table — automatically recording user lifecycle events.
_Novelty:_ Free observability on user lifecycle that Clerk currently swallows into its own dashboard.

---

### E — Eliminate

**[Eliminate #1]: The Clerk Dependency Tree**
_Concept:_ Remove `@clerk/nextjs`, all Clerk environment variables, and all `useUser()`, `useClerk()`, `SignInButton`, `SignOutButton` imports. Estimated bundle size reduction: ~180kb.
_Novelty:_ Meaningfully reduces cold start time on Vercel's edge runtime.

**[Eliminate #2]: `get_or_create_user` RPC**
_Concept:_ Remove the frontend-called `get_or_create_user` RPC entirely — replaced by the Postgres trigger from Substitute #3.
_Novelty:_ Removes a failure mode where users have no Supabase profile because the RPC failed silently on login.

**[Eliminate #3]: `clerk_user_id` Column**
_Concept:_ Drop the `clerk_user_id text` column from the users/profiles table after migration. All references replaced by the native `auth.users.id` UUID.
_Novelty:_ Eliminates the dual-identity problem at the schema level.

**[Eliminate #4]: `debug-auth.tsx` Clerk Tests**
_Concept:_ Replace the Clerk section of `pages/debug-auth.tsx` with a Supabase auth health check page testing session validity, profile existence, and RLS policy enforcement.
_Novelty:_ Turns a debugging liability into a useful Supabase health check.

**[Eliminate #5]: `persistSession: false`**
_Concept:_ Remove the explicit `persistSession: false` flag in `lib/supabase.ts` that currently disables Supabase Auth.
_Novelty:_ The single most impactful one-line change in the entire migration.

---

### R — Reverse

**[Reverse #1]: Build Forward, Not Backward**
_Concept:_ Don't migrate existing Clerk sessions — let users sign in fresh via Supabase Auth. Their `selected_state`, `points`, and `exp` are preserved by matching on email. No data migration script needed.
_Novelty:_ Avoids the riskiest part of any auth migration (moving live sessions) by treating it as a clean cutover with email-based profile recovery.

**[Reverse #2]: Ship Auth Pages Before Removing Clerk**
_Concept:_ Build the Supabase sign-in/sign-up pages and `SupabaseProvider` first, test them in parallel while Clerk still runs, then remove Clerk once Supabase auth is confirmed working.
_Novelty:_ Zero downtime migration. Users on the old Clerk flow are unaffected until the flag flips.

**[Reverse #3]: Schema First, Code Second**
_Concept:_ Run Supabase migrations first (add `profiles` table, create trigger, add RLS policies, drop `clerk_user_id`), then update application code to match. The database becomes the spec.
_Novelty:_ Prevents the schema from being shaped by implementation accidents.

**[Reverse #4]: Test on `/debug-auth` Before Going Live**
_Concept:_ Build the entire new auth system and test it exclusively via a new `/debug-auth` page before wiring it into any real component.
_Novelty:_ Creates a safe sandbox that catches auth bugs before they affect real users.

**[Reverse #5]: Remove Clerk Last, Not First**
_Concept:_ Keep `@clerk/nextjs` installed but dormant while Supabase Auth runs in production. Only `npm uninstall @clerk/nextjs` after 1 week of stable operation.
_Novelty:_ A rollback plan. Reverting to Clerk is one line of middleware code if needed.

---

## Idea Organisation and Prioritisation

**Prioritisation Criteria Selected:** Lowest Risk

### Thematic Organisation

| Theme | Ideas | Key Insight |
|---|---|---|
| Schema & Identity Foundation | 6 | Everything depends on splitting `auth.users` from `profiles` |
| Auth Infrastructure | 6 | Direct middleware swap is safe and reversible |
| Auth UX & Flows | 5 | Build in parallel before cutting over |
| Security & Integrity | 6 | RLS makes security structural, not procedural |
| Gamification Enhancement | 4 | Atomic transactions are the standout breakthrough |
| Migration Strategy | 5 | Schema first, Clerk last — de-risks the entire process |
| Future Extensibility | 3 | Unlocked by native auth.uid() availability |

### Prioritisation Results

**Top Priority Ideas (Highest Impact + Lowest Risk):**
1. Schema First, Code Second — defines the spec before any code is written
2. Trigger-Born Profiles — eliminates the most common auth migration failure mode
3. Atomic Gamification Transactions — mypeta's unique breakthrough beyond krackeddev-main
4. Remove Clerk Last, Not First — preserves rollback capability throughout

**Quick Win Opportunities:**
- Remove `persistSession: false` — one line, enables everything
- Remove `internalUserId` — cleanup that simplifies context immediately
- Streamlined Provider Stack — four providers, clear responsibilities

**Breakthrough Concepts:**
- Atomic Gamification Transactions + Server-Side Level Calculation + Level-Up Event Broadcasting — together these make mypeta's gamification system genuinely tamper-proof and reactive
- RLS as Vote Integrity Enforcer — moves game integrity from application code to database physics

---

## Action Plan — The Safe Migration Path

### 🟢 Phase 1: Schema & Foundations (Before touching any app code)
1. Create `profiles` table in Supabase with `id UUID REFERENCES auth.users(id)`
2. Write `on_auth_user_created` trigger function
3. Add RLS policies to `profiles` (read own, service-role-only writes for gamification)
4. Add unique constraint on `votes(poll_id, user_id)`
5. Write `award_gamification` RPC with atomic points+exp+level transaction

### 🟡 Phase 2: Build in Parallel (Clerk still running)
1. Create `lib/supabase/client.ts` and `lib/supabase/server.ts` using `@supabase/ssr`
2. Build `SupabaseProvider` context (not mounted in `_app.tsx` yet)
3. Build `pages/auth/callback.ts` OAuth handler
4. Build `pages/sign-in.tsx` and `pages/sign-up.tsx` with email + GitHub + Google
5. Build `pages/auth/forgot-password.tsx` and `pages/auth/update-password.tsx`
6. Test everything via refreshed `/debug-auth` page

### 🟠 Phase 3: Cutover
1. Remove `persistSession: false` from `lib/supabase.ts`
2. Swap `clerkMiddleware()` → `updateSession()` in `middleware.ts`
3. Mount `SupabaseProvider` in `_app.tsx`, unmount `ClerkProvider`
4. Verify existing users recover via email-based profile match
5. Keep `@clerk/nextjs` installed — do not uninstall yet

### 🔵 Phase 4: Security Hardening
1. Enable RLS tamper shield on gamification fields
2. Add rate limiting middleware on `/api/*` mutations
3. Add `status` column + ban middleware check
4. Add `is_admin` + admin route protection
5. Wire state selection onboarding enforcement in middleware

### 🟣 Phase 5: Gamification Upgrade
1. Connect `award_gamification` RPC to all point/exp award calls
2. Add `gamification_events` table + real-time subscription for level-up celebrations
3. Implement optimistic update rollback queue

### ⚪ Phase 6: Cleanup
1. `npm uninstall @clerk/nextjs` — after 1 week stable in production
2. Drop `clerk_user_id` column from database
3. Remove `get_or_create_user` RPC
4. Remove all Clerk environment variables

---

## Session Summary and Insights

**Key Achievements:**
- 37 ideas generated across all 7 SCAMPER lenses
- 7 thematic clusters identified covering schema, infrastructure, UX, security, gamification, migration strategy, and extensibility
- A complete 6-phase migration plan prioritised by lowest risk
- Identified mypeta-specific breakthrough (atomic gamification) that surpasses the krackeddev-main reference implementation

**Breakthrough Moments:**
- The `profiles` table split was the foundational insight — every other idea built from it
- Atomic gamification transactions emerged as the session's standout innovation — moving mypeta beyond a simple Clerk replacement into a genuinely stronger system
- "Remove Clerk Last, Not First" reframed the entire migration risk profile

**Session Reflections:**
User demonstrated strong separation-of-concerns instinct (auth vs profiles, theme vs language, Clerk last not first). Most creative energy emerged during the Modify lens when gamification was on the table. The SCAMPER structure surfaced ideas that a free-form strategy discussion would have missed — particularly the Eliminate and Reverse lenses which revealed the safest migration sequencing.
