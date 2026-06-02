import type { CSSProperties } from 'react';
import { getDashboardStats, type DashboardStats } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const stats: DashboardStats | null = await getDashboardStats().catch(() => null);

  const total    = stats?.totalStudents    ?? null;
  const withDrive = stats?.studentsWithDrive ?? null;
  const audits   = stats?.totalAudits      ?? null;
  const findings = stats?.byStatus?.findings ?? null;

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={heroStyle}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: 120, width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '580px' }}>
          <span style={heroPillStyle}>Sistema educativo · IA aplicada</span>
          <h1 style={heroTitleStyle}>
            Supervisa entregas y detecta<br />hallazgos en minutos
          </h1>
          <p style={heroSubStyle}>
            AgenteIA Alexandra ayuda a la docente a auditar carpetas de Drive,
            organizar evidencias y preparar futuras revisiones metodológicas con IA.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a href="/students" className="cta-btn" style={ctaPrimaryStyle}>
              Ir a Estudiantes →
            </a>
            <a href="#modules" className="cta-btn" style={ctaSecondaryStyle}>
              Ver módulos
            </a>
          </div>
        </div>
      </section>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <KpiCard
            icon={iconPeople}
            value={total}
            label="Estudiantes registrados"
            color="#2563eb"
            bg="#eff6ff"
          />
          <KpiCard
            icon={iconFolder}
            value={withDrive}
            label="Con carpeta Drive"
            color="#16a34a"
            bg="#f0fdf4"
          />
          <KpiCard
            icon={iconCheck}
            value={audits}
            label="Auditorías realizadas"
            color="#7c3aed"
            bg="#f5f3ff"
          />
          <KpiCard
            icon={iconWarning}
            value={findings}
            label="Con hallazgos"
            color="#d97706"
            bg="#fffbeb"
          />
        </div>
      </section>

      {/* ── Modules ───────────────────────────────────────────────────────── */}
      <section id="modules" style={{ marginBottom: '2.5rem' }}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>Módulos del sistema</h2>
          <p style={sectionSubStyle}>Accede a las funcionalidades disponibles o conoce lo que viene.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <ModuleCard
            icon={iconPeople}
            title="Estudiantes"
            description="Gestiona la base de estudiantes, audita en lote sus carpetas de Drive y visualiza el estado de cada entrega."
            href="/students"
            status="active"
            cta="Entrar al módulo"
            color="#1e40af"
            bg="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
            stats={total !== null ? `${total} estudiantes · ${withDrive ?? 0} carpetas` : undefined}
          />
          <ModuleCard
            icon={iconReview}
            title="Revisiones"
            description="Revisión de contenido con IA: análisis de estructura, coherencia argumentativa y rigurosidad metodológica."
            href="/reviews"
            status="dev"
            cta="Explorar roadmap"
            color="#7c3aed"
            bg="linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)"
          />
          <ModuleCard
            icon={iconReport}
            title="Reportes"
            description="Resumen de avance del grupo: entregas completas, estudiantes en riesgo y tendencias por período académico."
            href="/reports"
            status="dev"
            cta="Explorar roadmap"
            color="#0f766e"
            bg="linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)"
          />
        </div>
      </section>

      {/* ── Recent Activity ───────────────────────────────────────────────── */}
      <section style={{ marginBottom: '1rem' }}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>Actividad reciente</h2>
          <a href="/students" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none' }}>
            Ver todas →
          </a>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {stats?.recentAudits && stats.recentAudits.length > 0 ? (
            <>
              {stats.recentAudits.map((a, i) => (
                <div
                  key={i}
                  className="activity-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.875rem 1.25rem',
                    borderBottom: i < stats.recentAudits.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: '#f1f5f9', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}>
                    {iconAudit}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.studentName}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      Auditoría de Drive · {a.fileCount} archivo{a.fileCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span style={{ ...auditBadgeStyle, ...AUDIT_STATUS_STYLE[a.status as keyof typeof AUDIT_STATUS_STYLE] ?? AUDIT_STATUS_STYLE.empty }}>
                    {AUDIT_STATUS_LABEL[a.status as keyof typeof AUDIT_STATUS_LABEL] ?? a.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {formatRelativeTime(a.createdAt)}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>📋</div>
              <p style={{ margin: '0 0 0.4rem', fontWeight: 600, color: '#475569' }}>Sin actividad reciente</p>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                Las auditorías de carpetas aparecerán aquí una vez que empieces a trabajar.
              </p>
              <a href="/students" style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                Ir a Estudiantes y auditar →
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ icon, value, label, color, bg }: {
  icon: React.ReactNode;
  value: number | null;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="kpi-card" style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px',
      padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: bg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: '0.875rem', color,
      }}>
        {icon}
      </div>
      <p style={{ margin: '0 0 0.2rem', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
        {value !== null ? value.toLocaleString('es-MX') : <span style={{ fontSize: '1.25rem', color: '#94a3b8' }}>—</span>}
      </p>
      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{label}</p>
    </div>
  );
}

function ModuleCard({ icon, title, description, href, status, cta, color, bg, stats }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  status: 'active' | 'dev';
  cta: string;
  color: string;
  bg: string;
  stats?: string;
}) {
  return (
    <div className="module-card" style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px',
      overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Colored top strip */}
      <div style={{ height: '4px', background: color }} />

      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: bg, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color,
          }}>
            {icon}
          </div>
          <span style={status === 'active' ? activeBadgeStyle : devBadgeStyle}>
            {status === 'active' ? 'Activo' : 'En desarrollo'}
          </span>
        </div>

        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        <p style={{ margin: '0 0 0.875rem', fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, flex: 1 }}>
          {description}
        </p>

        {stats && (
          <p style={{ margin: '0 0 0.875rem', fontSize: '0.75rem', color: color, fontWeight: 600, background: bg, padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
            {stats}
          </p>
        )}

        <a href={href} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          padding: '0.55rem 1.125rem', borderRadius: '8px',
          background: status === 'active' ? color : '#f1f5f9',
          color: status === 'active' ? '#fff' : '#475569',
          textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
          alignSelf: 'flex-start',
        }}>
          {cta}
          {status === 'active' && <span style={{ opacity: 0.85 }}>→</span>}
        </a>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} d`;
}

const AUDIT_STATUS_LABEL = { approved: 'Aprobado', findings: 'Con hallazgos', empty: 'Sin archivos' };
const AUDIT_STATUS_STYLE = {
  approved: { background: '#dcfce7', color: '#15803d' },
  findings: { background: '#fef9c3', color: '#a16207' },
  empty:    { background: '#f1f5f9', color: '#64748b' },
};

// ── Inline SVG icons ──────────────────────────────────────────────────────────

const iconPeople = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const iconFolder = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);
const iconCheck = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const iconWarning = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const iconReview = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const iconReport = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);
const iconAudit = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const heroStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #0c1f3d 0%, #1e40af 60%, #1d4ed8 100%)',
  borderRadius: '16px',
  padding: '3.5rem 3rem',
  color: 'white',
  marginBottom: '2rem',
  position: 'relative',
  overflow: 'hidden',
};

const heroPillStyle: CSSProperties = {
  display: 'inline-block', marginBottom: '1rem',
  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#93c5fd',
  background: 'rgba(147,197,253,0.15)', padding: '4px 12px', borderRadius: '9999px',
  border: '1px solid rgba(147,197,253,0.25)',
};

const heroTitleStyle: CSSProperties = {
  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800,
  margin: '0 0 1rem', lineHeight: 1.2, letterSpacing: '-0.02em',
};

const heroSubStyle: CSSProperties = {
  margin: '0 0 2rem', color: '#bfdbfe',
  lineHeight: 1.65, fontSize: '1rem', maxWidth: '480px',
};

const ctaPrimaryStyle: CSSProperties = {
  display: 'inline-block', padding: '0.7rem 1.5rem',
  background: '#3b82f6', color: 'white', borderRadius: '8px',
  textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
  boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
};

const ctaSecondaryStyle: CSSProperties = {
  display: 'inline-block', padding: '0.7rem 1.5rem',
  background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px',
  textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
  border: '1px solid rgba(255,255,255,0.2)',
};

const sectionHeaderStyle: CSSProperties = { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' };
const sectionTitleStyle: CSSProperties = { margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' };
const sectionSubStyle:  CSSProperties = { margin: 0, fontSize: '0.875rem', color: '#64748b' };

const auditBadgeStyle: CSSProperties = {
  display: 'inline-block', padding: '3px 10px',
  borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 600, flexShrink: 0,
};

const activeBadgeStyle: CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px',
  background: '#dcfce7', color: '#15803d', borderRadius: '9999px', flexShrink: 0,
};

const devBadgeStyle: CSSProperties = {
  fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px',
  background: '#fef9c3', color: '#a16207', borderRadius: '9999px', flexShrink: 0,
};
