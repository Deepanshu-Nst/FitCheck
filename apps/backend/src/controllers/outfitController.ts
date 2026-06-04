import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { outfitsDb, feedbackDb } from '../services/dbService';
import { storageService } from '../services/storageService';
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

    // Upload image (local or Supabase depending on USE_MOCK_SERVICES)
    const imageUrl = await storageService.uploadOutfitImage(
      req.file.buffer,
      req.file.mimetype,
      userId
    );

    const outfit = await outfitsDb.create({
      user_id: userId,
      image_url: imageUrl,
      occasion,
      notes: notes ?? null,
      status: 'pending',
      flagged: false,
      admin_notes: null,
      reviewed_by: null,
      reviewed_at: null,
    });

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

    const { items: outfits, total } = await outfitsDb.findByUserId(userId, page, limit);

    // Attach feedback summary for each outfit
    const outfitsWithFeedback = await Promise.all(
      outfits.map(async (outfit) => {
        const feedback = await feedbackDb.findByOutfitId(outfit.id);
        return {
          ...outfit,
          feedback: feedback
            ? {
                id: feedback.id,
                overall_score: feedback.overall_score,
                confidence_level: feedback.confidence_level,
              }
            : null,
        };
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
    const outfit = await outfitsDb.findById(req.params.id as string);

    if (!outfit || outfit.user_id !== req.user!.userId) {
      next(createError('Outfit not found', 404));
      return;
    }

    const feedback = await feedbackDb.findByOutfitId(outfit.id);

    res.json({
      success: true,
      data: { outfit: { ...outfit, feedback: feedback ?? null } },
    });
  } catch (err) {
    next(err);
  }
}
