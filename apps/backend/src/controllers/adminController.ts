import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { createError } from '../middleware/errorHandler';

// ── GET /admin/submissions ────────────────────────────────────────────────────
export async function getSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    let query = supabase
      .from('outfits')
      .select(`
        id, image_url, occasion, notes, status, created_at, flagged, admin_notes,
        users (id, name, email, avatar_url),
        feedback (id, overall_score, confidence_level)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data: submissions, error, count } = await query;

    if (error) throw createError(error.message, 500);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /admin/review/:id ───────────────────────────────────────────────────
export async function reviewSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { flagged, admin_notes, status } = req.body;

    const { data: outfit, error } = await supabase
      .from('outfits')
      .update({
        ...(flagged !== undefined && { flagged }),
        ...(admin_notes && { admin_notes }),
        ...(status && { status }),
        reviewed_by: req.user!.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select('id, status, flagged, admin_notes, reviewed_at')
      .single();

    if (error) throw createError(error.message, 500);

    res.json({
      success: true,
      message: 'Submission reviewed',
      data: { outfit },
    });
  } catch (err) {
    next(err);
  }
}
