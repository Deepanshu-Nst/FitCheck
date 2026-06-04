import { Router } from 'express';
import { generateFeedback, getFeedback } from '../controllers/feedbackController';
import { authenticate } from '../middleware/authMiddleware';

export const feedbackRoutes = Router();

feedbackRoutes.use(authenticate);
feedbackRoutes.post('/generate', generateFeedback);
feedbackRoutes.get('/:outfitId', getFeedback);
