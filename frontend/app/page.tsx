export default function HomePage() {
  return (
    <div>
      <h2>Panel de Control</h2>
      <p>Bienvenida al sistema AgenteIA Alexandra.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
        <DashboardCard title="Estudiantes" description="Gestionar estudiantes y sus carpetas en Drive" href="/students" />
        <DashboardCard title="Revisiones" description="Iniciar revisiones estructurales y metodológicas" href="/reviews" />
        <DashboardCard title="Reportes" description="Ver resumen de puntajes y observaciones" href="/reports" />
      </div>
    </div>
  );
}

function DashboardCard({ title, description, href }: { title: string; description: string; href: string }) {
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
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem', color: '#1e3a5f' }}>{title}</h3>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{description}</p>
    </a>
  );
}
