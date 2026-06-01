import { listFilesInFolder } from './drive.service';
import { DriveAuditResult, DriveAuditStatus } from '../../types/audit.types';

const MIME_SPREADSHEET = 'application/vnd.google-apps.spreadsheet';
const MIME_PDF = 'application/pdf';
const DRIVE_TIMEOUT_MS = 15_000;

export function extractFolderId(idOrUrl: string): string {
  const match = idOrUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : idOrUrl.trim();
}

export async function auditStudentFolder(idDrive: string): Promise<DriveAuditResult> {
  const folderId = extractFolderId(idDrive);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DRIVE_TIMEOUT_MS);

  let files: Awaited<ReturnType<typeof listFilesInFolder>>;
  try {
    files = await listFilesInFolder(folderId, controller.signal);
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error('Google Drive no respondió a tiempo (timeout 15 s). Verifica que la cuenta de servicio tenga acceso a la carpeta.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  const spreadsheets = files
    .filter(f => f.mimeType === MIME_SPREADSHEET)
    .map(f => ({ id: f.id!, name: f.name!, webViewLink: f.webViewLink ?? undefined }));

  const pdfs = files
    .filter(f => f.mimeType === MIME_PDF)
    .map(f => ({ id: f.id!, name: f.name!, webViewLink: f.webViewLink ?? undefined }));

  const otherFiles = files
    .filter(f => f.mimeType !== MIME_SPREADSHEET && f.mimeType !== MIME_PDF)
    .map(f => ({ id: f.id!, name: f.name!, mimeType: f.mimeType!, webViewLink: f.webViewLink ?? undefined }));

  const checks = {
    hasAnyFile: files.length > 0,
    hasSpreadsheet: spreadsheets.length > 0,
    hasPdf: pdfs.length > 0,
  };

  let status: DriveAuditStatus;
  if (files.length === 0) {
    status = 'empty';
  } else if (checks.hasSpreadsheet && checks.hasPdf) {
    status = 'approved';
  } else {
    status = 'findings';
  }

  return {
    folderId,
    fileCount: files.length,
    spreadsheets,
    pdfs,
    otherFiles,
    checks,
    status,
    runAt: new Date().toISOString(),
  };
}
