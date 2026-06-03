'use client';

import { useState, type ChangeEvent, type FormEvent, type CSSProperties } from 'react';
import { triggerSimpleReview, type StudentDTO, type SimpleReviewResult } from '@/lib/api';

interface Props {
  students: StudentDTO[];
  onDone: () => void;
}

export default function TriggerReview({ students, onDone }: Props) {
  const [open, setOpen]           = useState(false);
  const [studentId, setStudentId] = useState('');
  const [docText, setDocText]     = useState('');
  const [docUrl, setDocUrl]       = useState('');
  const [reviewType, setReviewType] = useState<'structural' | 'methodological' | 'full'>('full');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<SimpleReviewResult | null>(null);
  const [error, setError]         = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await triggerSimpleReview({
        studentId,
        documentText: docText,
        reviewType,
        documentUrl: docUrl || undefined,
      });
      setResult(res);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al generar la revisión');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={S.btnPrimary}>
        + Nueva revisión
      </button>
    );
  }

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={S.modalHeader}>
          <h2 style={S.modalTitle}>Nueva revisión de contenido</h2>
          <button onClick={() => setOpen(false)} style={S.btnClose} aria-label="Cerrar">✕</button>
        </div>

        {result ? (
          <div>
            <p style={{ color: '#15803d', fontWeight: 600, marginBottom: '1rem' }}>
              ✓ Revisión completada
            </p>
            {result.structural && (
              <p style={S.resultLine}>Puntaje estructural: <strong>{result.structural.score}/100</strong></p>
            )}
            {result.methodological && (
              <p style={S.resultLine}>Puntaje metodológico: <strong>{result.methodological.overallScore}/100</strong></p>
            )}
            {result.methodological?.feedback && (
              <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.75rem', lineHeight: 1.6 }}>
                {result.methodological.feedback}
              </p>
            )}
            <button onClick={() => { setOpen(false); setResult(null); setDocText(''); }} style={{ ...S.btnPrimary, marginTop: '1rem' }}>
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={S.form}>
            <label style={S.label}>
              Estudiante
              <select
                value={studentId}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setStudentId(e.target.value)}
                required
                style={S.select}
              >
                <option value="">— Seleccionar —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </label>

            <label style={S.label}>
              Tipo de revisión
              <select
                value={reviewType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setReviewType(e.target.value as typeof reviewType)
                }
                style={S.select}
              >
                <option value="full">Completa (estructural + metodológica)</option>
                <option value="structural">Solo estructural</option>
                <option value="methodological">Solo metodológica</option>
              </select>
            </label>

            <label style={S.label}>
              URL del documento (opcional)
              <input
                type="url"
                value={docUrl}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDocUrl(e.target.value)}
                placeholder="https://docs.google.com/..."
                style={S.input}
              />
            </label>

            <label style={S.label}>
              Texto del documento <span style={{ color: '#dc2626' }}>*</span>
              <textarea
                value={docText}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDocText(e.target.value)}
                required
                rows={8}
                placeholder="Pega aquí el texto completo del documento (mínimo 100 caracteres)…"
                style={S.textarea}
              />
            </label>

            {error && <p style={S.error}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" disabled={loading} style={loading ? { ...S.btnPrimary, opacity: 0.6 } : S.btnPrimary}>
                {loading ? 'Analizando con IA…' : 'Generar revisión'}
              </button>
              <button type="button" onClick={() => setOpen(false)} style={S.btnSecondary}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const S: Record<string, CSSProperties> = {
  btnPrimary:  { padding: '0.55rem 1.25rem', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700 },
  btnSecondary: { padding: '0.55rem 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 },
  btnClose:    { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#94a3b8', padding: '0.25rem' },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' },
  modal:       { background: '#fff', borderRadius: '14px', padding: '1.75rem', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle:  { margin: 0, fontSize: '1.1rem', fontWeight: 700 },
  form:        { display: 'flex', flexDirection: 'column', gap: '1rem' },
  label:       { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' },
  input:       { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit' },
  select:      { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit' },
  textarea:    { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical' },
  error:       { margin: 0, color: '#dc2626', fontSize: '0.8rem' },
  resultLine:  { margin: '0 0 0.25rem', fontSize: '0.875rem', color: '#374151' },
};
