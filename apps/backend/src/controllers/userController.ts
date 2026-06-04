import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/errorHandler';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
  preferred_styles: z.array(z.string()).optional(),
  favorite_colors: z.array(z.string()).optional(),
  occasion_preferences: z.array(z.string()).optional(),
  bio: z.string().max(200).optional(),
});

// ── GET /users/profile ────────────────────────────────────────────────────────
export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, username, email, avatar_url, gender, preferred_styles, favorite_colors, occasion_preferences, bio, role, created_at')
      .eq('id', req.user!.userId)
      .single();

    if (error || !user) {
      next(createError('User not found', 404));
      return;
    }

    res.json({ success: true, data: { user } });
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

    // Check username uniqueness if being updated
    if (parsed.data.username) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', parsed.data.username)
        .neq('id', req.user!.userId)
        .single();

      if (existing) {
        res.status(409).json({ success: false, message: 'Username already taken' });
        return;
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', req.user!.userId)
      .select('id, name, username, email, avatar_url, gender, preferred_styles, favorite_colors, occasion_preferences, bio, role, created_at')
      .single();

    if (error) throw createError(error.message, 500);

    res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (err) {
    next(err);
  }
}
