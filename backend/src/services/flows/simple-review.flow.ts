import { runStructuralReview, runMethodologicalReview } from '../ai/gemini.service';
import { saveStructuralReview, saveAiReview } from '../supabase/supabase.service';
import { StructuralResult, MethodologicalResult, ReviewType } from '../../types/review.types';

export interface SimpleReviewInput {
  studentId: string;
  documentText: string;
  reviewType: ReviewType;
  documentUrl?: string;
}

export interface SimpleReviewResult {
  structural?: StructuralResult;
  methodological?: MethodologicalResult;
}

// Flow de revisión sin dependencia de Google Sheets.
// Ejecuta Gemini según reviewType y persiste en ai_reviews / structure_reviews.
export async function simpleReviewFlow(input: SimpleReviewInput): Promise<SimpleReviewResult> {
  const { studentId, documentText, reviewType, documentUrl = '' } = input;
  const result: SimpleReviewResult = {};

  if (reviewType === 'structural' || reviewType === 'full') {
    result.structural = await runStructuralReview(documentText);
    await saveStructuralReview(studentId, result.structural);
  }

  if (reviewType === 'methodological' || reviewType === 'full') {
    result.methodological = await runMethodologicalReview(documentText);
    await saveAiReview(
      studentId,
      reviewType === 'full' ? 'full' : 'methodological',
      result.methodological,
      documentUrl,
    );
  }

  return result;
}
