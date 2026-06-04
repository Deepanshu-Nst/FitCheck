import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase';
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

    // Upload image to Supabase Storage
    const imageUrl = await storageService.uploadOutfitImage(
      req.file.buffer,
      req.file.mimetype,
      userId
    );

    // Save outfit metadata to DB
    const { data: outfit, error } = await supabase
      .from('outfits')
      .insert({
        user_id: userId,
        image_url: imageUrl,
        occasion,
        notes,
        status: 'pending',
      })
      .select('id, user_id, image_url, occasion, notes, status, created_at')
      .single();

    if (error) throw createError(error.message, 500);

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { data: outfits, error, count } = await supabase
      .from('outfits')
      .select(`
        id, image_url, occasion, notes, status, created_at,
        feedback (id, overall_score, confidence_level)
      `, { count: 'exact' })
      .eq('user_id', req.user!.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw createError(error.message, 500);

    res.json({
      success: true,
      data: {
        outfits,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasMore: offset + limit < (count || 0),
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
    const { data: outfit, error } = await supabase
      .from('outfits')
      .select(`
        id, image_url, occasion, notes, status, created_at,
        feedback (*)
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user!.userId)
      .single();

    if (error || !outfit) {
      next(createError('Outfit not found', 404));
      return;
    }

    res.json({ success: true, data: { outfit } });
  } catch (err) {
    next(err);
  }
}
