# Realtime Subscriptions & Row Level Security

## Realtime Subscriptions

The app uses one Supabase Realtime subscription to keep user stats synchronized across tabs/components.

### `user-changes` Channel

**File:** `contexts/UserProfileContext.tsx` (lines 333-356)

```typescript
const subscription = supabase
  .channel("user-changes")
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "users",
      filter: `id=eq.${internalUserId}`,
    },
    (payload) => {
      const newData = payload.new;
      setStats({
        points: newData.points,
        exp: newData.exp,
      });
    }
  )
  .subscribe();
```

**Requirements:**
- Realtime must be enabled on the `users` table in the Supabase Dashboard
- Go to **Database → Replication** and ensure `users` is listed under Realtime publications

---

## Row Level Security (RLS)

Since the app uses Clerk (external auth) and `SECURITY DEFINER` RPC functions for all writes, the RLS policies are simplified.

### Enabling RLS

RLS must be enabled on all tables. Without it, any anonymous client could read/write anything.

```sql
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
```

### Policy Strategy

| Table | SELECT | INSERT/UPDATE/DELETE |
|-------|--------|---------------------|
| `states` | Public (everyone) | None (seed data only) |
| `users` | Public (for realtime + leaderboards) | Via RPC only (`SECURITY DEFINER`) |
| `polls` | Public (everyone sees active polls) | Via RPC only (`create_poll`) |
| `poll_options` | Public (everyone sees options) | Via RPC only (`create_poll`) |
| `votes` | Public (for result aggregation) | Via RPC only (`cast_vote`) |

### Why Public SELECT?

The app's security model relies on:
1. **Clerk** handles authentication (login/signup)
2. **`SECURITY DEFINER` RPC functions** handle all writes with business logic validation
3. **RLS SELECT policies** are permissive because:
   - Poll results and options must be visible to all users
   - Vote data is aggregated (individual votes need to be readable for `get_all_poll_results`)
   - User data needs public SELECT for the realtime subscription to work
   - No sensitive data (passwords, tokens) is stored in these tables

### Important Notes

- All write operations go through RPC functions — there are **no direct INSERT/UPDATE RLS policies** needed
- The RPC functions use `SECURITY DEFINER` which executes with the function owner's privileges, bypassing RLS
- If you add direct table access later, you'll need more restrictive policies
