'use client';

import { useState, type ChangeEvent, type FormEvent, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { createStudent, type CreateStudentPayload } from '@/lib/api';

export default function CreateStudentForm() {
  const router = useRouter();
  const [form, setForm] = useState<CreateStudentPayload>({ nombre: '', correo_institucional: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createStudent(form);
      setSuccess(true);
      setForm({ nombre: '', correo_institucional: '' });
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.heading}>Nuevo estudiante</h2>

      <label style={styles.label}>
        Nombre completo
        <input
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder="Ej. María García"
          style={styles.input}
        />
      </label>

      <label style={styles.label}>
        Correo institucional
        <input
          name="correo_institucional"
          type="email"
          value={form.correo_institucional}
          onChange={handleChange}
          required
          disabled={loading}
          placeholder="Ej. maria@universidad.edu"
          style={styles.input}
        />
      </label>

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Creando…' : 'Crear estudiante'}
      </button>

      {success && <p style={styles.success}>Estudiante creado correctamente.</p>}
      {error && <p style={styles.error}>Error: {error}</p>}
    </form>
  );
}

const styles: Record<string, CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxWidth: '400px',
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '2rem',
    background: '#f8fafc',
  },
  heading: { margin: 0, fontSize: '1.1rem', fontWeight: 600 },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  },
  button: {
    padding: '0.5rem 1rem',
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    alignSelf: 'flex-start',
  },
  success: { margin: 0, color: '#16a34a', fontSize: '0.875rem' },
  error: { margin: 0, color: '#dc2626', fontSize: '0.875rem' },
};
