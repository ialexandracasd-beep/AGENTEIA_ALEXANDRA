import { supabaseAdmin } from '../../config/supabase';
import { DriveAuditResult, DriveAuditStatus } from '../../types/audit.types';
import { logger } from '../../utils/logger';

const SUPABASE_TIMEOUT_MS = 10_000;

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

function withTimeout<T>(thenable: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    Promise.resolve(thenable),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} no respondió a tiempo (timeout ${ms / 1000} s)`)),
        ms,
      ),
    ),
  ]);
}

export async function saveAuditResult(
  studentId: string,
  result: DriveAuditResult,
): Promise<void> {
  const payload = {
    student_id: studentId,
    folder_id: result.folderId,
    file_count: result.fileCount,
    spreadsheets: result.spreadsheets,
    pdfs: result.pdfs,
    other_files: result.otherFiles,
    checks: result.checks,
    status: result.status,
  };

  logger.info(`saveAuditResult → studentId=${studentId} status=${result.status} files=${result.fileCount}`);

  // Insert sin .select() para evitar problemas con permisos de retorno
  const { error } = await withTimeout(
    supabaseAdmin.from('drive_audits').insert(payload),
    SUPABASE_TIMEOUT_MS,
    'Supabase drive_audits insert',
  );

  if (error) {
    logger.error(`saveAuditResult error → code=${error.code} msg=${error.message} details=${error.details}`);
    throw new Error(error.message);
  }

  logger.info(`saveAuditResult OK → studentId=${studentId}`);
}

export async function getLatestAudit(studentId: string): Promise<DriveAuditRow | null> {
  const query = supabaseAdmin
    .from('drive_audits')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const { data, error } = await withTimeout(query, SUPABASE_TIMEOUT_MS, 'Supabase getLatestAudit');
  if (error) return null;
  return data as DriveAuditRow;
}
