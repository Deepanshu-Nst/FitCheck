import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { outfits, feedback } from '../db/schema';
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

    const [outfit] = await db.select().from(outfits).where(eq(outfits.id, outfitId));

    if (!outfit || outfit.userId !== req.user!.userId) {
      next(createError('Outfit not found', 404));
      return;
    }

    // Idempotency — don't generate twice
    const [existing] = await db.select().from(feedback).where(eq(feedback.outfitId, outfitId));
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'Feedback already generated for this outfit',
        data: { feedback: existing },
      });
      return;
    }

    // Mark as processing
    await db.update(outfits).set({ status: 'processing' }).where(eq(outfits.id, outfitId));

    // Generate AI feedback (falls back to mock if no GROQ_API_KEY)
    const aiFeedback = await groqService.generateOutfitFeedback({
      imageUrl: outfit.imageUrl,
      occasion: outfit.occasion,
      notes: outfit.notes ?? undefined,
    });

    // Persist feedback
    const [fb] = await db
      .insert(feedback)
      .values({
        outfitId,
        overallScore: aiFeedback.overallScore,
        fitFeedback: aiFeedback.fitFeedback,
        colorReview: aiFeedback.colorReview,
        occasionMatch: aiFeedback.occasionMatch,
        suggestions: aiFeedback.suggestions,
        confidenceLevel: aiFeedback.confidenceLevel,
        styleLabel: aiFeedback.styleLabel ?? null,
        highlights: aiFeedback.highlights ?? [],
        rawAiResponse: aiFeedback as unknown as Record<string, unknown>,
      })
      .returning();

    // Mark outfit as completed
    await db.update(outfits).set({ status: 'completed' }).where(eq(outfits.id, outfitId));

    res.status(201).json({
      success: true,
      message: 'Feedback generated successfully',
      data: { feedback: fb },
    });
  } catch (err) {
    // Reset status on failure so user can retry
    if (req.body?.outfitId) {
      await db
        .update(outfits)
        .set({ status: 'failed' })
        .where(eq(outfits.id, req.body.outfitId))
        .catch(() => null);
    }
    next(err);
  }
}

// ── GET /feedback/:outfitId ───────────────────────────────────────────────────

export async function getFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const outfitId = req.params.outfitId as string;

    // Verify outfit ownership first
    const [outfit] = await db.select().from(outfits).where(eq(outfits.id, outfitId));
    if (!outfit || outfit.userId !== req.user!.userId) {
      next(createError('Outfit not found', 404));
      return;
    }

    const [fb] = await db.select().from(feedback).where(eq(feedback.outfitId, outfitId));
    if (!fb) {
      next(createError('Feedback not found — try generating it first', 404));
      return;
    }

    res.json({ success: true, data: { feedback: fb } });
  } catch (err) {
    next(err);
  }
}
