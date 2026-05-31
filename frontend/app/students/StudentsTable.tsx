'use client';

import { useState, type CSSProperties } from 'react';
import { auditStudent, type StudentDTO, type DriveAuditResult } from '@/lib/api';

interface AuditState {
  loading: boolean;
  result: DriveAuditResult | null;
  error: string | null;
  expanded: boolean;
}

interface Props {
  students: StudentDTO[];
}

const STATUS_LABEL: Record<DriveAuditResult['status'], string> = {
  approved: 'Aprobado',
  findings: 'Con hallazgos',
  empty: 'Sin archivos',
};

const STATUS_COLOR: Record<DriveAuditResult['status'], CSSProperties> = {
  approved: { background: '#dcfce7', color: '#15803d' },
  findings: { background: '#fef9c3', color: '#a16207' },
  empty: { background: '#f1f5f9', color: '#64748b' },
};

export default function StudentsTable({ students }: Props) {
  const [auditMap, setAuditMap] = useState<Record<string, AuditState>>({});

  function getState(id: string): AuditState {
    return auditMap[id] ?? { loading: false, result: null, error: null, expanded: false };
  }

  function setState(id: string, patch: Partial<AuditState>) {
    setAuditMap(prev => ({ ...prev, [id]: { ...getState(id), ...patch } }));
  }

  async function handleAudit(studentId: string) {
    setState(studentId, { loading: true, error: null, expanded: false });
    try {
      const { audit } = await auditStudent(studentId);
      setState(studentId, { loading: false, result: audit, expanded: true });
    } catch (err) {
      setState(studentId, {
        loading: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      });
    }
  }

  function toggleExpand(id: string) {
    setState(id, { expanded: !getState(id).expanded });
  }

  if (students.length === 0) {
    return <p style={{ color: '#64748b' }}>No hay estudiantes registrados aún.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyles.table}>
        <thead>
          <tr>
            {['Nombre', 'Correo', 'Drive Auditoría', 'Hoja', 'Estado', 'Auditoría', 'Creado'].map(h => (
              <th key={h} style={tableStyles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map(s => {
            const state = getState(s.id);
            return (
              <>
                <tr key={s.id} style={tableStyles.tr}>
                  <td style={tableStyles.td}>{s.nombre}</td>
                  <td style={tableStyles.td}>{s.correo_institucional}</td>

                  <td style={tableStyles.td}>
                    {s.id_drive ? (
                      <a href={s.id_drive} target="_blank" rel="noreferrer" style={tableStyles.link}>
                        Abrir
                      </a>
                    ) : (
                      <span style={tableStyles.muted}>—</span>
                    )}
                  </td>

                  <td style={tableStyles.td}>
                    {s.sheet_url ? (
                      <a href={s.sheet_url} target="_blank" rel="noreferrer" style={tableStyles.link}>
                        Ver hoja
                      </a>
                    ) : (
                      <span style={tableStyles.muted}>—</span>
                    )}
                  </td>

                  <td style={tableStyles.td}>
                    {state.result ? (
                      <span style={{ ...badgeBase, ...STATUS_COLOR[state.result.status] }}>
                        {STATUS_LABEL[state.result.status]}
                      </span>
                    ) : (
                      <span style={{ ...badgeBase, background: '#f1f5f9', color: '#94a3b8' }}>
                        Pendiente
                      </span>
                    )}
                  </td>

                  <td style={tableStyles.td}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      {s.id_drive ? (
                        <button
                          onClick={() => handleAudit(s.id)}
                          disabled={state.loading}
                          style={state.loading ? { ...btnStyles.base, ...btnStyles.disabled } : btnStyles.base}
                        >
                          {state.loading ? 'Auditando…' : 'Auditar'}
                        </button>
                      ) : (
                        <span style={tableStyles.muted} title="Sin id_drive">N/A</span>
                      )}
                      {state.result && (
                        <button onClick={() => toggleExpand(s.id)} style={btnStyles.ghost}>
                          {state.expanded ? 'Ocultar' : 'Ver detalle'}
                        </button>
                      )}
                    </div>
                    {state.error && (
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#dc2626' }}>
                        {state.error}
                      </p>
                    )}
                  </td>

                  <td style={tableStyles.td}>
                    {s.created_at ? new Date(s.created_at).toLocaleDateString('es-MX') : '—'}
                  </td>
                </tr>

                {state.expanded && state.result && (
                  <tr key={`${s.id}-detail`}>
                    <td colSpan={7} style={detailStyles.cell}>
                      <AuditDetail result={state.result} />
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Audit detail panel ────────────────────────────────────────────────────────

function AuditDetail({ result }: { result: DriveAuditResult }) {
  const ts = new Date(result.runAt).toLocaleString('es-MX');

  return (
    <div style={detailStyles.panel}>
      <div style={detailStyles.header}>
        <strong>Detalle de auditoría</strong>
        <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '1rem' }}>
          {ts} · {result.fileCount} archivo{result.fileCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={detailStyles.checks}>
        <CheckItem ok={result.checks.hasAnyFile} label="Carpeta no vacía" />
        <CheckItem ok={result.checks.hasSpreadsheet} label="Hoja de cálculo presente" />
        <CheckItem ok={result.checks.hasPdf} label="Archivo PDF presente" />
      </div>

      {result.spreadsheets.length > 0 && (
        <FileGroup title="Hojas de cálculo" files={result.spreadsheets} />
      )}
      {result.pdfs.length > 0 && (
        <FileGroup title="PDFs" files={result.pdfs} />
      )}
      {result.otherFiles.length > 0 && (
        <FileGroup
          title="Otros archivos"
          files={result.otherFiles.map(f => ({ id: f.id, name: f.name, webViewLink: f.webViewLink }))}
        />
      )}
    </div>
  );
}

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
      <span style={{ color: ok ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
        {ok ? '✓' : '✗'}
      </span>
      <span style={{ color: ok ? '#166534' : '#991b1b' }}>{label}</span>
    </div>
  );
}

function FileGroup({ title, files }: { title: string; files: { id: string; name: string; webViewLink?: string }[] }) {
  return (
    <div style={{ marginTop: '0.75rem' }}>
      <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
        {title} ({files.length})
      </p>
      <ul style={{ margin: 0, padding: '0 0 0 1rem', fontSize: '0.8rem', color: '#334155' }}>
        {files.map(f => (
          <li key={f.id} style={{ marginBottom: '0.2rem' }}>
            {f.webViewLink ? (
              <a href={f.webViewLink} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>
                {f.name}
              </a>
            ) : (
              f.name
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const badgeBase: CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 600,
};

const btnStyles = {
  base: {
    padding: '0.3rem 0.65rem',
    background: '#1e3a5f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
  } satisfies CSSProperties,
  disabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  } satisfies CSSProperties,
  ghost: {
    padding: '0.3rem 0.65rem',
    background: 'transparent',
    color: '#3b82f6',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  } satisfies CSSProperties,
};

const tableStyles: Record<string, CSSProperties> = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    background: '#f1f5f9',
    fontWeight: 600,
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', verticalAlign: 'middle' },
  link: { color: '#3b82f6', textDecoration: 'none' },
  muted: { color: '#94a3b8' },
};

const detailStyles: Record<string, CSSProperties> = {
  cell: {
    padding: 0,
    borderBottom: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  panel: {
    padding: '1rem 1.25rem',
    borderLeft: '3px solid #3b82f6',
    margin: '0.5rem 1rem',
    background: '#fff',
    borderRadius: '0 6px 6px 0',
  },
  header: {
    marginBottom: '0.75rem',
    fontSize: '0.875rem',
  },
  checks: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginBottom: '0.5rem',
  },
};
