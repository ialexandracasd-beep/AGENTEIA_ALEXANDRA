import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { supabaseAdmin } from './config/supabase';

// Fase A: diagnóstico de tablas críticas al arrancar.
// Si drive_audits no existe, el error (code=42P01) aparece aquí claramente
// en los logs de Render antes de intentar guardar auditorías.
async function checkCriticalTables(): Promise<void> {
  const tables = ['students', 'drive_audits', 'ai_reviews'] as const;
  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).select('id').limit(1);
    if (error?.code === '42P01') {
      logger.error(`[DB-CHECK] TABLA FALTANTE: "${table}" — ejecuta docs/sql-inicial-supabase.sql en Supabase`);
    } else if (error) {
      logger.warn(`[DB-CHECK] "${table}" → ${error.message} (code=${error.code})`);
    } else {
      logger.info(`[DB-CHECK] "${table}" → OK`);
    }
  }
}

app.listen(env.port, () => {
  logger.info(`AgenteIA Alexandra backend running on port ${env.port} [${env.nodeEnv}]`);
  checkCriticalTables().catch(err => logger.error('[DB-CHECK] error:', err));
});
