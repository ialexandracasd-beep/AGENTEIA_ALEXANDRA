import { Router } from 'express';
import { submitReview, getStudentReviews } from '../controllers/review.controller';

const router = Router();

router.post('/', submitReview);
router.get('/student/:studentId', getStudentReviews);

export default router;
