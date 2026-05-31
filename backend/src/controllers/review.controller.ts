import { Request, Response } from 'express';
import { reviewSubmissionFlow } from '../services/flows/review-submission.flow';
import { getReviewsByStudent } from '../services/supabase/supabase.service';
import { getStudentById } from '../services/supabase/supabase.service';
import { reviewRequestSchema } from '../services/validators/structural.validator';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';

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

export async function getStudentReviews(req: Request, res: Response) {
  try {
    const reviews = await getReviewsByStudent(req.params.studentId);
    sendSuccess(res, reviews);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}
