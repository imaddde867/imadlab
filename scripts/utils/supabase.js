import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabase-config.js';

export { SUPABASE_URL };
export const createSupabaseClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
