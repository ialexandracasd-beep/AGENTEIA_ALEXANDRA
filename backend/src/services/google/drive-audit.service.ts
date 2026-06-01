import { listFilesInFolder } from './drive.service';
import { DriveAuditResult, DriveAuditStatus } from '../../types/audit.types';
import { env } from '../../config/env';

const MIME_SPREADSHEET = 'application/vnd.google-apps.spreadsheet';
const MIME_PDF = 'application/pdf';
const DRIVE_TIMEOUT_MS = 15_000;

export function extractFolderId(idOrUrl: string): string {
  const match = idOrUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : idOrUrl.trim();
}

function classifyDriveError(err: unknown): Error {
  const code = (err as { code?: number }).code;
  const msg = ((err as Error).message ?? '').toLowerCase();

  if (code === 403 || msg.includes('forbidden') || msg.includes('permission')) {
    return new Error(
      `Sin acceso a la carpeta de Drive. Comparte la carpeta con la cuenta de servicio: ${env.google.serviceAccountEmail}`,
    );
  }
  if (code === 404 || msg.includes('not found') || msg.includes('notfound')) {
    return new Error(
      'No se encontró la carpeta de Drive. Verifica que el ID o URL en el campo id_drive sea correcto.',
    );
  }
  return err instanceof Error ? err : new Error(String(err));
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
      throw new Error(
        'Google Drive tardó demasiado en responder. Verifica tu conexión e intenta de nuevo.',
      );
    }
    throw classifyDriveError(err);
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

  return { folderId, fileCount: files.length, spreadsheets, pdfs, otherFiles, checks, status, runAt: new Date().toISOString() };
}
