import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

export const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.get('/profile', getProfile);
userRoutes.put('/profile', updateProfile);
