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

export async function listFilesInFolder(folderId: string) {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webViewLink)',
  });
  return response.data.files || [];
}
