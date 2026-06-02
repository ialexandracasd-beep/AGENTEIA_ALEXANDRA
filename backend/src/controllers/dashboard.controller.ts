import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { sendSuccess, sendError } from '../utils/response';

type RecentAuditRaw = {
  id: string;
  status: string;
  file_count: number;
  created_at: string;
  // Supabase devuelve la relación como array aunque sea 1:1
  students: { nombre: string }[] | null;
};

export async function getDashboardStats(_req: Request, res: Response) {
  try {
    const [studentsResult, withDriveResult, auditsResult, recentResult] = await Promise.all([
      supabaseAdmin.from('students').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('students').select('*', { count: 'exact', head: true }).not('id_drive', 'is', null),
      supabaseAdmin.from('drive_audits').select('status'),
      supabaseAdmin
        .from('drive_audits')
        .select('id, status, file_count, created_at, students(nombre)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const byStatus = ((auditsResult.data ?? []) as { status: string }[]).reduce<Record<string, number>>(
      (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
      {},
    );

    const recent = ((recentResult.data ?? []) as RecentAuditRaw[]).map(r => ({
      studentName: r.students?.[0]?.nombre ?? 'Estudiante',
      status: r.status,
      fileCount: r.file_count,
      createdAt: r.created_at,
    }));

    return sendSuccess(res, {
      totalStudents:    studentsResult.count  ?? 0,
      studentsWithDrive: withDriveResult.count ?? 0,
      totalAudits:      (auditsResult.data ?? []).length,
      byStatus,
      recentAudits: recent,
    });
  } catch (err) {
    return sendError(res, (err as Error).message);
  }
}
