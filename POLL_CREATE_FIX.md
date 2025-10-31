# Poll Creation Fix - UUID Type Error

## Problem
When creating a poll, users encountered the following error:
```
Failed to create poll: column "id" is of type uuid but expression is of type text
```

## Root Cause
The database had TWO versions of the `create_poll` function:
1. **Old version** with `p_privy_user_id` parameter (returns `json`)
2. **New version** with `p_clerk_user_id` parameter (returns `TABLE`)

The new version had a bug where it was trying to insert a TEXT value into a UUID column:
```sql
v_poll_id := 'poll_' || gen_random_uuid()::TEXT;  -- Creates TEXT like "poll_123..."
INSERT INTO polls (id, ...) VALUES (v_poll_id, ...);  -- Tries to insert TEXT into UUID column
```

## Solution Applied

### 1. Database Migration (`fix_create_poll_function`)
- Dropped both old versions of the `create_poll` function
- Created a corrected version that:
  - Uses `p_clerk_user_id` parameter (matching current authentication)
  - Returns `json` directly (not TABLE)
  - Lets the database generate the UUID automatically instead of trying to create a TEXT value
  - Properly handles all the poll creation logic including:
    - User validation
    - Points deduction (200 points)
    - EXP reward (200 EXP)
    - Level-up detection
    - Transaction logging

### 2. Frontend Update (`pages/polls/index.tsx`)
Updated line 613-614 to handle the new return type:
```typescript
// Before (incorrect for json return type)
const result = (Array.isArray(data) && data.length > 0 ? data[0] : data) as any;

// After (correct for json return type)
const result = data as any;
```

## Function Signature
```sql
CREATE OR REPLACE FUNCTION create_poll(
  p_question TEXT,
  p_description TEXT,
  p_category TEXT,
  p_options JSONB,
  p_clerk_user_id TEXT,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON
```

## Return Value
The function now returns a JSON object with:
```json
{
  "success": true,
  "poll_id": "uuid-here",
  "points_cost": 200,
  "exp_earned": 200,
  "leveled_up": false,
  "new_level": 5
}
```

## Testing
- ✅ Function creates poll with proper UUID
- ✅ Deducts 200 points from user
- ✅ Awards 200 EXP to user
- ✅ Detects level-ups correctly
- ✅ Logs transaction properly
- ✅ Frontend displays success message

## Important Notes
- The `cast_vote` function still returns `TABLE` (not JSON), so it correctly uses the array handling pattern
- The `create_poll` function now returns `JSON` directly, which is why we changed the handling
- Both functions now properly work with UUID types

## Files Changed
1. `supabase/migrations/[timestamp]_fix_create_poll_function.sql` (new migration)
2. `pages/polls/index.tsx` (line 613-614)
3. `POLL_CREATE_FIX.md` (this documentation)

## Project Info
- Project ID: `xasavvwoezdsaynwowmy`
- Project Name: `mypeta.ai`
- Region: `ap-southeast-2`

