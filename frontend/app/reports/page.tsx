import type { CSSProperties } from 'react';
import { getReportsSummary, type ReportsSummary } from '@/lib/api';
import ExportPDF from './ExportPDF';

export const dynamic = 'force-dynamic';

function KpiCard({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', borderTop: `3px solid ${color}` }}>
      <p style={{ margin: '0 0 0.2rem', fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{label}</p>
    </div>
  );
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
        <span style={{ color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{value} ({pct}%)</span>
      </div>
      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '9999px' }} />
      </div>
    </div>
  );
}

export default async function ReportsPage() {
  const summary: ReportsSummary | null = await getReportsSummary().catch(() => null);

  const now = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div id="report-root">
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700 }}>Reportes de avance</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Resumen del curso · {now}</p>
        </div>
        <ExportPDF />
      </div>

      {summary === null ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1.25rem' }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#dc2626' }}>No se pudieron cargar los reportes</p>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>El servidor puede estar iniciando. Recarga en 30 segundos.</p>
        </div>
      ) : (
        <>
          {/* ── KPIs ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <KpiCard value={summary.totalStudents}     label="Estudiantes"         color="#1d4ed8" />
            <KpiCard value={summary.studentsWithDrive}  label="Con carpeta Drive"   color="#16a34a" />
            <KpiCard value={summary.totalAudits}        label="Auditorías"          color="#7c3aed" />
            <KpiCard value={summary.reviewsCompleted}   label="Revisiones IA"       color="#0f766e" />
            <KpiCard value={summary.avgReviewScore !== null ? `${summary.avgReviewScore}/100` : '—'} label="Puntaje promedio" color="#b45309" />
          </div>

          {/* ── Cobertura de auditorías ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <section style={S.card}>
              <h2 style={S.cardTitle}>Cobertura de auditorías Drive</h2>
              {summary.totalAudits === 0 ? (
                <p style={S.empty}>Sin auditorías realizadas aún.</p>
              ) : (
                <>
                  <ProgressBar label="Aprobadas"      value={summary.auditsByStatus['approved']  ?? 0} total={summary.totalAudits} color="#16a34a" />
                  <ProgressBar label="Con hallazgos"  value={summary.auditsByStatus['findings']  ?? 0} total={summary.totalAudits} color="#d97706" />
                  <ProgressBar label="Sin archivos"   value={summary.auditsByStatus['empty']     ?? 0} total={summary.totalAudits} color="#94a3b8" />
                </>
              )}
            </section>

            <section style={S.card}>
              <h2 style={S.cardTitle}>Estado de revisiones IA</h2>
              {summary.reviewsCompleted + summary.reviewsPending === 0 ? (
                <p style={S.empty}>Sin revisiones realizadas aún. Usa la página <a href="/reviews" style={{ color: '#2563eb' }}>Revisiones</a>.</p>
              ) : (
                <>
                  <ProgressBar label="Completadas" value={summary.reviewsCompleted} total={summary.reviewsCompleted + summary.reviewsPending} color="#0f766e" />
                  <ProgressBar label="Pendientes"  value={summary.reviewsPending}   total={summary.reviewsCompleted + summary.reviewsPending} color="#d97706" />
                </>
              )}
            </section>
          </div>

          {/* ── Estudiantes en riesgo ── */}
          <section style={S.card}>
            <h2 style={S.cardTitle}>
              Estudiantes sin carpeta Drive asignada
              <span style={S.riskBadge}>{summary.studentsAtRisk.length}</span>
            </h2>
            {summary.studentsAtRisk.length === 0 ? (
              <p style={{ ...S.empty, color: '#15803d' }}>✓ Todos los estudiantes tienen carpeta de Drive asignada.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
                {summary.studentsAtRisk.map(s => (
                  <div key={s.id} style={{ padding: '0.75rem 1rem', background: '#fef9f9', border: '1px solid #fecaca', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 0.15rem', fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{s.nombre}</p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>{s.correo_institucional}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  card:      { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' },
  cardTitle: { margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  empty:     { margin: 0, fontSize: '0.875rem', color: '#94a3b8' },
  riskBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 800 } as CSSProperties,
};
