import { Router } from 'express';
import { listAllReviews, submitReview, triggerSimpleReview, getStudentReviews } from '../controllers/review.controller';

const router = Router();

router.get('/', listAllReviews);
router.post('/', submitReview);
router.post('/simple', triggerSimpleReview);
router.get('/student/:studentId', getStudentReviews);

export default router;
