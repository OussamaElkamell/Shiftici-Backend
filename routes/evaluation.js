import express from 'express';
import { getAverageRating, getComments, submitEvaluation } from '../controllers/evaluation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Route to submit an evaluation

router.post('/submit', submitEvaluation,verifyToken(["medecin", "structure"]));
router.get('/average/:evaluateeId', getAverageRating);
router.get('/:evaluateeId/comments',getComments);

export default router;
