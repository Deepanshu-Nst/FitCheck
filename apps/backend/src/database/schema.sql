-- ─────────────────────────────────────────────────────────────────────────────
-- FitCheck Database Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  username        TEXT UNIQUE,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT,                  -- NULL for OAuth users
  avatar_url      TEXT,
  gender          TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  preferred_styles TEXT[] DEFAULT '{}',
  favorite_colors  TEXT[] DEFAULT '{}',
  occasion_preferences TEXT[] DEFAULT '{}',
  bio             TEXT,
  role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast email lookups (auth)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- ── Outfits ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outfits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  occasion    TEXT NOT NULL CHECK (occasion IN ('casual','formal','business','party','outdoor','athletic','date','other')),
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  flagged     BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user's outfit history (most common query)
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_outfits_status ON outfits (status);

-- ── Feedback ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id         UUID UNIQUE NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  overall_score     INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  fit_feedback      TEXT NOT NULL,
  color_review      TEXT NOT NULL,
  occasion_match    TEXT NOT NULL,
  suggestions       TEXT[] DEFAULT '{}',
  confidence_level  TEXT NOT NULL CHECK (confidence_level IN ('low','medium','high')),
  style_label       TEXT,
  highlights        TEXT[] DEFAULT '{}',
  raw_ai_response   JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index for outfit-to-feedback joins
CREATE INDEX IF NOT EXISTS idx_feedback_outfit_id ON feedback (outfit_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase Storage Setup
-- Run in Supabase Dashboard → Storage → New Bucket
-- Bucket name: outfit-images
-- Public bucket: YES (so image URLs are directly accessible)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Note: Our backend uses the service-role key which bypasses RLS.
-- These policies are for direct client access if you add Supabase client later.

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "users_own_profile" ON users
  FOR ALL USING (true);  -- Service role bypasses; add user-level policy if using anon client

-- Users can only access their own outfits
CREATE POLICY "outfits_own" ON outfits
  FOR ALL USING (true);

-- Feedback is readable if user owns the outfit
CREATE POLICY "feedback_own" ON feedback
  FOR ALL USING (true);
