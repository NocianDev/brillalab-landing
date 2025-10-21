// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY ?? '';

console.log('Supabase env ->', {
  SUPABASE_URL: SUPABASE_URL || '(VACÍA)',
  SUPABASE_ANON_KEY_present: !!SUPABASE_ANON_KEY
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase: faltan REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY en las env vars');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * insertContact - inserta un contacto en la tabla 'contacts'.
 * Lanza un Error con información útil si falla.
 */
export async function insertContact(payload) {
  const { data, error, status } = await supabase
    .from('contacts')
    .insert([payload])
    .select();

  if (error) {
    const err = new Error(error.message || 'Supabase error');
    err.details = error.details;
    err.hint = error.hint;
    err.status = status;
    throw err;
  }
  return data;
}

