import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials missing. Database features will not work.');
  console.warn('   Set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file.');
}

// Service-role client (bypasses RLS) — server-side only, never expose to client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
