import { Request, Response, NextFunction } from 'express';
import { outfitsDb, usersDb, feedbackDb } from '../services/dbService';
import { createError } from '../middleware/errorHandler';

// ── GET /admin/submissions ────────────────────────────────────────────────────

export async function getSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const statusFilter = req.query.status as string | undefined;

    const { items: outfits, total } = await outfitsDb.findAll(page, limit, statusFilter);

    // Enrich with user and feedback summary
    const submissions = await Promise.all(
      outfits.map(async (outfit) => {
        const [user, feedback] = await Promise.all([
          usersDb.findById(outfit.user_id),
          feedbackDb.findByOutfitId(outfit.id),
        ]);
        const { password_hash: _, ...safeUser } = user ?? ({} as ReturnType<typeof usersDb.findById> extends Promise<infer T> ? NonNullable<T> : never);
        return {
          ...outfit,
          user: safeUser,
          feedback: feedback
            ? { id: feedback.id, overall_score: feedback.overall_score, confidence_level: feedback.confidence_level }
            : null,
        };
      })
    );

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
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
    const { flagged, admin_notes, status } = req.body as {
      flagged?: boolean;
      admin_notes?: string;
      status?: string;
    };

    const outfit = await outfitsDb.update(req.params.id as string, {
      ...(flagged !== undefined && { flagged }),
      ...(admin_notes && { admin_notes }),
      ...(status && { status: status as MockOutfitStatus }),
      reviewed_by: req.user!.userId,
      reviewed_at: new Date().toISOString(),
    });

    if (!outfit) {
      next(createError('Outfit not found', 404));
      return;
    }

    res.json({
      success: true,
      message: 'Submission reviewed',
      data: { outfit },
    });
  } catch (err) {
    next(err);
  }
}

type MockOutfitStatus = 'pending' | 'processing' | 'completed' | 'failed';
