import { supabase } from '../../config/supabase';
import { DriveAuditResult, DriveAuditStatus } from '../../types/audit.types';

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

export async function saveAuditResult(
  studentId: string,
  result: DriveAuditResult,
): Promise<DriveAuditRow> {
  const { data, error } = await supabase
    .from('drive_audits')
    .insert({
      student_id: studentId,
      folder_id: result.folderId,
      file_count: result.fileCount,
      spreadsheets: result.spreadsheets,
      pdfs: result.pdfs,
      other_files: result.otherFiles,
      checks: result.checks,
      status: result.status,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as DriveAuditRow;
}

export async function getLatestAudit(studentId: string): Promise<DriveAuditRow | null> {
  const { data, error } = await supabase
    .from('drive_audits')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as DriveAuditRow;
}
