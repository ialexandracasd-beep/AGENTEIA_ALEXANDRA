import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgenteIA Alexandra',
  description: 'Panel de gestión y revisión metodológica para estudiantes',
};

const NAV_LINKS = [
  { label: 'Estudiantes', href: '/students' },
  { label: 'Revisiones', href: '/reviews' },
  { label: 'Reportes', href: '/reports' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <style>{`
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; background: #f0f4f8; }
          .nav-link { color: rgba(255,255,255,0.7); text-decoration: none; padding: 0.4rem 0.875rem; border-radius: 6px; font-size: 0.875rem; font-weight: 500; transition: color 0.15s, background 0.15s; }
          .nav-link:hover { color: #fff; background: rgba(255,255,255,0.12); }
          .nav-desktop { display: flex; gap: 0.125rem; align-items: center; margin-left: auto; }
          .module-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
          .module-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,36,68,0.14) !important; }
          .kpi-card { transition: box-shadow 0.15s ease; }
          .kpi-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important; }
          .cta-btn { transition: filter 0.15s ease, transform 0.1s ease; }
          .cta-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
          .activity-row:hover { background: #f8fafc; }
          @media (max-width: 600px) {
            .nav-desktop { display: none !important; }
            main { padding: 1.25rem !important; }
          }
        `}</style>
      </head>
      <body>
        <header style={{
          background: 'linear-gradient(135deg, #0c1f3d 0%, #1e3a5f 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          color: 'white',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{
            maxWidth: '1200px', margin: '0 auto', padding: '0 2rem',
            display: 'flex', alignItems: 'center', height: '60px', gap: '2rem',
          }}>
            <a href="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>AgenteIA Alexandra</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 500, opacity: 0.5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Beta
              </span>
            </a>
            <nav className="nav-desktop">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={href} href={href} className="nav-link">{label}</a>
              ))}
            </nav>
          </div>
        </header>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
