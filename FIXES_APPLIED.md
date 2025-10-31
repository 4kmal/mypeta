# Fixes Applied - State Save Issue

## Date: October 31, 2025

## Problem Reported
- User can select a state, but gets "User data not loaded" error when voting
- After refresh, state disappears and is not persisted
- `internalUserId` is null, preventing voting functionality

## Root Cause
The issue occurs because `UserProfileContext.loadUserData()` is either:
1. Not being called properly
2. Failing silently
3. Returning empty/invalid data
4. Having timing issues with Clerk authentication

## Fixes Applied

### 1. Enhanced Logging in UserProfileContext.tsx
**What changed:**
- Added comprehensive console logging with `[UserProfile]` prefix
- Logs now track every step of user data loading
- Shows Clerk user ID, RPC parameters, and responses
- Displays detailed error messages with JSON stringification
- Tracks state updates and reloads

**Why:** To identify exactly where the process is failing

**Files:** `contexts/UserProfileContext.tsx`

**Lines:** 56-166

### 2. Updated Supabase Client Configuration
**What changed:**
- Comment updated from "Privy" to "Clerk" (line 12)
- Type definition updated: `privy_user_id` → `clerk_user_id` (line 23)

**Why:** Consistency and accuracy in code documentation

**Files:** `lib/supabase.ts`

**Lines:** 12, 23

### 3. Added Auto-Reload After State Save
**What changed:**
- After successfully setting a state, `loadUserData()` is called again
- Ensures all context data is synchronized with database

**Why:** Prevents stale data in context

**Files:** `contexts/UserProfileContext.tsx`

**Line:** 162

### 4. Created Debug Page
**What changed:**
- New page at `/debug-auth` to visualize all authentication steps
- Tests 7 different aspects of auth/database connection
- Visual feedback with ✅/❌/ℹ️ icons
- Shows detailed JSON data for each test
- No need to open browser console

**Why:** Easier debugging and faster issue identification

**Files:** `pages/debug-auth.tsx` (new file)

## Testing Instructions

### Quick Test (Using Debug Page)
1. Navigate to `http://localhost:3000/debug-auth`
2. Login with Google (if not already)
3. Page will automatically run all tests
4. Look for any ❌ red X marks
5. Click "Show Details" on failed tests
6. Report which tests are failing

### Manual Test (Using Console)
1. Open browser console (F12 or Cmd+Option+I)
2. Filter logs by `[UserProfile]`
3. Login with Google
4. Look for these messages:
   ```
   [UserProfile] Loading user data for Clerk ID: user_xxxxx
   [UserProfile] Calling get_or_create_user with: {...}
   [UserProfile] RPC response: [...]
   [UserProfile] User data loaded: {...}
   [UserProfile] State set - internalUserId: xxxx, selectedState: null
   ```
5. Select a state
6. Look for:
   ```
   [UserProfile] Setting state: selangor for Clerk ID: user_xxxxx
   [UserProfile] State updated successfully
   [UserProfile] Loading user data for Clerk ID: user_xxxxx (reload)
   ```
7. Try voting on a poll

### Expected Results After Fix
✅ Login with Google → User created in database
✅ `get_or_create_user` returns user data
✅ `internalUserId` is set (not null)
✅ Select state → State saves successfully
✅ Refresh page → State persists
✅ Vote on poll → No "User data not loaded" error
✅ Points and EXP tracked correctly

## Common Issues & Solutions

### Issue: "Error loading user data" in console
**Solution:** Check if Supabase environment variables are set correctly in `.env.local`
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### Issue: "No data returned from get_or_create_user"
**Solution:** Function might be failing. Check:
1. Database migration was applied ✅ (already done)
2. Function exists in Supabase (check Functions tab)
3. RLS policies allow access

### Issue: internalUserId is still null after all fixes
**Solution:** There's a timing issue. Check:
1. Is `isLoaded` true?
2. Is `isSignedIn` true?
3. Is `user` object defined?
4. Does `user.id` have a value?

### Issue: State saves but disappears on refresh
**Solution:** 
1. Check if `get_or_create_user` is being called on page load
2. Check if it's returning the correct data
3. Check if `setInternalUserId` is being called
4. Use debug page to see exact values

## Database Verification

To manually check if data is being saved:

```sql
-- Find your user
SELECT id, clerk_user_id, username, email, selected_state, points, exp
FROM users
WHERE email = 'your-email@gmail.com'
ORDER BY created_at DESC
LIMIT 1;

-- Check if state is actually saved
SELECT clerk_user_id, selected_state, updated_at
FROM users
WHERE clerk_user_id LIKE 'user_%'
ORDER BY updated_at DESC;
```

## Files Changed
1. `contexts/UserProfileContext.tsx` - Enhanced logging + auto-reload
2. `lib/supabase.ts` - Updated comments and types
3. `pages/debug-auth.tsx` - New debug page (NEW FILE)
4. `DEBUG_STATE_ISSUE.md` - Debug guide (NEW FILE)
5. `FIXES_APPLIED.md` - This file (NEW FILE)

## Next Steps

1. **Test the debug page** - `http://localhost:3000/debug-auth`
2. **Check console logs** - Look for `[UserProfile]` messages
3. **Report findings** - Which tests pass/fail?
4. **Provide details** - Console logs or debug page screenshot

## Rollback Plan (If Needed)

If these changes cause issues, you can:
1. Git checkout to previous commit
2. Or manually revert the logging (just remove console.log statements)
3. The core functionality hasn't changed, only added debugging

## Status

- ✅ Database migration applied (privy → clerk)
- ✅ Frontend code updated to use Clerk
- ✅ Enhanced logging added
- ✅ Debug page created
- ⏳ **WAITING FOR USER TEST RESULTS**

## Contact

If issues persist:
1. Visit `/debug-auth` page
2. Screenshot the results
3. Or copy console logs starting with `[UserProfile]`
4. Report back with findings

