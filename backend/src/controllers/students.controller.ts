import { Request, Response } from 'express';
import { createStudentFlow } from '../services/flows/create-student.flow';
import { getAllStudents, getStudentById } from '../services/supabase/supabase.service';
import { createStudentSchema } from '../services/validators/structural.validator';
import { sendSuccess, sendError, sendNotFound } from '../utils/response';

export async function listStudents(req: Request, res: Response) {
  try {
    const students = await getAllStudents();
    sendSuccess(res, students);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

export async function getStudent(req: Request, res: Response) {
  try {
    const student = await getStudentById(req.params.id);
    if (!student) return sendNotFound(res, 'Estudiante');
    sendSuccess(res, student);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}

export async function createStudent(req: Request, res: Response) {
  try {
    const parsed = createStudentSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, parsed.error.message, 400);

    const student = await createStudentFlow(parsed.data);
    sendSuccess(res, student, 201);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
}
