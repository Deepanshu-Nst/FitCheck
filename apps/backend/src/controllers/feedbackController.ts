import { Request, Response, NextFunction } from 'express';
import { outfitsDb, feedbackDb } from '../services/dbService';
import { groqService } from '../services/groqService';
import { createError } from '../middleware/errorHandler';

// ── POST /feedback/generate ───────────────────────────────────────────────────

export async function generateFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { outfitId } = req.body;

    if (!outfitId) {
      res.status(400).json({ success: false, message: 'outfitId is required' });
      return;
    }

    const outfit = await outfitsDb.findById(outfitId);

    if (!outfit || outfit.user_id !== req.user!.userId) {
      next(createError('Outfit not found', 404));
      return;
    }

    // Idempotency — don't generate twice
    const existing = await feedbackDb.findByOutfitId(outfitId);
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'Feedback already generated for this outfit',
        data: { feedback: existing },
      });
      return;
    }

    // Mark as processing
    await outfitsDb.update(outfitId, { status: 'processing' });

    // Generate AI feedback (falls back to mock if no GROQ_API_KEY)
    const aiFeedback = await groqService.generateOutfitFeedback({
      imageUrl: outfit.image_url,
      occasion: outfit.occasion,
      notes: outfit.notes ?? undefined,
    });

    // Persist feedback
    const feedback = await feedbackDb.create({
      outfit_id: outfitId,
      overall_score: aiFeedback.overallScore,
      fit_feedback: aiFeedback.fitFeedback,
      color_review: aiFeedback.colorReview,
      occasion_match: aiFeedback.occasionMatch,
      suggestions: aiFeedback.suggestions,
      confidence_level: aiFeedback.confidenceLevel,
      style_label: aiFeedback.styleLabel ?? null,
      highlights: aiFeedback.highlights ?? [],
      raw_ai_response: aiFeedback as unknown as Record<string, unknown>,
    });

    // Mark outfit as completed
    await outfitsDb.update(outfitId, { status: 'completed' });

    res.status(201).json({
      success: true,
      message: 'Feedback generated successfully',
      data: { feedback },
    });
  } catch (err) {
    // Reset status on failure so user can retry
    if (req.body?.outfitId) {
      await outfitsDb.update(req.body.outfitId, { status: 'failed' }).catch(() => null);
    }
    next(err);
  }
}

// ── GET /feedback/:outfitId ───────────────────────────────────────────────────

export async function getFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Verify outfit ownership first
    const outfit = await outfitsDb.findById(req.params.outfitId as string);
    if (!outfit || outfit.user_id !== req.user!.userId) {
      next(createError('Outfit not found', 404));
      return;
    }

    const feedback = await feedbackDb.findByOutfitId(req.params.outfitId as string);
    if (!feedback) {
      next(createError('Feedback not found — try generating it first', 404));
      return;
    }

    res.json({ success: true, data: { feedback } });
  } catch (err) {
    next(err);
  }
}
