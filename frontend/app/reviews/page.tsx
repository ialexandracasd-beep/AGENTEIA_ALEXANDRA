import type { CSSProperties } from 'react';
import { listAllReviews, listStudents, type ReviewListItem } from '@/lib/api';
import TriggerReview from './TriggerReview';

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<ReviewListItem['status'], string> = {
  pending:    'Pendiente',
  in_progress: 'En proceso',
  completed:  'Completado',
  failed:     'Fallido',
};

const STATUS_STYLE: Record<ReviewListItem['status'], CSSProperties> = {
  pending:    { background: '#f1f5f9', color: '#64748b' },
  in_progress: { background: '#eff6ff', color: '#2563eb' },
  completed:  { background: '#f0fdf4', color: '#15803d' },
  failed:     { background: '#fef2f2', color: '#dc2626' },
};

const TYPE_LABEL: Record<ReviewListItem['reviewType'], string> = {
  structural:    'Estructural',
  methodological: 'Metodológica',
  full:          'Completa',
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: '#94a3b8' }}>—</span>;
  const color = score >= 70 ? '#15803d' : score >= 50 ? '#a16207' : '#dc2626';
  const bg    = score >= 70 ? '#f0fdf4' : score >= 50 ? '#fffbeb' : '#fef2f2';
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, background: bg, color }}>
      {score}/100
    </span>
  );
}

export default async function ReviewsPage() {
  const [reviews, students] = await Promise.all([
    listAllReviews().catch((): ReviewListItem[] => []),
    listStudents().catch(() => []),
  ]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700 }}>Revisiones de contenido</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Análisis IA de documentos · {reviews.length} revisiones registradas
          </p>
        </div>
        <TriggerReview students={students} onDone={() => { /* page re-renders server-side */ }} />
      </div>

      {reviews.length === 0 ? (
        <EmptyReviews />
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={tableS.table}>
            <thead>
              <tr>
                {['Estudiante', 'Tipo', 'Puntaje', 'Estado', 'Fecha', 'Retroalimentación'].map(h => (
                  <th key={h} style={tableS.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id} style={tableS.tr}>
                  <td style={tableS.td}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{r.studentName}</p>
                  </td>
                  <td style={tableS.td}>
                    <span style={{ fontSize: '0.8rem', color: '#475569' }}>{TYPE_LABEL[r.reviewType]}</span>
                  </td>
                  <td style={tableS.td}>
                    <ScoreBadge score={r.overallScore ?? r.coherenceScore} />
                  </td>
                  <td style={tableS.td}>
                    <span style={{ ...badge, ...STATUS_STYLE[r.status] }}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td style={tableS.td}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {new Date(r.createdAt).toLocaleDateString('es-MX')}
                    </span>
                  </td>
                  <td style={{ ...tableS.td, maxWidth: '280px' }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#475569', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {r.feedback ?? '—'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyReviews() {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </div>
      <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: '#374151' }}>Sin revisiones todavía</p>
      <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#9ca3af', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
        Usa el botón <strong>Nueva revisión</strong> para analizar el documento de un estudiante con IA.
      </p>
    </div>
  );
}

const badge: CSSProperties = {
  display: 'inline-block', padding: '2px 8px',
  borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600,
};

const tableS: Record<string, CSSProperties> = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f8fafc', fontWeight: 600, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#475569' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '0.875rem 1rem', verticalAlign: 'middle' },
};
