const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error en la solicitud');
  return json.data as T;
}

export const api = {
  getStudents: () => request<unknown[]>('/students'),
  getStudent: (id: string) => request<unknown>(`/students/${id}`),
  createStudent: (body: { name: string; email: string }) =>
    request<unknown>('/students', { method: 'POST', body: JSON.stringify(body) }),

  getSheetData: (studentId: string) =>
    request<unknown[][]>(`/sheets/${studentId}`),

  submitReview: (body: {
    studentId: string;
    spreadsheetId: string;
    documentText: string;
    documentUrl: string;
    entrega: string;
    reviewType: 'structural' | 'methodological' | 'full';
  }) => request<unknown>('/reviews', { method: 'POST', body: JSON.stringify(body) }),

  getStudentReviews: (studentId: string) =>
    request<unknown[]>(`/reviews/student/${studentId}`),
};
