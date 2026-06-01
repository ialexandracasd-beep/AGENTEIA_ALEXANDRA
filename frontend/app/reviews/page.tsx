export default function ReviewsPage() {
  return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Revisiones</h1>
        <span style={{
          fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px',
          background: '#fef9c3', color: '#a16207', borderRadius: '9999px',
        }}>
          Módulo en desarrollo
        </span>
      </div>

      <p style={{ margin: '0 0 1.5rem', color: '#475569', lineHeight: 1.6 }}>
        Este módulo mostrará las revisiones de contenido generadas por IA para cada entrega de los estudiantes:
        análisis de estructura, coherencia argumentativa y rigurosidad metodológica.
      </p>

      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: '#1e3a5f' }}>
          ¿Qué puedo hacer hoy?
        </h2>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#475569' }}>
          Por ahora, usa el módulo de <a href="/students" style={{ color: '#3b82f6' }}>Estudiantes</a> para:
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.8 }}>
          <li>Auditar en lote las carpetas de Drive de todos los estudiantes.</li>
          <li>Ver qué carpetas tienen los archivos mínimos requeridos.</li>
          <li>Identificar estudiantes sin entregas o con carpetas incompletas.</li>
        </ul>
      </div>

      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600, color: '#1e3a5f' }}>
          Próximamente en este módulo
        </h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.8 }}>
          <li>Resumen automático del trabajo del estudiante (generado por IA).</li>
          <li>Análisis de estructura: introducción, objetivos, metodología, conclusiones.</li>
          <li>Evaluación de coherencia entre objetivos y resultados.</li>
          <li>Sugerencias de retroalimentación listas para compartir con el estudiante.</li>
          <li>Historial de revisiones por estudiante y por entrega.</li>
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
