interface Student {
  id: string;
  name: string;
  email: string;
  sheetId?: string;
  driveFolder?: string;
}

interface StudentCardProps {
  student: Student;
  onReview?: (id: string) => void;
}

export default function StudentCard({ student, onReview }: StudentCardProps) {
  return (
    <div
      style={{
        padding: '1.25rem',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <p style={{ margin: 0, fontWeight: 600, color: '#1e3a5f' }}>{student.name}</p>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>{student.email}</p>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {student.sheetId && (
            <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '9999px' }}>
              Sheet activo
            </span>
          )}
          {student.driveFolder && (
            <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '9999px' }}>
              Drive activo
            </span>
          )}
        </div>
      </div>
      {onReview && (
        <button
          onClick={() => onReview(student.id)}
          style={{
            padding: '0.5rem 1rem',
            background: '#1e3a5f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          Revisar
        </button>
      )}
    </div>
  );
}
