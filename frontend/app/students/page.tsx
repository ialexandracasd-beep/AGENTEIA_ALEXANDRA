import type { CSSProperties } from 'react';
import { listStudents, type StudentDTO } from '@/lib/api';
import CreateStudentForm from './CreateStudentForm';

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  let students: StudentDTO[] = [];
  let error: string | null = null;

  try {
    students = await listStudents();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error desconocido al cargar estudiantes';
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Gestión de estudiantes
      </h1>

      <CreateStudentForm />

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
        Estudiantes registrados
      </h2>

      {error ? (
        <div style={alertStyles.box}>
          <p style={alertStyles.title}>No se pudieron cargar los estudiantes</p>
          <p style={alertStyles.detail}>{error}</p>
          <p style={alertStyles.hint}>
            Si el error menciona &quot;timeout&quot; o &quot;fetch failed&quot;, el servidor puede
            estar iniciando (free tier). Recarga la página en 30 segundos.
          </p>
        </div>
      ) : students.length === 0 ? (
        <p style={{ color: '#64748b' }}>No hay estudiantes registrados aún.</p>
      ) : (
        <table style={tableStyles.table}>
          <thead>
            <tr>
              {['Nombre', 'Correo', 'Carpeta Drive', 'Hoja', 'Creado'].map((h) => (
                <th key={h} style={tableStyles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} style={tableStyles.tr}>
                <td style={tableStyles.td}>{s.nombre}</td>
                <td style={tableStyles.td}>{s.correo_institucional}</td>
                <td style={tableStyles.td}>
                  {s.drive_folder_id ? (
                    <a href={s.drive_folder_id} target="_blank" rel="noreferrer" style={tableStyles.link}>
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
                  {s.created_at ? new Date(s.created_at).toLocaleDateString('es-MX') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const alertStyles: Record<string, CSSProperties> = {
  box: {
    padding: '1rem 1.25rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    maxWidth: '600px',
  },
  title: { margin: 0, fontWeight: 600, color: '#dc2626' },
  detail: { margin: '0.4rem 0 0', fontSize: '0.875rem', color: '#dc2626', fontFamily: 'monospace' },
  hint: { margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#64748b' },
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
  },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '0.75rem 1rem', verticalAlign: 'middle' },
  link: { color: '#3b82f6', textDecoration: 'none' },
  muted: { color: '#94a3b8' },
};
