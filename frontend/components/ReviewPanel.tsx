'use client';
import { useState } from 'react';
import { api } from '../lib/api';

interface ReviewPanelProps {
  studentId: string;
  spreadsheetId: string;
}

export default function ReviewPanel({ studentId, spreadsheetId }: ReviewPanelProps) {
  const [documentText, setDocumentText] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [entrega, setEntrega] = useState('');
  const [reviewType, setReviewType] = useState<'structural' | 'methodological' | 'full'>('full');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.submitReview({ studentId, spreadsheetId, documentText, documentUrl, entrega, reviewType });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Nombre de entrega</label>
        <input
          value={entrega}
          onChange={e => setEntrega(e.target.value)}
          placeholder="Ej: Entrega 1 - Anteproyecto"
          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>URL del documento</label>
        <input
          value={documentUrl}
          onChange={e => setDocumentUrl(e.target.value)}
          placeholder="https://docs.google.com/..."
          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Tipo de revisión</label>
        <select
          value={reviewType}
          onChange={e => setReviewType(e.target.value as typeof reviewType)}
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
        >
          <option value="full">Completa (estructural + metodológica)</option>
          <option value="structural">Solo estructural</option>
          <option value="methodological">Solo metodológica</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem' }}>Texto del documento</label>
        <textarea
          value={documentText}
          onChange={e => setDocumentText(e.target.value)}
          rows={8}
          placeholder="Pegar el texto completo del documento aquí..."
          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        style={{ padding: '0.75rem', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
      >
        {loading ? 'Procesando...' : 'Enviar a revisión'}
      </button>
      {result && (
        <pre style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '6px', overflow: 'auto', fontSize: '0.8rem' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </form>
  );
}
