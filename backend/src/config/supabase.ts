import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Cliente estándar — operaciones de usuario (respeta RLS)
export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: { persistSession: false },
});

// Cliente admin — bypasa RLS; usar solo en el backend para operaciones internas
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: { persistSession: false },
});
