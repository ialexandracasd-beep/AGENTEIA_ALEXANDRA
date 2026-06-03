import { supabaseAdmin } from '../../config/supabase';
import { DriveAuditResult, DriveAuditStatus } from '../../types/audit.types';
import { logger } from '../../utils/logger';

export interface DriveAuditRow {
  id: string;
  student_id: string;
  folder_id: string;
  file_count: number;
  spreadsheets: DriveAuditResult['spreadsheets'];
  pdfs: DriveAuditResult['pdfs'];
  other_files: DriveAuditResult['otherFiles'];
  checks: DriveAuditResult['checks'];
  status: DriveAuditStatus;
  created_at: string;
}

// Convierte undefined → ausente, normaliza JSONB antes del insert
function toJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function saveAuditResult(
  studentId: string,
  result: DriveAuditResult,
): Promise<void> {
  const payload = {
    student_id:   studentId,
    folder_id:    result.folderId,
    file_count:   result.fileCount,
    spreadsheets: toJson(result.spreadsheets),
    pdfs:         toJson(result.pdfs),
    other_files:  toJson(result.otherFiles),
    checks:       toJson(result.checks),
    status:       result.status,
  };

  // Log siempre antes del insert para diagnosticar en Render
  logger.info(
    `[AUDIT-SAVE] student_id=${payload.student_id} ` +
    `status=${payload.status} ` +
    `file_count=${payload.file_count} ` +
    `folder_id=${payload.folder_id}`,
  );

  let supabaseError: unknown = null;

  try {
    const { error } = await supabaseAdmin.from('drive_audits').insert(payload);
    supabaseError = error;
  } catch (err) {
    logger.error(`[AUDIT-SAVE] excepción JS (no llegó a Supabase): ${(err as Error).message}`);
    throw err;
  }

  if (supabaseError) {
    // Loguea TODOS los campos del error, independientemente de su tipo
    const e = supabaseError as Record<string, unknown>;
    logger.error(
      `[AUDIT-SAVE] INSERT FALLÓ — ` +
      `code=${String(e['code'] ?? 'N/A')} ` +
      `message=${String(e['message'] ?? 'N/A')} ` +
      `details=${JSON.stringify(e['details'] ?? null)} ` +
      `hint=${String(e['hint'] ?? 'none')}`,
    );
    throw new Error(String(e['message'] ?? 'Error inserting drive_audits'));
  }

  logger.info(`[AUDIT-SAVE] OK — student_id=${studentId}`);
}

export async function getLatestAudit(studentId: string): Promise<DriveAuditRow | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('drive_audits')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data as DriveAuditRow;
  } catch {
    return null;
  }
}
