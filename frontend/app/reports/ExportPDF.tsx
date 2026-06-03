'use client';

export default function ExportPDF() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print"
      style={{
        padding: '0.55rem 1.25rem',
        background: '#0f172a',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
        <rect x="6" y="14" width="12" height="8"/>
      </svg>
      Exportar PDF
    </button>
  );
}
