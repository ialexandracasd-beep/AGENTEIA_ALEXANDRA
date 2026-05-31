import { checkHealth, type HealthResponse } from '@/lib/api';

export default async function HealthTestPage() {
  let data: HealthResponse | null = null;
  let error: string | null = null;

  try {
    data = await checkHealth();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error desconocido';
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>Health Check — Backend</h1>
      {error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '6px' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </main>
  );
}
