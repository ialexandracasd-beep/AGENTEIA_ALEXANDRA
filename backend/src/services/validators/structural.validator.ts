import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
});

export const reviewRequestSchema = z.object({
  studentId: z.string().uuid('ID de estudiante inválido'),
  documentUrl: z.string().url('URL del documento inválida'),
  documentText: z.string().min(100, 'El texto del documento es demasiado corto'),
  entrega: z.string().min(1, 'El nombre de la entrega es requerido'),
  reviewType: z.enum(['structural', 'methodological', 'full']),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type ReviewRequestInput = z.infer<typeof reviewRequestSchema>;
