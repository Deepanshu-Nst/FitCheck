import { Router } from 'express';
import { signup, login, googleAuth } from '../controllers/authController';

export const authRoutes = Router();

authRoutes.post('/signup', signup);
authRoutes.post('/login', login);
authRoutes.post('/google', googleAuth);
