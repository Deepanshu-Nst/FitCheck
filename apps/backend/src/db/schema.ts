import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  username: text('username').unique(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash'),                           // null for future OAuth
  avatarUrl: text('avatar_url'),
  gender: text('gender'),                                        // 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
  preferredStyles: text('preferred_styles').array().default([]),
  favoriteColors: text('favorite_colors').array().default([]),
  occasionPreferences: text('occasion_preferences').array().default([]),
  bio: text('bio'),
  role: text('role').notNull().default('user'),                  // 'user' | 'admin'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Outfits ───────────────────────────────────────────────────────────────────

export const outfits = pgTable('outfits', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  imageUrl: text('image_url').notNull(),
  imagePublicId: text('image_public_id'),                        // Cloudinary public_id for deletion
  occasion: text('occasion').notNull(),                          // 'casual' | 'formal' | ...
  notes: text('notes'),
  status: text('status').notNull().default('pending'),           // 'pending' | 'processing' | 'completed' | 'failed'
  flagged: boolean('flagged').default(false),
  adminNotes: text('admin_notes'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Feedback ──────────────────────────────────────────────────────────────────

export const feedback = pgTable('feedback', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  outfitId: uuid('outfit_id')
    .notNull()
    .unique()
    .references(() => outfits.id, { onDelete: 'cascade' }),
  overallScore: integer('overall_score').notNull(),              // 0-100
  fitFeedback: text('fit_feedback').notNull(),
  colorReview: text('color_review').notNull(),
  occasionMatch: text('occasion_match').notNull(),
  suggestions: text('suggestions').array().default([]),
  confidenceLevel: text('confidence_level').notNull(),           // 'low' | 'medium' | 'high'
  styleLabel: text('style_label'),
  highlights: text('highlights').array().default([]),
  rawAiResponse: jsonb('raw_ai_response'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Inferred Types ────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Outfit = typeof outfits.$inferSelect;
export type NewOutfit = typeof outfits.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
