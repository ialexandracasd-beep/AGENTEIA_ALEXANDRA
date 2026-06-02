import type { CSSProperties } from 'react';
import { getDashboardStats, type DashboardStats } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const stats: DashboardStats | null = await getDashboardStats().catch(() => null);

  const total     = stats?.totalStudents     ?? null;
  const withDrive = stats?.studentsWithDrive ?? null;
  const audits    = stats?.totalAudits       ?? null;
  const findings  = stats?.byStatus?.findings ?? null;

  const auditPct = (audits !== null && withDrive !== null && withDrive > 0)
    ? Math.min(100, Math.round((audits / withDrive) * 100))
    : null;

  return (
    <>
      <style>{`
        .hero-inner   { display: flex; gap: 2.5rem; align-items: center; }
        .hero-right   { flex-shrink: 0; width: 264px; }
        .modules-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; }
        .dev-stack    { display: flex; flex-direction: column; gap: 1.25rem; height: 100%; }
        @media (max-width: 860px) {
          .hero-right   { display: none; }
          .modules-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={S.hero}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(59,130,246,0.15) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(99,102,241,0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />

        <div className="hero-inner" style={{ position: 'relative', zIndex: 1 }}>
          {/* Left: copy */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={S.heroPill}>Para docentes universitarias · IA aplicada a la metodología</span>
            <h1 style={S.heroTitle}>
              De la carpeta de Drive al hallazgo, en segundos
            </h1>
            <p style={S.heroSub}>
              AgenteIA Alexandra automatiza la auditoría de entregas, detecta carpetas incompletas y
              prepara el camino hacia revisiones de contenido con IA — todo sin cambiar tu flujo de trabajo.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a href="/students" style={S.ctaPrimary}>
                Abrir módulo de Estudiantes →
              </a>
              <a href="#modules" style={S.ctaSecondary}>
                Explorar módulos
              </a>
            </div>
          </div>

          {/* Right: live stats card */}
          <div className="hero-right">
            <div style={S.heroCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Vista general</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: '#4ade80' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  En vivo
                </span>
              </div>

              {[
                { label: 'Estudiantes totales', value: total,     color: '#93c5fd' },
                { label: 'Con carpeta Drive',   value: withDrive, color: '#86efac' },
                { label: 'Auditados',           value: audits,    color: '#c4b5fd' },
                { label: 'Con hallazgos',       value: findings,  color: '#fcd34d' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color }}>
                    {value !== null ? value.toLocaleString('es-MX') : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                  </span>
                </div>
              ))}

              {auditPct !== null && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Cobertura de auditoría</span>
                    <span style={{ fontWeight: 700, color: '#93c5fd' }}>{auditPct}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${auditPct}%`, background: 'linear-gradient(90deg, #3b82f6, #93c5fd)', borderRadius: '9999px' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
          <KpiCard value={total}     label="Estudiantes"          sub="Total registrados"       color="#1d4ed8" bg="#eff6ff" icon={iconPeople}  />
          <KpiCard value={withDrive} label="Carpetas Drive"       sub="Listas para auditar"     color="#15803d" bg="#f0fdf4" icon={iconFolder}  />
          <KpiCard value={audits}    label="Auditorías"           sub="Realizadas en total"     color="#6d28d9" bg="#f5f3ff" icon={iconCheck}   />
          <KpiCard value={findings}  label="Con hallazgos"        sub="Requieren revisión"      color="#b45309" bg="#fffbeb" icon={iconWarning} />
        </div>
      </section>

      {/* ── Modules ───────────────────────────────────────────────────────── */}
      <section id="modules" style={{ marginBottom: '2.5rem' }}>
        <div style={S.sectionRow}>
          <div>
            <h2 style={S.sectionTitle}>Módulos del sistema</h2>
            <p style={S.sectionSub}>El módulo de Estudiantes está activo. Los demás llegarán pronto.</p>
          </div>
        </div>

        <div className="modules-grid">
          {/* Estudiantes — protagonista */}
          <div style={{ ...S.card, borderTop: '3px solid #1d4ed8' }}>
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                  {iconPeopleLg}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px', background: '#dcfce7', color: '#166534', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  Activo
                </span>
              </div>

              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Gestión de Estudiantes</h3>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                El corazón del sistema. Organiza tu base de estudiantes, audita en lote sus carpetas de Drive
                y detecta quién tiene entregas completas y quién necesita atención.
              </p>

              <ul style={{ margin: '0 0 1.5rem', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                {[
                  'Auditoría masiva de carpetas de Google Drive',
                  'Detección automática de hallazgos por estudiante',
                  'Seguimiento del estado de entrega en tiempo real',
                ].map(b => (
                  <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#334155' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      {iconCheckXs}
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              {(total !== null || withDrive !== null) && (
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {total !== null && <MiniStat value={total} label="estudiantes" />}
                  {withDrive !== null && <MiniStat value={withDrive} label="con Drive" />}
                  {audits !== null && <MiniStat value={audits} label="auditados" />}
                </div>
              )}

              <a href="/students" style={S.btnPrimary}>
                Abrir módulo de Estudiantes →
              </a>
            </div>
          </div>

          {/* Dev modules — secondary stack */}
          <div className="dev-stack">
            <DevModuleCard
              icon={iconReview}
              title="Revisiones de contenido"
              description="Análisis IA de estructura, coherencia y metodología de cada trabajo."
              href="/reviews"
              color="#7c3aed"
              roadmap={['Resumen automático', 'Análisis estructural', 'Retroalimentación IA']}
            />
            <DevModuleCard
              icon={iconReport}
              title="Reportes de avance"
              description="Vista agregada del grupo: entregas completas, riesgos y tendencias."
              href="/reports"
              color="#0f766e"
              roadmap={['Estudiantes en riesgo', 'Comparativa de grupos', 'Exportar a PDF']}
            />
          </div>
        </div>
      </section>

      {/* ── Recent Activity ───────────────────────────────────────────────── */}
      <section style={{ marginBottom: '1rem' }}>
        <div style={S.sectionRow}>
          <div>
            <h2 style={S.sectionTitle}>Actividad reciente</h2>
            <p style={S.sectionSub}>Últimas auditorías de carpetas de Drive</p>
          </div>
          <a href="/students" style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Ver todas →
          </a>
        </div>

        <div style={S.card}>
          {stats?.recentAudits && stats.recentAudits.length > 0 ? (
            stats.recentAudits.map((a, i) => (
              <div key={i} className="activity-row" style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.875rem 1.25rem',
                borderBottom: i < stats.recentAudits.length - 1 ? '1px solid #f8fafc' : 'none',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'white',
                }}>
                  {a.studentName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.studentName}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                    {a.fileCount} archivo{a.fileCount !== 1 ? 's' : ''} encontrados
                  </p>
                </div>
                <span style={{ ...S.badge, ...STATUS_STYLE[a.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.empty }}>
                  {STATUS_LABEL[a.status as keyof typeof STATUS_LABEL] ?? a.status}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1', flexShrink: 0, minWidth: '64px', textAlign: 'right' }}>
                  {relativeTime(a.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                {iconAuditLg}
              </div>
              <p style={{ margin: '0 0 0.35rem', fontWeight: 700, fontSize: '0.95rem', color: '#374151' }}>
                Sin auditorías todavía
              </p>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#9ca3af', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>
                Cuando audites carpetas de Drive desde el módulo de Estudiantes, los resultados aparecerán aquí.
              </p>
              <a href="/students" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1.25rem', background: '#1d4ed8', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 700 }}>
                Empezar ahora →
              </a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({ value, label, sub, color, bg, icon }: {
  value: number | null; label: string; sub: string; color: string; bg: string; icon: React.ReactNode;
}) {
  return (
    <div className="kpi-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderTop: `3px solid ${color}` }}>
      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem', color }}>
        {icon}
      </div>
      <p style={{ margin: '0 0 0.15rem', fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {value !== null ? value.toLocaleString('es-MX') : <span style={{ fontSize: '1.4rem', color: '#d1d5db' }}>—</span>}
      </p>
      <p style={{ margin: '0 0 0.2rem', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '0.72rem', color: '#9ca3af' }}>{sub}</p>
    </div>
  );
}

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ padding: '0.5rem 0.875rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{value.toLocaleString('es-MX')}</div>
      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>{label}</div>
    </div>
  );
}

function DevModuleCard({ icon, title, description, href, color, roadmap }: {
  icon: React.ReactNode; title: string; description: string;
  href: string; color: string; roadmap: string[];
}) {
  return (
    <div className="module-card" style={{ ...S.card, borderTop: `3px solid ${color}`, flex: 1 }}>
      <div style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            {icon}
          </div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', background: '#fef9c3', color: '#a16207', borderRadius: '9999px' }}>
            Próximamente
          </span>
        </div>
        <h3 style={{ margin: '0 0 0.4rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.55 }}>{description}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          {roadmap.map(item => (
            <span key={item} style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#64748b' }}>
              {item}
            </span>
          ))}
        </div>
        <a href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.875rem', borderRadius: '8px', background: 'transparent', color: '#64748b', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600, border: '1px solid #e2e8f0' }}>
          Ver detalles →
        </a>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 2)  return 'ahora';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  return `${Math.floor(h / 24)} d`;
}

const STATUS_LABEL = { approved: 'Aprobado', findings: 'Con hallazgos', empty: 'Sin archivos' };
const STATUS_STYLE = {
  approved: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
  findings: { background: '#fffbeb', color: '#a16207', border: '1px solid #fde68a' },
  empty:    { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' },
};

// ── Icons (inline SVG) ────────────────────────────────────────────────────────

const _svg = (d: string, w = 20) => (
  <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
);

const iconPeople  = _svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>');
const iconPeopleLg = _svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>', 24);
const iconFolder  = _svg('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>');
const iconCheck   = _svg('<polyline points="20 6 9 17 4 12"/>');
const iconCheckXs = _svg('<polyline points="20 6 9 17 4 12"/>', 10);
const iconWarning = _svg('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>');
const iconReview  = _svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>');
const iconReport  = _svg('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>');
const iconAuditLg = _svg('<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>', 24);

// ── Style tokens ──────────────────────────────────────────────────────────────

const S: Record<string, CSSProperties> = {
  hero: {
    background: 'linear-gradient(160deg, #0b1d38 0%, #0f2a52 50%, #1a3a72 100%)',
    borderRadius: '16px', padding: '3.25rem 3rem', color: 'white',
    marginBottom: '2rem', position: 'relative', overflow: 'hidden',
  },
  heroPill: {
    display: 'inline-block', marginBottom: '1rem',
    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#93c5fd',
    background: 'rgba(147,197,253,0.12)', padding: '4px 12px',
    borderRadius: '9999px', border: '1px solid rgba(147,197,253,0.2)',
  },
  heroTitle: {
    fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)', fontWeight: 900,
    margin: '0 0 1rem', lineHeight: 1.15, letterSpacing: '-0.03em',
  },
  heroSub: {
    margin: '0 0 2rem', color: '#94a3b8', lineHeight: 1.7,
    fontSize: '0.95rem', maxWidth: '460px',
  },
  ctaPrimary: {
    display: 'inline-block', padding: '0.75rem 1.625rem',
    background: '#2563eb', color: 'white', borderRadius: '9px',
    textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
    boxShadow: '0 4px 14px rgba(37,99,235,0.45)',
  },
  ctaSecondary: {
    display: 'inline-block', padding: '0.75rem 1.5rem',
    background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)',
    borderRadius: '9px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  heroCard: {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px', padding: '1.25rem',
  },
  card: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  },
  btnPrimary: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '0.4rem', padding: '0.8rem 1.5rem', borderRadius: '10px',
    background: '#1d4ed8', color: '#fff', textDecoration: 'none',
    fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(29,78,216,0.3)',
  },
  badge: {
    display: 'inline-block', padding: '3px 9px', borderRadius: '9999px',
    fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
  },
  sectionRow: {
    display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
    gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem',
  },
  sectionTitle: { margin: '0 0 0.2rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' },
  sectionSub:   { margin: 0, fontSize: '0.825rem', color: '#94a3b8' },
};
