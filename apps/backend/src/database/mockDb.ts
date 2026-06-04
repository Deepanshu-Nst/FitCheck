import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MockUser {
  id: string;
  name: string;
  username: string | null;
  email: string;
  password_hash: string | null;
  avatar_url: string | null;
  gender: string | null;
  preferred_styles: string[];
  favorite_colors: string[];
  occasion_preferences: string[];
  bio: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface MockOutfit {
  id: string;
  user_id: string;
  image_url: string;
  occasion: string;
  notes: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  flagged: boolean;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface MockFeedback {
  id: string;
  outfit_id: string;
  overall_score: number;
  fit_feedback: string;
  color_review: string;
  occasion_match: string;
  suggestions: string[];
  confidence_level: 'low' | 'medium' | 'high';
  style_label: string | null;
  highlights: string[];
  raw_ai_response: Record<string, unknown> | null;
  created_at: string;
}

interface MockDatabase {
  users: MockUser[];
  outfits: MockOutfit[];
  feedback: MockFeedback[];
}

// ── Persistence ───────────────────────────────────────────────────────────────

const DB_PATH = path.join(__dirname, '../../data/mock_db.json');

function loadDb(): MockDatabase {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[MockDB] Failed to load DB file, starting fresh:', err);
  }
  return { users: [], outfits: [], feedback: [] };
}

function saveDb(db: MockDatabase): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[MockDB] Failed to save DB file:', err);
  }
}

// ── Mock DB Class ─────────────────────────────────────────────────────────────

class MockDb {
  private db: MockDatabase;

  constructor() {
    this.db = loadDb();
    console.log(
      `[MockDB] Loaded — ${this.db.users.length} users, ${this.db.outfits.length} outfits, ${this.db.feedback.length} feedback`
    );
  }

  private save() {
    saveDb(this.db);
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  users = {
    findByEmail: (email: string): MockUser | undefined => {
      return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    },

    findById: (id: string): MockUser | undefined => {
      return this.db.users.find((u) => u.id === id);
    },

    findByUsername: (username: string): MockUser | undefined => {
      return this.db.users.find((u) => u.username === username);
    },

    create: (data: Omit<MockUser, 'id' | 'created_at' | 'updated_at'>): MockUser => {
      const user: MockUser = {
        ...data,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.db.users.push(user);
      this.save();
      return user;
    },

    update: (id: string, updates: Partial<Omit<MockUser, 'id' | 'created_at'>>): MockUser | null => {
      const index = this.db.users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      this.db.users[index] = {
        ...this.db.users[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.save();
      return this.db.users[index];
    },

    upsertByEmail: (data: Omit<MockUser, 'id' | 'created_at' | 'updated_at'>): MockUser => {
      const existing = this.users.findByEmail(data.email);
      if (existing) {
        return this.users.update(existing.id, data) as MockUser;
      }
      return this.users.create(data);
    },

    list: (): MockUser[] => {
      return [...this.db.users];
    },
  };

  // ── Outfits ────────────────────────────────────────────────────────────────

  outfits = {
    create: (data: Omit<MockOutfit, 'id' | 'created_at'>): MockOutfit => {
      const outfit: MockOutfit = {
        ...data,
        id: uuidv4(),
        created_at: new Date().toISOString(),
      };
      this.db.outfits.push(outfit);
      this.save();
      return outfit;
    },

    findById: (id: string): MockOutfit | undefined => {
      return this.db.outfits.find((o) => o.id === id);
    },

    findByUserId: (userId: string, page: number, limit: number): { items: MockOutfit[]; total: number } => {
      const all = this.db.outfits
        .filter((o) => o.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const offset = (page - 1) * limit;
      return {
        items: all.slice(offset, offset + limit),
        total: all.length,
      };
    },

    findAll: (page: number, limit: number, statusFilter?: string): { items: MockOutfit[]; total: number } => {
      const all = this.db.outfits
        .filter((o) => !statusFilter || o.status === statusFilter)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const offset = (page - 1) * limit;
      return {
        items: all.slice(offset, offset + limit),
        total: all.length,
      };
    },

    update: (id: string, updates: Partial<Omit<MockOutfit, 'id' | 'created_at'>>): MockOutfit | null => {
      const index = this.db.outfits.findIndex((o) => o.id === id);
      if (index === -1) return null;
      this.db.outfits[index] = { ...this.db.outfits[index], ...updates };
      this.save();
      return this.db.outfits[index];
    },
  };

  // ── Feedback ───────────────────────────────────────────────────────────────

  feedback = {
    create: (data: Omit<MockFeedback, 'id' | 'created_at'>): MockFeedback => {
      const feedback: MockFeedback = {
        ...data,
        id: uuidv4(),
        created_at: new Date().toISOString(),
      };
      this.db.feedback.push(feedback);
      this.save();
      return feedback;
    },

    findByOutfitId: (outfitId: string): MockFeedback | undefined => {
      return this.db.feedback.find((f) => f.outfit_id === outfitId);
    },

    findById: (id: string): MockFeedback | undefined => {
      return this.db.feedback.find((f) => f.id === id);
    },
  };
}

// Singleton instance
export const mockDb = new MockDb();
