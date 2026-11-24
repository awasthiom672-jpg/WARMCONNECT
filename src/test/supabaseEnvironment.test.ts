import { describe, expect, it } from 'vitest';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

describe('Supabase test isolation', () => {
  it('does not connect to a configured Supabase project during Vitest runs', () => {
    expect(import.meta.env.MODE).toBe('test');
    expect(hasSupabaseConfig).toBe(false);
    expect(supabase).toBeNull();
  });
});
