import type { CSSProperties } from 'react';
import { listStudents } from '@/lib/api';
import CreateStudentForm from './CreateStudentForm';
import StudentsTable from './StudentsTable';

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  let students = await listStudents().catch(() => null);
  const error = students === null
    ? 'No se pudieron cargar los estudiantes. El servidor puede estar iniciando — recarga en 30 s.'
    : null;
  students = students ?? [];

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
        </div>
      ) : (
        <StudentsTable students={students} />
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
  detail: { margin: '0.4rem 0 0', fontSize: '0.875rem', color: '#64748b' },
};
