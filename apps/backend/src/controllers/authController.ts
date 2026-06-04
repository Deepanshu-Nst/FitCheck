import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { supabase } from '../config/supabase';
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

    // Check if user already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in DB
    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password_hash: passwordHash, role: 'user' })
      .select('id, name, email, role, avatar_url, created_at')
      .single();

    if (error) throw createError(error.message, 500);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token },
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

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password_hash, role, avatar_url, created_at')
      .eq('email', email)
      .single();

    if (error || !user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    // Return user without sensitive fields
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
// Receives the decoded Google token data from the mobile app (via expo-auth-session)
export async function googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = googleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    // TODO: Verify googleToken with Google's tokeninfo endpoint for production
    // For now, trust the decoded user data from the mobile app (expo-auth-session)
    const { name, email, avatar } = parsed.data;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required from Google auth' });
      return;
    }

    // Upsert user (create if doesn't exist, else return existing)
    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        { name: name || email.split('@')[0], email, avatar_url: avatar, role: 'user' },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select('id, name, email, role, avatar_url, created_at')
      .single();

    if (error) throw createError(error.message, 500);

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}
