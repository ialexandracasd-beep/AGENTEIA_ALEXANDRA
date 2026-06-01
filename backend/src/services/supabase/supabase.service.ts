import { supabaseAdmin as supabase } from '../../config/supabase';
import { Student, CreateStudentDto } from '../../types/student.types';
import { StructuralResult, MethodologicalResult, ReviewResult, ReviewType } from '../../types/review.types';

// ── Students ──────────────────────────────────────────────────────────────────

export async function createStudent(
  dto: CreateStudentDto & { drive_folder_id?: string; sheet_id?: string; sheet_url?: string }
): Promise<Student> {
  const { data, error } = await supabase
    .from('students')
    .insert({
      nombre: dto.nombre,
      correo_institucional: dto.correo_institucional,
      nombre_mama: dto.nombre_mama ?? null,
      correo_mama: dto.correo_mama ?? null,
      nombre_papa: dto.nombre_papa ?? null,
      correo_papa: dto.correo_papa ?? null,
      id_drive: dto.id_drive ?? null,
      drive_folder_id: dto.drive_folder_id ?? null,
      sheet_id: dto.sheet_id ?? null,
      sheet_url: dto.sheet_url ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Student;
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Student;
}

export async function getAllStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('nombre');

  if (error) throw new Error(error.message);
  return (data ?? []) as Student[];
}

export async function updateStudentSheet(
  studentId: string,
  sheetId: string,
  folderId: string,
  sheetUrl?: string
) {
  const { error } = await supabase
    .from('students')
    .update({ sheet_id: sheetId, drive_folder_id: folderId, sheet_url: sheetUrl ?? null })
    .eq('id', studentId);

  if (error) throw new Error(error.message);
}

// ── Structure Reviews ─────────────────────────────────────────────────────────

export async function saveStructuralReview(
  studentId: string,
  result: StructuralResult,
  submissionId?: string
) {
  const { data, error } = await supabase
    .from('structure_reviews')
    .insert({
      student_id: studentId,
      submission_id: submissionId ?? null,
      has_title: result.hasTitle,
      has_abstract: result.hasAbstract,
      has_introduction: result.hasIntroduction,
      has_objectives: result.hasObjectives,
      has_methodology: result.hasMethodology,
      has_conclusions: result.hasConclusions,
      has_bibliography: result.hasBibliography,
      missing_elements: result.missingElements,
      score: result.score,
      observations: result.observations ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── AI Reviews ────────────────────────────────────────────────────────────────

export async function saveAiReview(
  studentId: string,
  reviewType: ReviewType,
  result: MethodologicalResult,
  documentUrl: string,
  submissionId?: string,
  rawResponse?: unknown
) {
  const { data, error } = await supabase
    .from('ai_reviews')
    .insert({
      student_id: studentId,
      submission_id: submissionId ?? null,
      review_type: reviewType,
      coherence_score: result.coherenceScore,
      objectives_aligned: result.objectivesAligned,
      methodology_justified: result.methodologyJustified,
      results_consistent: result.resultsConsistent,
      feedback: result.feedback,
      suggestions: result.suggestions,
      overall_score: result.overallScore,
      document_url: documentUrl,
      raw_response: rawResponse ?? null,
      status: 'completed',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getReviewsByStudent(studentId: string): Promise<ReviewResult[]> {
  const { data, error } = await supabase
    .from('ai_reviews')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    studentId: row.student_id as string,
    documentUrl: row.document_url as string,
    reviewType: row.review_type as ReviewType,
    methodological: {
      coherenceScore: row.coherence_score as number,
      objectivesAligned: row.objectives_aligned as boolean,
      methodologyJustified: row.methodology_justified as boolean,
      resultsConsistent: row.results_consistent as boolean,
      feedback: row.feedback as string,
      suggestions: row.suggestions as string[],
      overallScore: row.overall_score as number,
    },
    status: row.status as ReviewResult['status'],
    createdAt: row.created_at as string,
  }));
}
