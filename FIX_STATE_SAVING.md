# 🔧 Fix State Saving Issue

## The Problem

State selection isn't saving to the backend because **the database migration hasn't been applied yet**.

Your code is calling:
- `get_or_create_user(p_clerk_user_id: ...)`  
- `update_user_state(p_clerk_user_id: ...)`
- `update_user_points_exp(p_clerk_user_id: ...)`

But the database functions don't exist or have old parameter names.

## The Solution

Apply the migration file: `supabase/migrations/rename_privy_to_clerk.sql`

### **Apply Migration via Supabase Dashboard** (Recommended - 2 minutes)

1. **Open**: https://supabase.com/dashboard
2. **Select your project**: `petamalaysia` (or your project name)
3. **Go to**: SQL Editor (left sidebar)
4. **Copy the entire contents** of `supabase/migrations/rename_privy_to_clerk.sql`
5. **Paste** into the SQL editor
6. **Click "Run"**

That's it! ✅

### After Running the Migration

Test it:

1. **Refresh your app** in the browser
2. **Login** with X or Google
3. **Select a state** from the dropdown
4. **Check browser console** - you should see:
   ```
   [UserProfile] State updated successfully
   ```
5. **Refresh the page** - your state should still be selected (saved to backend)

## What the Migration Does

1. ✅ Renames `privy_user_id` → `clerk_user_id` in database
2. ✅ Updates `get_or_create_user()` function
3. ✅ Updates `update_user_state()` function  
4. ✅ Updates `cast_vote()` function
5. ✅ Updates `create_poll()` function
6. ✅ **NEW**: Adds `update_user_points_exp()` function for syncing points/exp

## Verify It Worked

Run this query in SQL Editor:

```sql
-- Check if column was renamed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'clerk_user_id';
```

Should return 1 row. If it returns nothing, the migration didn't run.

## If You Get Errors

If you see errors like "column already exists" or "function already exists":
- **That's OK!** Some parts might already be applied
- The migration has `CREATE OR REPLACE` which handles this
- Just continue to the end

If you see "table users does not exist":
- You need to create the base schema first
- Check `SUPABASE_QUICKSTART.md` for the initial schema setup

