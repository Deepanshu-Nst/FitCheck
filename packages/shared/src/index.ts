import { z } from 'zod';

// ── User ──────────────────────────────────────────────────────────────────────
// Field names match Drizzle ORM camelCase output from the Neon DB.
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  username: z.string().nullable(),
  email: z.string().email(),
  avatarUrl: z.string().url().nullable(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).nullable(),
  preferredStyles: z.array(z.string()),
  favoriteColors: z.array(z.string()),
  occasionPreferences: z.array(z.string()),
  bio: z.string().nullable(),
  role: z.enum(['user', 'admin']),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type User = z.infer<typeof UserSchema>;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const SignupInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
export type SignupInput = z.infer<typeof SignupInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    user: UserSchema,
    token: z.string(),
  }),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ── Outfit ────────────────────────────────────────────────────────────────────
export const OccasionEnum = z.enum([
  'casual',
  'formal',
  'business',
  'party',
  'outdoor',
  'athletic',
  'date',
  'other',
]);
export type Occasion = z.infer<typeof OccasionEnum>;

export const OCCASION_LABELS: Record<Occasion, string> = {
  casual: 'Casual',
  formal: 'Formal',
  business: 'Business',
  party: 'Party',
  outdoor: 'Outdoor',
  athletic: 'Athletic',
  date: 'Date Night',
  other: 'Other',
};

export const OutfitStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed']);
export type OutfitStatus = z.infer<typeof OutfitStatusEnum>;

export const OutfitSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  imageUrl: z.string().url(),
  imagePublicId: z.string().nullable().optional(),
  occasion: OccasionEnum,
  notes: z.string().nullable(),
  status: OutfitStatusEnum,
  flagged: z.boolean().optional().nullable(),
  createdAt: z.string().or(z.date()),
});
export type Outfit = z.infer<typeof OutfitSchema>;

// ── Feedback ──────────────────────────────────────────────────────────────────
export const FeedbackSchema = z.object({
  id: z.string().uuid(),
  outfitId: z.string().uuid(),
  overallScore: z.number().int().min(0).max(100),
  fitFeedback: z.string(),
  colorReview: z.string(),
  occasionMatch: z.string(),
  suggestions: z.array(z.string()),
  confidenceLevel: z.enum(['low', 'medium', 'high']),
  styleLabel: z.string().nullable().optional(),
  highlights: z.array(z.string()).optional(),
  createdAt: z.string().or(z.date()),
});
export type Feedback = z.infer<typeof FeedbackSchema>;

// ── API Responses ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ── Style / Color Preferences ─────────────────────────────────────────────────
export const STYLE_OPTIONS = [
  'Casual', 'Smart Casual', 'Streetwear', 'Minimalist',
  'Bohemian', 'Preppy', 'Sporty', 'Vintage', 'Business Formal',
  'Business Casual', 'Avant-Garde', 'Classic',
] as const;

export const COLOR_OPTIONS = [
  'Black', 'White', 'Navy', 'Grey', 'Beige', 'Brown',
  'Olive', 'Burgundy', 'Blush', 'Cream', 'Camel', 'Forest Green',
  'Cobalt Blue', 'Rust', 'Terracotta',
] as const;

export const OCCASION_OPTIONS: Occasion[] = [
  'casual', 'formal', 'business', 'party', 'outdoor', 'athletic', 'date', 'other',
];
