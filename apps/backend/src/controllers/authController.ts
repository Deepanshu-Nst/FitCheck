import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { usersDb } from '../services/dbService';
import { signToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';

// ── Validation Schemas ────────────────────────────────────────────────────────

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const googleSchema = z.object({
  googleToken: z.string().min(1, 'Google token is required'),
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
});

// ── POST /auth/signup ─────────────────────────────────────────────────────────

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { name, email, password } = parsed.data;

    // Check if email already registered
    const existing = await usersDb.findByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await usersDb.create({
      name,
      email,
      password_hash: passwordHash,
      role: 'user',
      username: null,
      avatar_url: null,
      gender: null,
      preferred_styles: [],
      favorite_colors: [],
      occasion_preferences: [],
      bio: null,
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    // Never return password_hash
    const { password_hash: _, ...safeUser } = user;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user: safeUser, token },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /auth/login ──────────────────────────────────────────────────────────

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password } = parsed.data;

    const user = await usersDb.findByEmail(email);
    if (!user || !user.password_hash) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const { password_hash: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: safeUser, token },
    });
  } catch (err) {
    next(err);
  }
}

// ── POST /auth/google ─────────────────────────────────────────────────────────

export async function googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = googleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    // In production: verify googleToken with Google tokeninfo endpoint
    // Here we trust the decoded user data from expo-auth-session (good enough for dev)
    const { name, email, avatar } = parsed.data;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required from Google auth' });
      return;
    }

    const user = await usersDb.upsertByEmail({
      name: name || email.split('@')[0],
      email,
      avatar_url: avatar || null,
      password_hash: null,
      role: 'user',
      username: null,
      gender: null,
      preferred_styles: [],
      favorite_colors: [],
      occasion_preferences: [],
      bio: null,
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    const { password_hash: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: { user: safeUser, token },
    });
  } catch (err) {
    next(err);
  }
}
