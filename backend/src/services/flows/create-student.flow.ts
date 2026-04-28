import { CreateStudentDto } from '../../types/student.types';
import { createStudentFolder, grantPermission } from '../google/drive.service';
import { createStudentSheet } from '../google/sheets.service';
import { createStudent, updateStudentSheet } from '../supabase/supabase.service';
import { logger } from '../../utils/logger';

export async function createStudentFlow(dto: CreateStudentDto) {
  logger.info(`Starting create student flow for: ${dto.name}`);

  // 1. Create student record in Supabase
  const student = await createStudent(dto);

  // 2. Create folder in Google Drive
  const folderId = await createStudentFolder(dto.name);

  // 3. Create individual tracking sheet
  const sheetId = await createStudentSheet(dto.name, folderId);

  // 4. Grant access to student email
  await grantPermission(folderId, dto.email, 'writer');
  await grantPermission(sheetId, dto.email, 'reader');

  // 5. Update Supabase with Drive/Sheet references
  await updateStudentSheet(student.id, sheetId, folderId);

  logger.info(`Student flow complete for: ${dto.name} (${student.id})`);
  return { ...student, driveFolder: folderId, sheetId };
}
