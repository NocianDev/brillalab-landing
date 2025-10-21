// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || ''; // CRA: REACT_APP_*
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase: faltan REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY en las env vars');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
