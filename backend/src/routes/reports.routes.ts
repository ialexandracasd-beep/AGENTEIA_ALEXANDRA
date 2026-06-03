import { Router } from 'express';
import { getReportsSummary } from '../controllers/reports.controller';

const router = Router();

router.get('/summary', getReportsSummary);

export default router;
