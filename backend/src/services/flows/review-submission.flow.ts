import { runStructuralReview, runMethodologicalReview } from '../ai/gemini.service';
import { saveStructuralReview, saveAiReview } from '../supabase/supabase.service';
import { appendReviewRow } from '../google/sheets.service';
import { ReviewType } from '../../types/review.types';
import { logger } from '../../utils/logger';

interface ReviewSubmissionParams {
  studentId: string;
  spreadsheetId: string;
  documentText: string;
  documentUrl: string;
  entrega: string;
  reviewType: ReviewType;
}

export async function reviewSubmissionFlow(params: ReviewSubmissionParams) {
  const { studentId, spreadsheetId, documentText, documentUrl, entrega, reviewType } = params;
  logger.info(`Starting review flow for student ${studentId}, type: ${reviewType}`);

  let structural;
  let methodological;

  if (reviewType === 'structural' || reviewType === 'full') {
    structural = await runStructuralReview(documentText);
    await saveStructuralReview(studentId, structural);
  }

  if (reviewType === 'methodological' || reviewType === 'full') {
    methodological = await runMethodologicalReview(documentText);
    await saveAiReview(studentId, reviewType, methodological, documentUrl);
  }

  await appendReviewRow(spreadsheetId, {
    entrega,
    fecha: new Date().toLocaleDateString('es-CO'),
    titulo: entrega,
    linkDocumento: documentUrl,
    estadoEstructural: structural ? `${structural.score}/100` : 'N/A',
    estadoMetodologico: methodological ? `${methodological.overallScore}/100` : 'N/A',
    puntaje: methodological?.overallScore ?? structural?.score ?? 0,
    observaciones: methodological?.feedback ?? structural?.observations ?? '',
  });

  logger.info(`Review flow complete for student ${studentId}`);
  return { studentId, reviewType, structural, methodological, status: 'completed' as const };
}
