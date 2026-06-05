import { Request, Response, NextFunction } from 'express';
import { eq, desc, count } from 'drizzle-orm';
import { db } from '../db/connection';
import { outfits, users, feedback } from '../db/schema';
import { createError } from '../middleware/errorHandler';

// ── GET /admin/submissions ────────────────────────────────────────────────────

export async function getSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const statusFilter = req.query.status as string | undefined;
    const offset = (page - 1) * limit;

    const baseQuery = statusFilter
      ? db.select().from(outfits).where(eq(outfits.status, statusFilter))
      : db.select().from(outfits);

    const [countResult, items] = await Promise.all([
      statusFilter
        ? db.select({ value: count() }).from(outfits).where(eq(outfits.status, statusFilter))
        : db.select({ value: count() }).from(outfits),
      db
        .select()
        .from(outfits)
        .orderBy(desc(outfits.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = Number(countResult[0]?.value ?? 0);

    const submissions = await Promise.all(
      items.map(async (outfit) => {
        const [user, fb] = await Promise.all([
          db.select().from(users).where(eq(users.id, outfit.userId)).then((rows) => rows[0]),
          db
            .select({ id: feedback.id, overallScore: feedback.overallScore, confidenceLevel: feedback.confidenceLevel })
            .from(feedback)
            .where(eq(feedback.outfitId, outfit.id))
            .then((rows) => rows[0]),
        ]);

        const { passwordHash: _, ...safeUser } = user ?? ({} as any);
        return { ...outfit, user: safeUser, feedback: fb ?? null };
      })
    );

    res.json({
      success: true,
      data: {
        submissions,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /admin/review/:id ───────────────────────────────────────────────────

export async function reviewSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { flagged, adminNotes, status } = req.body as {
      flagged?: boolean;
      adminNotes?: string;
      status?: string;
    };

    const [outfit] = await db
      .update(outfits)
      .set({
        ...(flagged !== undefined && { flagged }),
        ...(adminNotes && { adminNotes }),
        ...(status && { status }),
        reviewedBy: req.user!.userId,
        reviewedAt: new Date(),
      })
      .where(eq(outfits.id, req.params.id as string))
      .returning();

    if (!outfit) {
      next(createError('Outfit not found', 404));
      return;
    }

    res.json({ success: true, message: 'Submission reviewed', data: { outfit } });
  } catch (err) {
    next(err);
  }
}
