const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${json.error || json.message || 'Error en la solicitud'}`);
  return json.data as T;
}

// ── Health ────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  project: string;
  timestamp: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<HealthResponse>;
}

// ── Students ──────────────────────────────────────────────────────────────────

export interface StudentDTO {
  id: string;
  name: string;
  email: string;
  driveFolder?: string;
  sheetId?: string;
  sheetUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentPayload {
  name: string;
  email: string;
}

export function listStudents(): Promise<StudentDTO[]> {
  return request<StudentDTO[]>('/students', { cache: 'no-store' });
}

export function createStudent(payload: CreateStudentPayload): Promise<StudentDTO> {
  return request<StudentDTO>('/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Sheets ────────────────────────────────────────────────────────────────────

export function getSheetData(studentId: string): Promise<unknown[][]> {
  return request<unknown[][]>(`/sheets/${studentId}`);
}

// ── Reviews ───────────────────────────────────────────────────────────────────

export interface SubmitReviewPayload {
  studentId: string;
  spreadsheetId: string;
  documentText: string;
  documentUrl: string;
  entrega: string;
  reviewType: 'structural' | 'methodological' | 'full';
}

export function submitReview(payload: SubmitReviewPayload): Promise<unknown> {
  return request<unknown>('/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getStudentReviews(studentId: string): Promise<unknown[]> {
  return request<unknown[]>(`/reviews/student/${studentId}`);
}
