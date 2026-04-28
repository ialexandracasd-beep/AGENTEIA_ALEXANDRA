import { Router } from 'express';
import { listStudents, getStudent, createStudent } from '../controllers/students.controller';

const router = Router();

router.get('/', listStudents);
router.get('/:id', getStudent);
router.post('/', createStudent);

export default router;
