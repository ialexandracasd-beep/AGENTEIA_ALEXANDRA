import { Request, Response } from 'express';
import { z } from 'zod';
import { reviewSubmissionFlow } from '../services/flows/review-submission.flow';
import { simpleReviewFlow } from '../services/flows/simple-review.flow';
import { getAllReviews, getReviewsByStudent, getStudentById } from '../services/supabase/supabase.service';
import { reviewRequestSchema } from '../services/validators/structural.validator';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';

export async function listAllReviews(req: Request, res: Response) {
  try {
    const reviews = await getAllReviews();
    sendSuccess(res, reviews);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

export async function submitReview(req: Request, res: Response) {
  try {
    const parsed = reviewRequestSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.message, 400);

    const student = await getStudentById(parsed.data.studentId);
    if (!student) return sendNotFound(res, 'Estudiante');
    if (!student.sheet_id) return sendError(res, 'El estudiante no tiene sheet asignado', 400);

    const review = await reviewSubmissionFlow({
      ...parsed.data,
      spreadsheetId: student.sheet_id,
    });

    sendSuccess(res, review, 201);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

const simpleReviewSchema = z.object({
  studentId:    z.string().uuid('studentId debe ser un UUID válido'),
  documentText: z.string().min(100, 'El texto del documento es demasiado corto (mínimo 100 caracteres)'),
  reviewType:   z.enum(['structural', 'methodological', 'full']),
  documentUrl:  z.string().url().optional(),
});

export async function triggerSimpleReview(req: Request, res: Response) {
  try {
    const parsed = simpleReviewSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.message, 400);

    const student = await getStudentById(parsed.data.studentId);
    if (!student) return sendNotFound(res, 'Estudiante');

    const result = await simpleReviewFlow({
      studentId:    parsed.data.studentId,
      documentText: parsed.data.documentText,
      reviewType:   parsed.data.reviewType,
      documentUrl:  parsed.data.documentUrl,
    });

    sendSuccess(res, result, 201);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

export async function getStudentReviews(req: Request, res: Response) {
  try {
    const reviews = await getReviewsByStudent(req.params.studentId);
    sendSuccess(res, reviews);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}
