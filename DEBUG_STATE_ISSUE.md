# Debugging State Save Issue

## Problem
- State can be selected but shows "User data not loaded" error when voting
- After refresh, state disappears from profile

## Root Cause Analysis

### Issue Identified:
The `internalUserId` is `null`, which means `loadUserData()` is either:
1. Not being called
2. Failing to retrieve data
3. Returning empty data

### Why This Happens:
When you log in with Google via Clerk, the `get_or_create_user` function might be:
- Failing silently
- Not creating the user properly
- Having a mismatch in return data structure

## What I Fixed

### 1. Added Comprehensive Logging
Added console logs throughout `UserProfileContext.tsx` to track:
- When user data loads
- What Clerk ID is being used
- What the RPC returns
- Any errors that occur

All logs are prefixed with `[UserProfile]` for easy filtering.

### 2. Improved Error Handling
- Better error messages
- JSON stringified errors for full details
- Check if data is empty before trying to use it

### 3. Added Reload After State Save
When you select a state, it now reloads user data to ensure everything syncs.

## How to Debug

### Step 1: Open Browser Console
1. Open your app
2. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
3. Go to the **Console** tab
4. Clear any existing logs (click 🚫 icon)

### Step 2: Login and Check Logs
1. Refresh the page
2. Login with Google
3. Look for these log messages:

**Expected logs:**
```
[UserProfile] Loading user data for Clerk ID: user_xxxxx
[UserProfile] Calling get_or_create_user with: {clerk_id: "user_...", username: "...", email: "..."}
[UserProfile] RPC response: [...]
[UserProfile] User data loaded: {...}
[UserProfile] State set - internalUserId: xxxx-xxxx, selectedState: null
```

**If you see errors:**
```
[UserProfile] Error loading user data: {...}
[UserProfile] No data returned from get_or_create_user
```

### Step 3: Try Selecting State
1. Select a state
2. Look for:
```
[UserProfile] Setting state: selangor for Clerk ID: user_xxxxx
[UserProfile] State updated successfully
[UserProfile] Loading user data for Clerk ID: user_xxxxx (reload)
```

### Step 4: Try Voting
1. Try to vote on a poll
2. If you see "User data not loaded", check console for:
   - What is the `internalUserId`?
   - Did `loadUserData` complete successfully?

## Common Issues & Fixes

### Issue 1: "Error loading user data" with RPC error
**Cause**: Database function parameters don't match
**Fix**: Already applied migration ✅

### Issue 2: No data returned from get_or_create_user
**Cause**: Function might be failing to create user
**Fix**: Check database permissions or function logic

### Issue 3: Clerk ID format mismatch
**Cause**: Old Privy IDs (`did:privy:...`) vs new Clerk IDs (`user_...`)
**Note**: This is expected - you'll be a new user in Clerk

## Next Steps

1. **Clear your browser cache** (Cmd+Shift+Delete / Ctrl+Shift+Delete)
2. **Hard refresh** (Cmd+Shift+R / Ctrl+Shift+R)
3. **Login again with Google**
4. **Check console logs** and copy them
5. **Try selecting a state**
6. **Send me the console logs** if issues persist

## Expected Behavior After Fix

✅ Login with Google → User created in database
✅ Select state → State saves to database
✅ Refresh page → State persists
✅ Vote on poll → Works without "User data not loaded" error
✅ Points and EXP → Tracked correctly

## Temporary Workaround

If you still get errors, you can check the raw database:

```sql
-- Find your user by email or username
SELECT id, clerk_user_id, username, email, selected_state, points, exp
FROM users
WHERE email = 'your-email@gmail.com'
OR username = 'your-username';
```

This will show if the user was created and if state was saved.

