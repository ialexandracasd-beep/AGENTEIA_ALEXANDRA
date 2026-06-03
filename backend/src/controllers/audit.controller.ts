import { Request, Response } from 'express';
import { getStudentById } from '../services/supabase/supabase.service';
import { auditStudentFolder } from '../services/google/drive-audit.service';
import { saveAuditResult, getLatestAudit } from '../services/supabase/audit.service';
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

    // Se ESPERA el guardado antes de responder: garantiza que la fila quede en
    // drive_audits aunque Render duerma la instancia tras la respuesta. Si falla,
    // no rompemos la auditoría (que sí corrió), pero el error viaja como `warning`.
    let warning: string | undefined;
    try {
      await saveAuditResult(student.id, auditResult);
    } catch (saveErr) {
      warning = 'La auditoría se ejecutó, pero no se pudo guardar en el historial. Revisa los logs del servidor.';
      logger.error(`saveAuditResult FAILED for ${student.id}: ${(saveErr as Error).message}`);
    }

    logger.info(`Drive audit done: ${student.nombre} — ${auditResult.status}, ${auditResult.fileCount} archivos`);

    return sendSuccess(res, {
      studentId: student.id,
      studentName: student.nombre,
      audit: auditResult,
      ...(warning ? { warning } : {}),
    });
  } catch (err) {
    logger.error('Drive audit error:', err);
    return sendError(res, (err as Error).message);
  }
}

// Lee la última auditoría guardada para reflejar el historial al cargar la página.
export async function getStudentAudit(req: Request, res: Response) {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) return sendNotFound(res, 'Estudiante');

    const latest = await getLatestAudit(student.id);
    if (!latest) return sendSuccess(res, null);

    return sendSuccess(res, {
      studentId: student.id,
      studentName: student.nombre,
      audit: {
        folderId:     latest.folder_id,
        fileCount:    latest.file_count,
        spreadsheets: latest.spreadsheets,
        pdfs:         latest.pdfs,
        otherFiles:   latest.other_files,
        checks:       latest.checks,
        status:       latest.status,
        runAt:        latest.created_at,
      },
    });
  } catch (err) {
    logger.error('Get student audit error:', err);
    return sendError(res, (err as Error).message);
  }
}
