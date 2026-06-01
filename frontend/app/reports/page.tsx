export default function ReportsPage() {
  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Reportes</h1>
        <span style={{
          fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px',
          background: '#fef9c3', color: '#a16207', borderRadius: '9999px',
        }}>
          Módulo en desarrollo
        </span>
      </div>

      <p style={{ margin: '0 0 1.5rem', color: '#475569', lineHeight: 1.6 }}>
        Este módulo centralizará los resúmenes de avance del curso: cuántos estudiantes tienen entregas completas,
        quiénes están en riesgo y cuáles son las tendencias generales del grupo.
      </p>

      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: '#1e3a5f' }}>
          ¿Qué puedo hacer hoy?
        </h2>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#475569' }}>
          Mientras este módulo esté en desarrollo, el seguimiento se puede hacer desde{' '}
          <a href="/students" style={{ color: '#3b82f6' }}>Estudiantes</a>:
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.8 }}>
          <li>Auditar todas las carpetas de Drive con el botón de auditoría masiva.</li>
          <li>Ver el badge de estado por estudiante (Aprobado, Con hallazgos, Sin archivos).</li>
          <li>Revisar el detalle de archivos por cada carpeta.</li>
        </ul>
      </div>

      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: '#1e3a5f' }}>
          Próximamente en este módulo
        </h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.8 }}>
          <li>Resumen del grupo: total de estudiantes, porcentaje con entregas completas.</li>
          <li>Lista de estudiantes en riesgo (sin carpeta, sin archivos, sin revisión).</li>
          <li>Comparativa entre grupos o períodos académicos.</li>
          <li>Exportación del reporte en PDF o Excel.</li>
          <li>Vista de avance por estudiante a lo largo del semestre.</li>
        </ul>
      </div>

      <a href="/" style={{ fontSize: '0.875rem', color: '#3b82f6' }}>← Volver al Panel de Control</a>
    </div>
  );
}

const cardStyle = {
  padding: '1.25rem',
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  marginBottom: '1rem',
} as const;
