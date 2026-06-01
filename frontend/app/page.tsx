export default function HomePage() {
  return (
    <div>
      <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 700 }}>
        Panel de Control
      </h2>
      <p style={{ margin: '0 0 0.25rem', color: '#475569' }}>
        Bienvenida al sistema AgenteIA Alexandra.
      </p>
      <p style={{ margin: '0 0 2rem', fontSize: '0.875rem', color: '#64748b', padding: '0.75rem 1rem', background: '#f1f5f9', borderRadius: '6px', borderLeft: '3px solid #3b82f6' }}>
        Empieza en <strong>Estudiantes</strong> para auditar en lote las carpetas de Drive.
        Los módulos de Revisiones y Reportes estarán disponibles próximamente.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <DashboardCard
          title="Estudiantes"
          description="Gestionar estudiantes y auditar en lote sus carpetas de Google Drive."
          href="/students"
          status="active"
        />
        <DashboardCard
          title="Revisiones"
          description="Revisión de contenido con IA: estructura, coherencia y metodología."
          href="/reviews"
          status="dev"
        />
        <DashboardCard
          title="Reportes"
          description="Resumen de avance, entregas completas y estudiantes en riesgo."
          href="/reports"
          status="dev"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  description,
  href,
  status,
}: {
  title: string;
  description: string;
  href: string;
  status: 'active' | 'dev';
}) {
  return (
    <a
      href={href}
      style={{
        display: 'block',
        padding: '1.5rem',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: '1rem' }}>{title}</h3>
        {status === 'dev' && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, padding: '2px 7px',
            background: '#fef9c3', color: '#a16207', borderRadius: '9999px',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            En desarrollo
          </span>
        )}
        {status === 'active' && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, padding: '2px 7px',
            background: '#dcfce7', color: '#15803d', borderRadius: '9999px',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Activo
          </span>
        )}
      </div>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>{description}</p>
    </a>
  );
}
