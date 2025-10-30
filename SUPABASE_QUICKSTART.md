# Supabase Quick Start Guide

## 🚀 Get Started in 30 Minutes

This guide will get your Supabase integration up and running quickly. For complete details, see `SUPABASE_INTEGRATION_PLAN.md` and `SUPABASE_SOLUTION_VALIDATION.md`.

---

## Step 1: Set Up Supabase Project (5 minutes)

### 1.1 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub (recommended for easy auth)
3. Create a new project
   - Choose a project name: `petamalaysia-prod`
   - Set a strong database password (save it!)
   - Choose region: `Singapore` (closest to Malaysia)

### 1.2 Get Project Credentials
1. In Supabase dashboard, go to **Project Settings** → **API**
2. Copy these values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   service_role key: eyJhbGc... (keep this SECRET!)
   ```

### 1.3 Add to Environment Variables
Create `.env.local` in your project root:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Privy (existing)
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
```

---

## Step 2: Install Dependencies (2 minutes)

```bash
npm install @supabase/supabase-js
```

---

## Step 3: Create Database Schema (10 minutes)

### 3.1 Run SQL in Supabase SQL Editor

Go to **SQL Editor** in Supabase dashboard and run each script below:

#### Script 1: Create States Table
```sql
-- States reference table
CREATE TABLE states (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Populate states
INSERT INTO states (id, name, display_order) VALUES
  ('johor', 'Johor', 1),
  ('kedah', 'Kedah', 2),
  ('kelantan', 'Kelantan', 3),
  ('malacca', 'Melaka', 4),
  ('negerisembilan', 'Negeri Sembilan', 5),
  ('pahang', 'Pahang', 6),
  ('penang', 'Penang', 7),
  ('perak', 'Perak', 8),
  ('perlis', 'Perlis', 9),
  ('sabah', 'Sabah', 10),
  ('sarawak', 'Sarawak', 11),
  ('selangor', 'Selangor', 12),
  ('terengganu', 'Terengganu', 13),
  ('kualalumpur', 'Kuala Lumpur', 14),
  ('labuan', 'Labuan', 15),
  ('putrajaya', 'Putrajaya', 16);
```

#### Script 2: Create Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  privy_user_id TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  profile_picture_url TEXT,
  selected_state TEXT REFERENCES states(id),
  points INTEGER NOT NULL DEFAULT 0,
  exp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_privy_user_id ON users(privy_user_id);
CREATE INDEX idx_users_points ON users(points);
CREATE INDEX idx_users_exp ON users(exp);
```

#### Script 3: Create Polls Tables
```sql
-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legacy_id TEXT UNIQUE,
  question TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('food', 'politics', 'culture', 'economy', 'social')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_system_poll BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_polls_category ON polls(category);
CREATE INDEX idx_polls_created_by ON polls(created_by);
CREATE INDEX idx_polls_is_active ON polls(is_active);
CREATE INDEX idx_polls_created_at ON polls(created_at DESC);

-- Poll options table
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, option_index)
);

CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
```

#### Script 4: Create Votes & Breakdown Tables
```sql
-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  poll_option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  user_state TEXT NOT NULL REFERENCES states(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_user_state ON votes(user_state);

-- State breakdown table
CREATE TABLE vote_state_breakdown (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  state_id TEXT NOT NULL REFERENCES states(id),
  vote_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, option_index, state_id)
);

CREATE INDEX idx_vote_state_breakdown_poll_id ON vote_state_breakdown(poll_id);
CREATE INDEX idx_vote_state_breakdown_state_id ON vote_state_breakdown(state_id);
```

#### Script 5: Create Transactions Table
```sql
CREATE TABLE user_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('vote', 'poll_create', 'admin_adjustment')),
  points_change INTEGER NOT NULL DEFAULT 0,
  exp_change INTEGER NOT NULL DEFAULT 0,
  balance_after_points INTEGER NOT NULL,
  balance_after_exp INTEGER NOT NULL,
  reference_id UUID,
  reference_type TEXT CHECK (reference_type IN ('poll', 'vote', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX idx_user_transactions_created_at ON user_transactions(created_at DESC);
```

#### Script 6: Create Helper Function (Get or Create User)
```sql
CREATE OR REPLACE FUNCTION get_or_create_user(
  p_privy_user_id TEXT,
  p_username TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_profile_picture_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  privy_user_id TEXT,
  username TEXT,
  email TEXT,
  profile_picture_url TEXT,
  selected_state TEXT,
  points INTEGER,
  exp INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  is_new_user BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  v_is_new BOOLEAN := false;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE users.privy_user_id = p_privy_user_id;
  
  IF v_user_id IS NULL THEN
    INSERT INTO users (privy_user_id, username, email, profile_picture_url)
    VALUES (p_privy_user_id, p_username, p_email, p_profile_picture_url)
    RETURNING id INTO v_user_id;
    v_is_new := true;
  ELSE
    UPDATE users 
    SET 
      username = COALESCE(p_username, username),
      email = COALESCE(p_email, email),
      profile_picture_url = COALESCE(p_profile_picture_url, profile_picture_url),
      last_login = NOW(),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;
  
  RETURN QUERY
  SELECT u.id, u.privy_user_id, u.username, u.email, u.profile_picture_url,
         u.selected_state, u.points, u.exp, u.created_at, v_is_new
  FROM users u WHERE u.id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 Enable Row Level Security

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_state_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

-- Basic policies (allow all for now, will refine later)
CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read on polls" ON polls FOR SELECT USING (true);
CREATE POLICY "Allow public read on poll_options" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Allow public read on vote_state_breakdown" ON vote_state_breakdown FOR SELECT USING (true);
```

---

## Step 4: Create Supabase Client (3 minutes)

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using Privy for auth
  },
});

// Helper to set auth token from Privy
export const setSupabaseAuth = (privyToken: string) => {
  // This would be used if we want to validate against Privy on backend
  // For now, we'll use Privy user ID directly
};

// Type definitions for database
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          privy_user_id: string;
          username: string | null;
          email: string | null;
          profile_picture_url: string | null;
          selected_state: string | null;
          points: number;
          exp: number;
          created_at: string;
          updated_at: string;
          last_login: string;
        };
      };
      polls: {
        Row: {
          id: string;
          legacy_id: string | null;
          question: string;
          description: string | null;
          category: string;
          created_by: string | null;
          is_system_poll: boolean;
          is_active: boolean;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          option_index: number;
          label: string;
          emoji: string;
          created_at: string;
        };
      };
      votes: {
        Row: {
          id: string;
          poll_id: string;
          user_id: string;
          poll_option_id: string;
          option_index: number;
          user_state: string;
          created_at: string;
        };
      };
    };
  };
}
```

---

## Step 5: Test Database Connection (2 minutes)

Create a test page `pages/test-supabase.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabase() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test 1: Query states
      const { data: states, error } = await supabase
        .from('states')
        .select('*')
        .limit(5);

      if (error) throw error;

      setData({ states });
      setStatus('success');
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setData({ error: error.message });
      setStatus('error');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      {status === 'loading' && (
        <p>Testing connection...</p>
      )}

      {status === 'success' && (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-bold text-green-800">✅ Connection Successful!</h2>
          <pre className="mt-2 text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-100 p-4 rounded">
          <h2 className="font-bold text-red-800">❌ Connection Failed</h2>
          <pre className="mt-2 text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

Visit `http://localhost:3000/test-supabase` to verify connection.

---

## Step 6: Migrate Default Polls (5 minutes)

Create migration script `scripts/migrate-polls.ts`:

```typescript
import { supabase } from '../lib/supabase';
import { POLLS_DATA } from '../data/polls';

async function migratePolls() {
  console.log('Starting poll migration...');

  for (const poll of POLLS_DATA) {
    try {
      // Insert poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
          legacy_id: poll.id,
          question: poll.question,
          description: poll.description,
          category: poll.category,
          is_system_poll: true,
          is_active: true,
          end_date: poll.endDate?.toISOString(),
        })
        .select()
        .single();

      if (pollError) {
        console.error(`Error migrating poll ${poll.id}:`, pollError);
        continue;
      }

      console.log(`✅ Migrated poll: ${poll.question}`);

      // Insert options
      for (let i = 0; i < poll.options.length; i++) {
        const { error: optionError } = await supabase
          .from('poll_options')
          .insert({
            poll_id: pollData.id,
            option_index: i,
            label: poll.options[i].label,
            emoji: poll.options[i].emoji,
          });

        if (optionError) {
          console.error(`Error migrating option for ${poll.id}:`, optionError);
        }
      }
    } catch (error) {
      console.error(`Unexpected error migrating ${poll.id}:`, error);
    }
  }

  console.log('Poll migration complete!');
}

migratePolls();
```

Run it:
```bash
npx ts-node scripts/migrate-polls.ts
```

---

## Step 7: Update UserProfileContext (5 minutes)

Update `contexts/UserProfileContext.tsx`:

```typescript
import { supabase } from '@/lib/supabase';

// Add to the provider
const [internalUserId, setInternalUserId] = useState<string | null>(null);

// Update loadUserData function
const loadUserData = async () => {
  if (!user) return;

  try {
    const { data, error } = await supabase
      .rpc('get_or_create_user', {
        p_privy_user_id: user.id,
        p_username: user.twitter?.username || user.email?.address?.split('@')[0],
        p_email: user.email?.address,
        p_profile_picture_url: user.twitter?.profilePictureUrl
      });

    if (error) {
      console.error('Error loading user data:', error);
      return;
    }

    const userData = data[0];
    setInternalUserId(userData.user_id);
    setSelectedStateInternal(userData.selected_state);
    setStats({
      points: userData.points,
      exp: userData.exp
    });

    if (!userData.selected_state && userData.is_new_user) {
      setShowStateSelector(true);
    }
  } catch (error) {
    console.error('Error in loadUserData:', error);
  }
};

// Call loadUserData in useEffect
useEffect(() => {
  if (authenticated && user) {
    loadUserData();
  }
}, [authenticated, user]);
```

---

## Step 8: Test User Creation (3 minutes)

1. Start your app: `npm run dev`
2. Sign in with X/Twitter
3. Check Supabase dashboard → **Table Editor** → `users`
4. You should see your user created!

---

## Next Steps

### Immediate
- ✅ Test database connection
- ✅ Verify user creation works
- ✅ Check that states are populated
- ✅ Verify polls are migrated

### This Week
1. Implement vote casting function (see full plan)
2. Implement poll creation function
3. Add real-time subscriptions
4. Test points/exp rewards

### Next Week
1. Migrate existing user data from localStorage
2. Implement dual-write strategy
3. Add caching layer
4. Performance testing

---

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution:** Make sure `.env.local` exists and has correct values. Restart dev server.

### Issue: RLS policy prevents read/write
**Solution:** For testing, you can disable RLS temporarily:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```
Re-enable before production!

### Issue: Function not found
**Solution:** Make sure you ran all SQL scripts in order. Check **Database** → **Functions** in Supabase dashboard.

### Issue: Connection timeout
**Solution:** Check your internet connection and Supabase project status. Try a different network.

---

## Resources

- 📖 [Full Integration Plan](./SUPABASE_INTEGRATION_PLAN.md)
- ✅ [Solution Validation](./SUPABASE_SOLUTION_VALIDATION.md)
- 🔗 [Supabase Docs](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)

---

## Get Help

If you encounter issues:
1. Check the console for errors
2. Review Supabase logs in dashboard
3. Reference the full integration plan
4. Ask in Supabase Discord

---

**🎉 Congratulations!** You now have Supabase set up and ready to use. Follow the full integration plan to complete the migration.

