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
    error = err instanceof Error ? err.message : 'Error al cargar estudiantes';
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
        <p style={{ color: '#dc2626' }}>Error: {error}</p>
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
                <td style={tableStyles.td}>{s.name}</td>
                <td style={tableStyles.td}>{s.email}</td>
                <td style={tableStyles.td}>
                  {s.driveFolder ? (
                    <a href={s.driveFolder} target="_blank" rel="noreferrer" style={tableStyles.link}>
                      Abrir
                    </a>
                  ) : (
                    <span style={tableStyles.muted}>—</span>
                  )}
                </td>
                <td style={tableStyles.td}>
                  {s.sheetUrl ? (
                    <a href={s.sheetUrl} target="_blank" rel="noreferrer" style={tableStyles.link}>
                      Ver hoja
                    </a>
                  ) : (
                    <span style={tableStyles.muted}>—</span>
                  )}
                </td>
                <td style={tableStyles.td}>
                  {new Date(s.createdAt).toLocaleDateString('es-MX')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

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
