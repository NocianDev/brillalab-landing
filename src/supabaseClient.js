// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Soporta Create React App (REACT_APP_) y Vite (VITE_)
const SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Logs de debug (quítalos en producción)
console.log('Supabase env -> URL:', SUPABASE_URL ? SUPABASE_URL : '(VACÍA)');
console.log('Supabase env -> ANON key present:', !!SUPABASE_ANON_KEY);
if (SUPABASE_ANON_KEY) {
  console.log('Supabase env -> ANON key preview:', `${SUPABASE_ANON_KEY.slice(0,6)}...${SUPABASE_ANON_KEY.slice(-4)}`);
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase: faltan variables de entorno. Revisa .env y reinicia el dev server.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * insertContact - inserta un contacto en la tabla 'contacts'.
 * Lanza un Error con información útil si falla.
 */
export async function insertContact(payload) {
  try {
    console.log('insertContact payload:', payload);
    const { data, error, status } = await supabase
      .from('contacts')
      .insert([payload])
      .select(); // obtener la fila insertada (representation)

    console.log('Supabase response status:', status, 'error:', error, 'data:', data);

    if (error) {
      const err = new Error(error.message || 'Supabase error');
      err.details = error.details;
      err.hint = error.hint;
      err.status = status;
      throw err;
    }
    return data;
  } catch (err) {
    // Error de networking (ej. failed to fetch)
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      const netErr = new Error('Network error: no se pudo conectar a Supabase (Failed to fetch)');
      netErr.original = err;
      throw netErr;
    }
    console.error('insertContact error completo:', err);
    throw err;
  }
}


