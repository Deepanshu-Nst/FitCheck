import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { usersDb } from '../services/dbService';
import { createError } from '../middleware/errorHandler';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z
    .string()
    .min(3)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
  preferred_styles: z.array(z.string()).optional(),
  favorite_colors: z.array(z.string()).optional(),
  occasion_preferences: z.array(z.string()).optional(),
  bio: z.string().max(200).optional(),
});

// ── GET /users/profile ────────────────────────────────────────────────────────

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await usersDb.findById(req.user!.userId);

    if (!user) {
      next(createError('User not found', 404));
      return;
    }

    const { password_hash: _, ...safeUser } = user;
    res.json({ success: true, data: { user: safeUser } });
  } catch (err) {
    next(err);
  }
}

// ── PUT /users/profile ────────────────────────────────────────────────────────

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    // Check username uniqueness
    if (parsed.data.username) {
      const existing = await usersDb.findByUsername(parsed.data.username);
      if (existing && existing.id !== req.user!.userId) {
        res.status(409).json({ success: false, message: 'Username already taken' });
        return;
      }
    }

    const user = await usersDb.update(req.user!.userId, parsed.data);

    if (!user) {
      next(createError('User not found', 404));
      return;
    }

    const { password_hash: _, ...safeUser } = user;
    res.json({ success: true, message: 'Profile updated', data: { user: safeUser } });
  } catch (err) {
    next(err);
  }
}
