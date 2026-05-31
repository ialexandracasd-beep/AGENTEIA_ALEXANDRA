const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE = `${BASE_URL}/api`;

// 9 s: keeps server-side fetches within Vercel hobby's 10 s function limit
const FETCH_TIMEOUT_MS = 9_000;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (controller.signal.aborted) {
      throw new Error(
        'El servidor no respondió a tiempo. Si es la primera visita del día, espera 30 segundos e intenta de nuevo.',
      );
    }
    throw new Error(
      `No se pudo conectar con el servidor: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  clearTimeout(timer);

  let json: { data?: T; error?: string; message?: string; success?: boolean };
  try {
    json = await res.json();
  } catch {
    throw new Error(`HTTP ${res.status}: La respuesta del servidor no es JSON válido`);
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${json.error || json.message || 'Error en la solicitud'}`);
  }
  return json.data as T;
}

// ── Health ────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  project: string;
  timestamp: string;
}

export async function checkHealth(): Promise<HealthResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<HealthResponse>;
  } catch (err) {
    clearTimeout(timer);
    if (controller.signal.aborted) throw new Error('Timeout al verificar el estado del servidor');
    throw err;
  }
}

// ── Students ──────────────────────────────────────────────────────────────────

export interface StudentDTO {
  id: string;
  nombre: string;
  correo_institucional: string;
  nombre_mama: string | null;
  correo_mama: string | null;
  nombre_papa: string | null;
  correo_papa: string | null;
  id_drive: string | null;
  drive_folder_id: string | null;
  sheet_id: string | null;
  sheet_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentPayload {
  nombre: string;
  correo_institucional: string;
  nombre_mama?: string | null;
  correo_mama?: string | null;
  nombre_papa?: string | null;
  correo_papa?: string | null;
  id_drive?: string | null;
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
