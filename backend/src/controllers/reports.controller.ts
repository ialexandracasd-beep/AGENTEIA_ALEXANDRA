import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils/response';

type AuditRow    = { status: string };
type ReviewRow   = { status: string; overall_score: number | null };
type StudentRow  = { id: string; nombre: string; correo_institucional: string };

export async function getReportsSummary(_req: Request, res: Response) {
  try {
    const [
      studentsTotal,
      studentsWithDrive,
      auditsAll,
      reviewsAll,
      atRisk,
    ] = await Promise.all([
      supabaseAdmin.from('students').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).not('id_drive', 'is', null),
      supabaseAdmin.from('drive_audits').select('status'),
      supabaseAdmin.from('ai_reviews').select('status, overall_score'),
      supabaseAdmin
        .from('students')
        .select('id, nombre, correo_institucional')
        .is('id_drive', null)
        .order('nombre')
        .limit(30),
    ]);

    const auditByStatus = ((auditsAll.data ?? []) as AuditRow[]).reduce<Record<string, number>>(
      (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
      {},
    );

    const reviewRows = (reviewsAll.data ?? []) as ReviewRow[];
    const reviewsCompleted = reviewRows.filter(r => r.status === 'completed').length;
    const reviewsPending   = reviewRows.filter(r => r.status !== 'completed').length;
    const scores           = reviewRows.map(r => r.overall_score).filter((s): s is number => s !== null);
    const avgScore         = scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;

    return sendSuccess(res, {
      totalStudents:    studentsTotal.count  ?? 0,
      studentsWithDrive: studentsWithDrive.count ?? 0,
      totalAudits:      (auditsAll.data ?? []).length,
      auditsByStatus:   auditByStatus,
      reviewsCompleted,
      reviewsPending,
      avgReviewScore:   avgScore,
      studentsAtRisk:   (atRisk.data ?? []) as StudentRow[],
    });
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}
