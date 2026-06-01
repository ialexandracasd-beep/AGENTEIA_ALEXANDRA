import { drive } from '../../config/google';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export async function createStudentFolder(studentName: string): Promise<string> {
  const response = await drive.files.create({
    requestBody: {
      name: studentName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [env.google.driveRootFolderId],
    },
    fields: 'id',
  });

  const folderId = response.data.id!;
  logger.info(`Folder created for student ${studentName}: ${folderId}`);
  return folderId;
}

export async function grantPermission(fileId: string, email: string, role: 'reader' | 'writer' = 'writer') {
  await drive.permissions.create({
    fileId,
    requestBody: {
      type: 'user',
      role,
      emailAddress: email,
    },
  });
  logger.info(`Permission ${role} granted to ${email} on ${fileId}`);
}

export async function listFilesInFolder(folderId: string, signal?: AbortSignal) {
  const listPromise = drive.files
    .list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink)',
    })
    .then(r => r.data.files ?? []);

  if (!signal) return listPromise;

  // Race the Drive call against the abort signal so el caller
  // puede imponer un timeout sin depender de la API interna de gaxios.
  const abortPromise = new Promise<never>((_, reject) => {
    if (signal.aborted) {
      reject(new Error('AbortError'));
      return;
    }
    signal.addEventListener('abort', () => reject(new Error('AbortError')), { once: true });
  });

  return Promise.race([listPromise, abortPromise]);
}
