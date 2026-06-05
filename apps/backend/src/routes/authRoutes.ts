import { Router } from 'express';
import { signup, login } from '../controllers/authController';

export const authRoutes = Router();

// Email/password only — Google auth removed
authRoutes.post('/signup', signup);
authRoutes.post('/login', login);
