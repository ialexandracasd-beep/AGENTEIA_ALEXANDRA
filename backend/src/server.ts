import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { supabaseAdmin, decodeJwtRole } from './config/supabase';

// ── Diagnóstico de tablas críticas ──────────────────────────────────────────
// Si drive_audits no existe → code=42P01
// Si el cliente no tiene permiso (key incorrecta / RLS) → code=42501
async function checkCriticalTables(): Promise<void> {
  const tables = ['students', 'drive_audits', 'ai_reviews'] as const;
  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).select('id').limit(1);
    if (!error) {
      logger.info(`[DB-CHECK] "${table}" → OK`);
    } else if (error.code === '42P01') {
      logger.error(`[DB-CHECK] TABLA FALTANTE: "${table}" — ejecuta docs/sql-inicial-supabase.sql en Supabase SQL Editor`);
    } else if (error.code === '42501') {
      logger.error(`[DB-CHECK] SIN PERMISO en "${table}" (code=42501) — SUPABASE_SERVICE_ROLE_KEY no está bypassando RLS. Confirma que la key sea la service_role, no la anon key.`);
    } else {
      logger.error(`[DB-CHECK] "${table}" → ${error.message} (code=${error.code})`);
    }
  }
}

app.listen(env.port, () => {
  logger.info(`AgenteIA Alexandra backend running on port ${env.port} [${env.nodeEnv}]`);

  // ── Validación de variables críticas de Supabase ──────────────────────────
  const key = env.supabase.serviceRoleKey;
  const jwtRole = decodeJwtRole(key);

  logger.info(`[ENV] SUPABASE_URL         : ${env.supabase.url ? 'presente' : '⚠ AUSENTE'}`);
  logger.info(`[ENV] SUPABASE_ANON_KEY    : longitud=${env.supabase.anonKey.length}`);
  logger.info(`[ENV] SUPABASE_SERVICE_ROLE_KEY: longitud=${key.length} | JWT role="${jwtRole}"`);

  if (jwtRole !== 'service_role') {
    logger.error(
      `[ENV] *** CRÍTICO: SUPABASE_SERVICE_ROLE_KEY tiene JWT role="${jwtRole}" ` +
      `(se requiere "service_role"). ` +
      `Esto explica por qué drive_audits no puede insertar. ` +
      `Solución: en Render → Environment → SUPABASE_SERVICE_ROLE_KEY ` +
      `→ pega la key de Supabase Project Settings → API → service_role (la larga, no la anon key).`,
    );
  }

  checkCriticalTables().catch(err => logger.error('[DB-CHECK] error inesperado:', err));
});
