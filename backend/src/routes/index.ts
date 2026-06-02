import { Router } from 'express';
import studentsRouter from './students.routes';
import sheetsRouter from './sheets.routes';
import reviewRouter from './review.routes';
import dashboardRouter from './dashboard.routes';

const router = Router();

router.use('/students', studentsRouter);
router.use('/sheets', sheetsRouter);
router.use('/reviews', reviewRouter);
router.use('/dashboard', dashboardRouter);

export default router;
