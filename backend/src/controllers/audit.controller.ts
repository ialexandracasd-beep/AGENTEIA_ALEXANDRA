import { Request, Response } from 'express';
import { getStudentById } from '../services/supabase/supabase.service';
import { auditStudentFolder } from '../services/google/drive-audit.service';
import { saveAuditResult } from '../services/supabase/audit.service';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';
import { logger } from '../utils/logger';

export async function runStudentAudit(req: Request, res: Response) {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) return sendNotFound(res, 'Estudiante');

    if (!student.id_drive) {
      return sendError(
        res,
        'El estudiante no tiene carpeta de Drive asignada (id_drive nulo)',
        400,
      );
    }

    logger.info(`Drive audit started: ${student.nombre} (${student.id})`);

    const auditResult = await auditStudentFolder(student.id_drive);
    await saveAuditResult(student.id, auditResult);

    logger.info(
      `Drive audit done: ${student.nombre} — ${auditResult.status}, ${auditResult.fileCount} archivos`,
    );

    return sendSuccess(res, {
      studentId: student.id,
      studentName: student.nombre,
      audit: auditResult,
    });
  } catch (err) {
    logger.error('Drive audit error:', err);
    return sendError(res, (err as Error).message);
  }
}
