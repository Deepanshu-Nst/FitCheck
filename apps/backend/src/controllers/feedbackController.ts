import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
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

    // Verify outfit belongs to this user
    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .select('id, image_url, occasion, notes, user_id')
      .eq('id', outfitId)
      .eq('user_id', req.user!.userId)
      .single();

    if (outfitError || !outfit) {
      next(createError('Outfit not found', 404));
      return;
    }

    // Check if feedback already exists
    const { data: existingFeedback } = await supabase
      .from('feedback')
      .select('id')
      .eq('outfit_id', outfitId)
      .single();

    if (existingFeedback) {
      res.status(409).json({ success: false, message: 'Feedback already generated for this outfit' });
      return;
    }

    // Update outfit status to processing
    await supabase
      .from('outfits')
      .update({ status: 'processing' })
      .eq('id', outfitId);

    // Generate AI feedback
    const aiFeedback = await groqService.generateOutfitFeedback({
      imageUrl: outfit.image_url,
      occasion: outfit.occasion,
      notes: outfit.notes,
    });

    // Save feedback to DB
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .insert({
        outfit_id: outfitId,
        overall_score: aiFeedback.overallScore,
        fit_feedback: aiFeedback.fitFeedback,
        color_review: aiFeedback.colorReview,
        occasion_match: aiFeedback.occasionMatch,
        suggestions: aiFeedback.suggestions,
        confidence_level: aiFeedback.confidenceLevel,
        raw_ai_response: aiFeedback,
      })
      .select('*')
      .single();

    if (feedbackError) throw createError(feedbackError.message, 500);

    // Update outfit status to completed
    await supabase
      .from('outfits')
      .update({ status: 'completed' })
      .eq('id', outfitId);

    res.status(201).json({
      success: true,
      message: 'Feedback generated successfully',
      data: { feedback },
    });
  } catch (err) {
    // If feedback generation fails, reset outfit status
    if (req.body.outfitId) {
      await supabase
        .from('outfits')
        .update({ status: 'failed' })
        .eq('id', req.body.outfitId);
    }
    next(err);
  }
}

// ── GET /feedback/:outfitId ───────────────────────────────────────────────────
export async function getFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Verify outfit belongs to user first
    const { data: outfit } = await supabase
      .from('outfits')
      .select('id')
      .eq('id', req.params.outfitId)
      .eq('user_id', req.user!.userId)
      .single();

    if (!outfit) {
      next(createError('Outfit not found', 404));
      return;
    }

    const { data: feedback, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('outfit_id', req.params.outfitId)
      .single();

    if (error || !feedback) {
      next(createError('Feedback not found', 404));
      return;
    }

    res.json({ success: true, data: { feedback } });
  } catch (err) {
    next(err);
  }
}
