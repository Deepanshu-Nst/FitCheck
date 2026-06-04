import { Router } from 'express';
import { getSubmissions, reviewSubmission } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireAdmin);
adminRoutes.get('/submissions', getSubmissions);
adminRoutes.patch('/review/:id', reviewSubmission);
