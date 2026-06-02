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

// Elimina undefined y valores no serializables para que Supabase reciba JSON limpio
function toJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function saveAuditResult(
  studentId: string,
  result: DriveAuditResult,
): Promise<void> {
  const payload = {
    student_id:  studentId,
    folder_id:   result.folderId,
    file_count:  result.fileCount,
    spreadsheets: toJson(result.spreadsheets),
    pdfs:         toJson(result.pdfs),
    other_files:  toJson(result.otherFiles),
    checks:       toJson(result.checks),
    status:       result.status,
  };

  // Log completo del payload para diagnosticar en Render
  logger.info(
    `saveAuditResult payload → ` +
    `student_id=${payload.student_id} ` +
    `folder_id=${payload.folder_id} ` +
    `status=${payload.status} ` +
    `file_count=${payload.file_count} ` +
    `spreadsheets=${payload.spreadsheets.length} ` +
    `pdfs=${payload.pdfs.length} ` +
    `other_files=${payload.other_files.length} ` +
    `checks=${JSON.stringify(payload.checks)}`,
  );

  // Await directo: evita el patrón withTimeout(thenable) que en Supabase JS v2
  // puede convertir un resolve-con-error en un reject, ocultando el código de error.
  let insertError: { code: string; message: string; details: unknown; hint?: string } | null = null;

  try {
    const { error } = await supabaseAdmin.from('drive_audits').insert(payload);
    insertError = error;
  } catch (err) {
    // Error de red o excepción inesperada del cliente Supabase
    logger.error(`saveAuditResult exception (no llegó a Supabase) → ${(err as Error).message}`);
    throw err;
  }

  if (insertError) {
    logger.error(
      `saveAuditResult FAILED → ` +
      `code=${insertError.code} ` +
      `msg=${insertError.message} ` +
      `details=${JSON.stringify(insertError.details)} ` +
      `hint=${insertError.hint ?? 'none'}`,
    );
    throw new Error(insertError.message);
  }

  logger.info(`saveAuditResult OK → student_id=${studentId}`);
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
