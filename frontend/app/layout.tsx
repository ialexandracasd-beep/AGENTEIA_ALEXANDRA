import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AgenteIA Alexandra',
  description: 'Panel de gestión y revisión metodológica para estudiantes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0, background: '#f8fafc' }}>
        <header style={{ background: '#1e3a5f', color: 'white', padding: '1rem 2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.4rem' }}>AgenteIA Alexandra</h1>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
            Sistema de revisión metodológica
          </p>
        </header>
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
