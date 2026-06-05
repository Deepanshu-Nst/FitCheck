import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eq, desc, count, and } from 'drizzle-orm';
import { db } from '../db/connection';
import { outfits, feedback } from '../db/schema';
import { imageService } from '../services/imageService';
import { createError } from '../middleware/errorHandler';

const uploadMetaSchema = z.object({
  occasion: z.enum(['casual', 'formal', 'business', 'party', 'outdoor', 'athletic', 'date', 'other']),
  notes: z.string().max(500).optional(),
});

// ── POST /outfits/upload ──────────────────────────────────────────────────────

export async function uploadOutfit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = uploadMetaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'Image file is required' });
      return;
    }

    const { occasion, notes } = parsed.data;
    const userId = req.user!.userId;

    // Upload to Cloudinary
    const { url: imageUrl, publicId: imagePublicId } = await imageService.upload(
      req.file.buffer,
      req.file.mimetype
    );

    const [outfit] = await db
      .insert(outfits)
      .values({
        userId,
        imageUrl,
        imagePublicId,
        occasion,
        notes: notes ?? null,
        status: 'pending',
      })
      .returning();

    res.status(201).json({
      success: true,
      message: 'Outfit uploaded successfully',
      data: { outfit },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /outfits/history ──────────────────────────────────────────────────────

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const userId = req.user!.userId;
    const offset = (page - 1) * limit;

    const [totalResult, items] = await Promise.all([
      db.select({ value: count() }).from(outfits).where(eq(outfits.userId, userId)),
      db
        .select()
        .from(outfits)
        .where(eq(outfits.userId, userId))
        .orderBy(desc(outfits.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = Number(totalResult[0]?.value ?? 0);

    // Attach feedback summary for each outfit
    const outfitsWithFeedback = await Promise.all(
      items.map(async (outfit) => {
        const [fb] = await db
          .select({
            id: feedback.id,
            overallScore: feedback.overallScore,
            confidenceLevel: feedback.confidenceLevel,
          })
          .from(feedback)
          .where(eq(feedback.outfitId, outfit.id));
        return { ...outfit, feedback: fb ?? null };
      })
    );

    res.json({
      success: true,
      data: {
        outfits: outfitsWithFeedback,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── GET /outfits/:id ──────────────────────────────────────────────────────────

export async function getOutfit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [outfit] = await db
      .select()
      .from(outfits)
      .where(eq(outfits.id, req.params.id as string));

    if (!outfit || outfit.userId !== req.user!.userId) {
      next(createError('Outfit not found', 404));
      return;
    }

    const [fb] = await db
      .select()
      .from(feedback)
      .where(eq(feedback.outfitId, outfit.id));

    res.json({
      success: true,
      data: { outfit: { ...outfit, feedback: fb ?? null } },
    });
  } catch (err) {
    next(err);
  }
}
