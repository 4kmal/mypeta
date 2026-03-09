import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY).',
    'Database features will not work. Please check your .env.local file or Vercel environment variables.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // We're using Clerk for auth
    },
  }
);

// Type definitions for database
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
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
      states: {
        Row: {
          id: string;
          name: string;
          display_order: number;
          created_at: string;
        };
      };
    };
  };
}

