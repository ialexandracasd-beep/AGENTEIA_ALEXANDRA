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
        'Este estudiante no tiene carpeta de Drive asignada. Agrega el ID o URL de Drive en su perfil.',
        400,
      );
    }

    logger.info(`Drive audit started: ${student.nombre} (${student.id})`);

    const auditResult = await auditStudentFolder(student.id_drive);

    // Guardar en Supabase de forma no bloqueante: si falla, igual devolvemos el resultado
    let warning: string | undefined;
    try {
      await saveAuditResult(student.id, auditResult);
    } catch (saveErr) {
      warning = 'Auditoría completada, pero no se pudo guardar el registro. Intenta de nuevo en unos minutos.';
      logger.error('saveAuditResult failed (non-blocking):', saveErr);
    }

    logger.info(`Drive audit done: ${student.nombre} — ${auditResult.status}, ${auditResult.fileCount} archivos`);

    return sendSuccess(res, {
      studentId: student.id,
      studentName: student.nombre,
      audit: auditResult,
      ...(warning && { warning }),
    });
  } catch (err) {
    logger.error('Drive audit error:', err);
    return sendError(res, (err as Error).message);
  }
}
