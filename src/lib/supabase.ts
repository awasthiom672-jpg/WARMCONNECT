import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim();

// Vitest must remain isolated from a developer's real .env.local file.
// Unit and component tests use the in-memory demo provider and must never
// send requests to a configured Supabase project.
const isTestEnvironment = import.meta.env.MODE === 'test';

export const hasSupabaseConfig = !isTestEnvironment && Boolean(supabaseUrl && supabaseKey);

/** The browser client only ever receives a publishable/anon key. Never put a service key here. */
export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(supabaseUrl!, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;
