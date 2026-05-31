import { Request, Response } from 'express';
import { getSheetData } from '../services/google/sheets.service';
import { getStudentById } from '../services/supabase/supabase.service';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';

export async function getStudentSheetData(req: Request, res: Response) {
  try {
    const student = await getStudentById(req.params.studentId);
    if (!student) return sendNotFound(res, 'Estudiante');
    if (!student.sheet_id) return sendError(res, 'El estudiante no tiene sheet asignado', 400);

    const rows = await getSheetData(student.sheet_id);
    sendSuccess(res, rows);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}
