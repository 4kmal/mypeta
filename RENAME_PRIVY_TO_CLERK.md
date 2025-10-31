# Renaming Privy References to Clerk

This guide explains how to rename all database references from "privy" to "clerk" for clarity.

## What Changed

### Database Changes (Supabase)
1. **Column renamed**: `users.privy_user_id` → `users.clerk_user_id`
2. **Constraint renamed**: `users_privy_user_id_key` → `users_clerk_user_id_key`
3. **Function parameters updated**:
   - `get_or_create_user()`: `p_privy_user_id` → `p_clerk_user_id`
   - `update_user_state()`: `p_privy_user_id` → `p_clerk_user_id`
   - `cast_vote()`: `p_privy_user_id` → `p_clerk_user_id`
   - `create_poll()`: `p_privy_user_id` → `p_clerk_user_id`

### Code Changes (TypeScript)
1. **contexts/UserProfileContext.tsx**:
   - Updated `get_or_create_user` RPC call
   - Updated `update_user_state` RPC call

2. **pages/polls/index.tsx**:
   - Updated `cast_vote` RPC call
   - Updated `create_poll` RPC call

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended for Production)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/rename_privy_to_clerk.sql`
5. Click **Run** to execute the migration
6. Verify the changes in the **Table Editor**

### Option 2: Using Supabase CLI (Recommended for Development)

If you have Supabase CLI installed locally:

```bash
# Make sure you're linked to your project
supabase link --project-ref your-project-ref

# Apply the migration
supabase db push

# Or if you want to test locally first:
supabase db reset  # This will reset your local DB and apply all migrations
```

### Option 3: Manual Execution

If you prefer to run the SQL manually:

```bash
# Using psql or any PostgreSQL client
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/rename_privy_to_clerk.sql
```

## Verification Steps

After applying the migration, verify that everything works:

1. **Check the database schema**:
   ```sql
   -- Verify column was renamed
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'users' 
   AND column_name = 'clerk_user_id';
   
   -- Should return: clerk_user_id
   ```

2. **Check the constraint**:
   ```sql
   SELECT constraint_name 
   FROM information_schema.table_constraints 
   WHERE table_name = 'users' 
   AND constraint_name = 'users_clerk_user_id_key';
   
   -- Should return: users_clerk_user_id_key
   ```

3. **Test the application**:
   - Sign in with Clerk
   - Verify user profile loads
   - Try voting on a poll
   - Try creating a poll (if you have enough points)
   - Check that state selection works

## Rollback Plan

If you need to rollback the changes (before applying the TypeScript updates):

```sql
-- Rollback: Rename back to privy
ALTER TABLE users 
RENAME COLUMN clerk_user_id TO privy_user_id;

ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_clerk_user_id_key;

ALTER TABLE users 
ADD CONSTRAINT users_privy_user_id_key UNIQUE (privy_user_id);

-- Then revert all function definitions to use p_privy_user_id
```

## Important Notes

⚠️ **Before applying this migration**:
1. Make sure you have a backup of your database
2. Test in a development environment first
3. Plan for a brief downtime if needed (the migration should be fast)
4. Make sure all users are logged out or expect them to need to re-authenticate

✅ **After applying this migration**:
1. The application will work with the new naming
2. All existing data remains intact (only names changed)
3. All Clerk user IDs will continue to work seamlessly
4. No user data is lost or modified

## Benefits of This Change

1. **Clarity**: Database now clearly indicates it uses Clerk for authentication
2. **Maintainability**: Reduces confusion when reading code or database schema
3. **Consistency**: All parts of the system now use consistent naming
4. **Future-proof**: Makes it clear which auth provider is in use

## Code Changes Summary

All TypeScript changes have been completed:

- ✅ `contexts/UserProfileContext.tsx`: Updated to use `p_clerk_user_id`
- ✅ `pages/polls/index.tsx`: Updated to use `p_clerk_user_id`
- ✅ Migration file created: `supabase/migrations/rename_privy_to_clerk.sql`

## Next Steps

1. Apply the SQL migration to your Supabase database
2. Restart your development server
3. Test the authentication flow
4. Deploy to production when ready

## Support

If you encounter any issues:
1. Check the Supabase logs in your dashboard
2. Look for error messages in the browser console
3. Verify that all function parameters match the new names
4. Ensure the migration was applied successfully

---

**Migration Status**: ✅ Ready to apply
**Breaking Changes**: None (seamless transition)
**Downtime Required**: Minimal (< 1 minute)

