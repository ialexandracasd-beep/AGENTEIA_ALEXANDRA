import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Cliente estándar — operaciones de usuario (respeta RLS)
export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

// Cliente admin — bypasa RLS; usar solo en el backend para operaciones internas.
// Requiere SUPABASE_SERVICE_ROLE_KEY (no la anon key).
export const supabaseAdmin = createClient(env.supabase.url, env.supabase.serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

// Decodifica el claim `role` del JWT sin verificar firma ni exponer la key.
// Útil para detectar si se pegó la anon key en lugar de la service_role key.
export function decodeJwtRole(token: string): string {
  try {
    const part = token.split('.')[1];
    if (!part) return 'jwt-inválido';
    const payload = Buffer.from(part, 'base64url').toString('utf8');
    const claims = JSON.parse(payload) as { role?: string };
    return claims.role ?? 'sin-claim-role';
  } catch {
    return 'error-decode';
  }
}
