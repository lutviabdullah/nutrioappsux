import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

let anonymousSessionPromise;

export async function getOrCreateAnonymousSession() {
  if (!supabase) return null;

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (sessionData.session) return sessionData.session;

  anonymousSessionPromise ??= supabase.auth.signInAnonymously();
  const { data, error } = await anonymousSessionPromise;
  anonymousSessionPromise = undefined;
  if (error) throw error;
  return data.session;
}