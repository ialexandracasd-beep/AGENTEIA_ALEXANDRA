import { Response } from 'express';

export function sendSuccess<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res: Response, message: string, status = 500) {
  return res.status(status).json({ success: false, error: message });
}

export function sendNotFound(res: Response, resource = 'Recurso') {
  return sendError(res, `${resource} no encontrado`, 404);
}
