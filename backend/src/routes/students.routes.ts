import { Router } from 'express';
import { listStudents, getStudent, createStudent } from '../controllers/students.controller';
import { runStudentAudit, getStudentAudit } from '../controllers/audit.controller';

const router = Router();

router.get('/', listStudents);
router.get('/:id', getStudent);
router.post('/', createStudent);
router.post('/:id/audit', runStudentAudit);
router.get('/:id/audit', getStudentAudit);

export default router;
