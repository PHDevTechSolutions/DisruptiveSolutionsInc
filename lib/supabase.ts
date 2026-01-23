import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Mag-add tayo ng simpleng log para makita mo sa terminal kung nababasa ba
if (!supabaseAnonKey) {
  console.error("BALA: Supabase Key is missing in .env.local!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);