import { Router } from 'express';
import { getStudentSheetData } from '../controllers/sheets.controller';

const router = Router();

router.get('/:studentId', getStudentSheetData);

export default router;
