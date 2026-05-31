import { CreateStudentDto } from '../../types/student.types';
import { createStudentFolder, grantPermission } from '../google/drive.service';
import { createStudentSheet } from '../google/sheets.service';
import { createStudent, updateStudentSheet } from '../supabase/supabase.service';
import { logger } from '../../utils/logger';

export async function createStudentFlow(dto: CreateStudentDto) {
  logger.info(`Starting create student flow for: ${dto.nombre}`);

  const student = await createStudent(dto);

  const folderId = await createStudentFolder(dto.nombre);
  const sheetId = await createStudentSheet(dto.nombre, folderId);

  await grantPermission(folderId, dto.correo_institucional, 'writer');
  await grantPermission(sheetId, dto.correo_institucional, 'reader');

  await updateStudentSheet(student.id, sheetId, folderId);

  logger.info(`Student flow complete for: ${dto.nombre} (${student.id})`);
  return { ...student, drive_folder_id: folderId, sheet_id: sheetId };
}
