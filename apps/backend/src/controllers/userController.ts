import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { users } from '../db/schema';
import { createError } from '../middleware/errorHandler';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z
    .string()
    .min(3)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
  preferredStyles: z.array(z.string()).optional(),
  favoriteColors: z.array(z.string()).optional(),
  occasionPreferences: z.array(z.string()).optional(),
  bio: z.string().max(200).optional(),
});

// ── GET /users/profile ────────────────────────────────────────────────────────

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId));

    if (!user) {
      next(createError('User not found', 404));
      return;
    }

    const { passwordHash: _, ...safeUser } = user;
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
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, parsed.data.username));
      if (existing && existing.id !== req.user!.userId) {
        res.status(409).json({ success: false, message: 'Username already taken' });
        return;
      }
    }

    const [user] = await db
      .update(users)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(users.id, req.user!.userId))
      .returning();

    if (!user) {
      next(createError('User not found', 404));
      return;
    }

    const { passwordHash: _, ...safeUser } = user;
    res.json({ success: true, message: 'Profile updated', data: { user: safeUser } });
  } catch (err) {
    next(err);
  }
}
