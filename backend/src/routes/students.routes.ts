import { Router } from 'express';
import { listStudents, getStudent, createStudent } from '../controllers/students.controller';
import { runStudentAudit } from '../controllers/audit.controller';

const router = Router();

router.get('/', listStudents);
router.get('/:id', getStudent);
router.post('/', createStudent);
router.post('/:id/audit', runStudentAudit);

export default router;
