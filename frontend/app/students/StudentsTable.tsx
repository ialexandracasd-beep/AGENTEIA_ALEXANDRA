'use client';

import { Fragment, useState, useRef, useEffect, type CSSProperties } from 'react';
import { auditStudent, getStudentAudit, type StudentDTO, type DriveAuditResult } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuditState {
  loading: boolean;
  result: DriveAuditResult | null;
  warning: string | null;
  error: string | null;
  expanded: boolean;
}

interface BatchProgress {
  current: number;
  total: number;
  currentName: string;
}

interface Props {
  students: StudentDTO[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<DriveAuditResult['status'], string> = {
  approved: 'Aprobado',
  findings: 'Con hallazgos',
  empty: 'Sin archivos',
};

const STATUS_COLOR: Record<DriveAuditResult['status'], CSSProperties> = {
  approved: { background: '#dcfce7', color: '#15803d' },
  findings: { background: '#fef9c3', color: '#a16207' },
  empty:    { background: '#f1f5f9', color: '#64748b' },
};

const DEFAULT_AUDIT_STATE: AuditState = {
  loading: false, result: null, warning: null, error: null, expanded: false,
};

// ── Helper ────────────────────────────────────────────────────────────────────

function friendlyError(raw: string): string {
  if (raw.includes('Sin acceso') || raw.includes('Comparte la carpeta') || raw.includes('cuenta de servicio')) return raw;
  if (raw.includes('No se encontró la carpeta')) return raw;
  if (raw.includes('tardó demasiado') || raw.includes('timeout') || raw.includes('no respondió'))
    return 'Google Drive tardó demasiado en responder. Intenta de nuevo.';
  if (raw.includes('Failed to fetch') || raw.includes('localhost') || raw.includes('ECONNREFUSED'))
    return 'No se pudo conectar con el servidor. Recarga la página o intenta más tarde.';
  if (raw.includes('HTTP 400')) return raw.replace('HTTP 400: ', '');
  if (raw.includes('id_drive nulo') || raw.includes('no tiene carpeta')) return 'Este estudiante no tiene carpeta de Drive asignada.';
  if (raw.includes('HTTP 500')) return 'El servidor encontró un error interno. Intenta de nuevo más tarde.';
  return raw;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StudentsTable({ students }: Props) {
  const [auditMap, setAuditMap] = useState<Record<string, AuditState>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const cancelRef = useRef(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const studentsWithDrive = students.filter(s => s.id_drive);
  const allSelected = studentsWithDrive.length > 0 && selected.size === studentsWithDrive.length;
  const someSelected = selected.size > 0 && selected.size < studentsWithDrive.length;

  // Indeterminate state on the "select all" checkbox requires a DOM ref
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  // Precarga historial de drive_audits al montar para que las filas reflejen
  // el estado guardado sin necesidad de re-auditar.
  useEffect(() => {
    students
      .filter(s => s.id_drive)
      .forEach(s => {
        if (getAudit(s.id).loading) return;
        getStudentAudit(s.id)
          .then(resp => {
            if (resp?.audit) {
              patchAudit(s.id, { loading: false, result: resp.audit, warning: null, error: null });
            }
          })
          .catch(() => { /* la precarga del historial nunca rompe la tabla */ });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── State helpers ───────────────────────────────────────────────────────────

  function getAudit(id: string): AuditState {
    return auditMap[id] ?? DEFAULT_AUDIT_STATE;
  }

  function patchAudit(id: string, patch: Partial<AuditState>) {
    setAuditMap(prev => ({ ...prev, [id]: { ...(prev[id] ?? DEFAULT_AUDIT_STATE), ...patch } }));
  }

  // ── Selection ───────────────────────────────────────────────────────────────

  function toggleSelectAll() {
    setSelected(allSelected || someSelected
      ? new Set()
      : new Set(studentsWithDrive.map(s => s.id)));
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // ── Batch audit ─────────────────────────────────────────────────────────────

  async function handleBatchAudit() {
    const targets = selected.size > 0
      ? students.filter(s => s.id_drive && selected.has(s.id))
      : studentsWithDrive;

    if (targets.length === 0) return;

    cancelRef.current = false;
    setBatchRunning(true);

    for (let i = 0; i < targets.length; i++) {
      if (cancelRef.current) break;

      const s = targets[i];
      setBatchProgress({ current: i + 1, total: targets.length, currentName: s.nombre });
      patchAudit(s.id, { loading: true, error: null, warning: null });

      try {
        const { audit, warning } = await auditStudent(s.id);
        patchAudit(s.id, { loading: false, result: audit, warning: warning ?? null });
      } catch (err) {
        patchAudit(s.id, {
          loading: false,
          error: friendlyError(err instanceof Error ? err.message : 'Error desconocido'),
        });
      }
    }

    setBatchRunning(false);
    setBatchProgress(null);
    cancelRef.current = false;
  }

  function handleCancel() {
    cancelRef.current = true;
  }

  function toggleExpand(id: string) {
    patchAudit(id, { expanded: !getAudit(id).expanded });
  }

  if (students.length === 0) {
    return <p style={{ color: '#64748b' }}>No hay estudiantes registrados aún.</p>;
  }

  const batchButtonLabel = selected.size > 0
    ? `Auditar archivos — seleccionados (${selected.size})`
    : `Auditar archivos — todos (${studentsWithDrive.length})`;

  return (
    <div>
      {/* ── Panel de acciones masivas ─────────────────────────────────────── */}
      <div style={panelStyles.container}>
        <div style={panelStyles.topRow}>
          <label style={panelStyles.selectAllLabel}>
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              disabled={batchRunning || studentsWithDrive.length === 0}
              style={{ cursor: 'pointer' }}
            />
            Seleccionar todos
          </label>

          <span style={panelStyles.countText}>
            {studentsWithDrive.length} estudiante{studentsWithDrive.length !== 1 ? 's' : ''} con carpeta Drive
            {selected.size > 0 && (
              <span style={{ color: '#3b82f6', marginLeft: '0.5rem' }}>
                · {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
              </span>
            )}
          </span>

          <div style={{ marginLeft: 'auto' }}>
            {batchRunning ? (
              <button onClick={handleCancel} style={btnStyles.cancel}>
                Cancelar
              </button>
            ) : (
              <button
                onClick={handleBatchAudit}
                disabled={studentsWithDrive.length === 0}
                style={studentsWithDrive.length === 0
                  ? { ...btnStyles.primary, ...btnStyles.disabledStyle }
                  : btnStyles.primary}
              >
                {batchButtonLabel}
              </button>
            )}
          </div>
        </div>

        {batchRunning && batchProgress && (
          <div style={panelStyles.progressWrap}>
            <div style={panelStyles.progressTrack}>
              <div
                style={{
                  ...panelStyles.progressFill,
                  width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                }}
              />
            </div>
            <p style={panelStyles.progressText}>
              {batchProgress.current} / {batchProgress.total} · Procesando: {batchProgress.currentName}
            </p>
          </div>
        )}

        {studentsWithDrive.length === 0 && (
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Ningún estudiante tiene carpeta de Drive asignada aún.
          </p>
        )}
      </div>

      {/* ── Tabla ────────────────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={tableStyles.table}>
          <thead>
            <tr>
              <th style={{ ...tableStyles.th, width: '2.5rem' }} />
              {['Nombre', 'Correo', 'Drive', 'Hoja', 'Archivos', 'Creado'].map(h => (
                <th key={h} style={tableStyles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(s => {
              const state = getAudit(s.id);
              const isSelectable = !!s.id_drive;

              return (
                <Fragment key={s.id}>
                  <tr style={tableStyles.tr}>
                    {/* Checkbox */}
                    <td style={{ ...tableStyles.td, textAlign: 'center' }}>
                      {isSelectable ? (
                        <input
                          type="checkbox"
                          checked={selected.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          disabled={batchRunning}
                          style={{ cursor: batchRunning ? 'not-allowed' : 'pointer' }}
                        />
                      ) : (
                        <span style={{ color: '#e2e8f0' }}>—</span>
                      )}
                    </td>

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

                    {/* Columna Archivos: badge + detalle */}
                    <td style={tableStyles.td}>
                      {state.loading ? (
                        <span style={{ ...badgeBase, background: '#eff6ff', color: '#3b82f6' }}>
                          Auditando…
                        </span>
                      ) : state.result ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ ...badgeBase, ...STATUS_COLOR[state.result.status] }}>
                            {STATUS_LABEL[state.result.status]}
                          </span>
                          <button onClick={() => toggleExpand(s.id)} style={btnStyles.link}>
                            {state.expanded ? 'Ocultar' : 'Ver detalle'}
                          </button>
                        </div>
                      ) : state.error ? (
                        <span style={{ ...badgeBase, background: '#fef2f2', color: '#dc2626' }}>
                          Error
                        </span>
                      ) : (
                        <span style={{ ...badgeBase, background: '#f1f5f9', color: '#94a3b8' }}>
                          Pendiente
                        </span>
                      )}
                      {state.error && <p style={msgStyles.error}>{state.error}</p>}
                      {state.warning && <p style={msgStyles.warning}>{state.warning}</p>}
                    </td>

                    <td style={tableStyles.td}>
                      {s.created_at ? new Date(s.created_at).toLocaleDateString('es-MX') : '—'}
                    </td>
                  </tr>

                  {state.expanded && state.result && (
                    <tr>
                      <td colSpan={7} style={detailStyles.cell}>
                        <AuditDetail result={state.result} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Audit detail panel ────────────────────────────────────────────────────────

function AuditDetail({ result }: { result: DriveAuditResult }) {
  const ts = new Date(result.runAt).toLocaleString('es-MX');
  const summaryText = result.fileCount === 0
    ? 'No se encontraron archivos en la carpeta de Drive del estudiante.'
    : `Se encontraron ${result.fileCount} archivo${result.fileCount !== 1 ? 's' : ''} en la carpeta.`;

  return (
    <div style={detailStyles.panel}>
      <div style={detailStyles.header}>
        <strong>Detalle de auditoría</strong>
        <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '1rem' }}>{ts}</span>
      </div>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem', color: '#475569' }}>{summaryText}</p>
      <div style={detailStyles.checks}>
        <CheckItem ok={result.checks.hasAnyFile} label="Carpeta con archivos" />
        <CheckItem ok={result.checks.hasSpreadsheet} label="Hoja de cálculo" />
        <CheckItem ok={result.checks.hasPdf} label="Archivo PDF" />
      </div>
      {result.spreadsheets.length > 0 && <FileGroup title="Hojas de cálculo" files={result.spreadsheets} />}
      {result.pdfs.length > 0 && <FileGroup title="PDFs" files={result.pdfs} />}
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
      <span style={{ color: ok ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{ok ? '✓' : '✗'}</span>
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
            {f.webViewLink
              ? <a href={f.webViewLink} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>{f.name}</a>
              : f.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const badgeBase: CSSProperties = {
  display: 'inline-block', padding: '2px 8px',
  borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
};

const msgStyles = {
  error:   { margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#dc2626', maxWidth: '280px' } satisfies CSSProperties,
  warning: { margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#a16207', maxWidth: '280px' } satisfies CSSProperties,
};

const btnStyles = {
  primary: {
    padding: '0.45rem 1rem', background: '#1e3a5f', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
  } satisfies CSSProperties,
  cancel: {
    padding: '0.45rem 1rem', background: '#dc2626', color: '#fff',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
  } satisfies CSSProperties,
  disabledStyle: { opacity: 0.5, cursor: 'not-allowed' } satisfies CSSProperties,
  link: {
    background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
    fontSize: '0.75rem', padding: 0, textDecoration: 'underline',
  } satisfies CSSProperties,
};

const panelStyles: Record<string, CSSProperties> = {
  container: {
    padding: '1rem 1.25rem', background: '#f8fafc',
    border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1.25rem',
  },
  topRow: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  selectAllLabel: { display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer', userSelect: 'none' },
  countText: { fontSize: '0.875rem', color: '#64748b' },
  progressWrap: { marginTop: '0.75rem' },
  progressTrack: { height: '6px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.35rem' },
  progressFill: { height: '100%', background: '#3b82f6', borderRadius: '9999px', transition: 'width 0.25s ease' },
  progressText: { margin: 0, fontSize: '0.8rem', color: '#64748b' },
};

const tableStyles: Record<string, CSSProperties> = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' },
  th: { textAlign: 'left', padding: '0.75rem 1rem', background: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', verticalAlign: 'middle' },
  link: { color: '#3b82f6', textDecoration: 'none' },
  muted: { color: '#94a3b8' },
};

const detailStyles: Record<string, CSSProperties> = {
  cell: { padding: 0, borderBottom: '1px solid #e2e8f0', background: '#f8fafc' },
  panel: { padding: '1rem 1.25rem', borderLeft: '3px solid #3b82f6', margin: '0.5rem 1rem', background: '#fff', borderRadius: '0 6px 6px 0' },
  header: { marginBottom: '0.5rem', fontSize: '0.875rem' },
  checks: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' },
};
