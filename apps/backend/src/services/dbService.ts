/**
 * dbService — Data Access Layer
 *
 * All controllers go through this service, never directly to Supabase or mockDb.
 * Toggle via USE_MOCK_SERVICES=true in .env to use the local JSON-backed store.
 * Swap back to Supabase later by setting USE_MOCK_SERVICES=false — zero controller changes needed.
 */

import { mockDb, MockUser, MockOutfit, MockFeedback } from '../database/mockDb';
import { supabase } from '../config/supabase';

const USE_MOCK = process.env.USE_MOCK_SERVICES === 'true';

if (USE_MOCK) {
  console.log('🗄️  DB Mode: Mock (local JSON) — set USE_MOCK_SERVICES=false to use Supabase');
} else {
  console.log('🗄️  DB Mode: Supabase');
}

// ── Shared return types (subset compatible with both Supabase rows and MockUser) ──

export type DbUser = MockUser;
export type DbOutfit = MockOutfit;
export type DbFeedback = MockFeedback;

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersDb = {
  async findByEmail(email: string): Promise<DbUser | null> {
    if (USE_MOCK) {
      return mockDb.users.findByEmail(email) ?? null;
    }
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    return data;
  },

  async findById(id: string): Promise<DbUser | null> {
    if (USE_MOCK) {
      return mockDb.users.findById(id) ?? null;
    }
    const { data } = await supabase.from('users').select('*').eq('id', id).single();
    return data;
  },

  async findByUsername(username: string): Promise<DbUser | null> {
    if (USE_MOCK) {
      return mockDb.users.findByUsername(username) ?? null;
    }
    const { data } = await supabase.from('users').select('*').eq('username', username).single();
    return data;
  },

  async create(data: Omit<DbUser, 'id' | 'created_at' | 'updated_at'>): Promise<DbUser> {
    if (USE_MOCK) {
      return mockDb.users.create(data);
    }
    const { data: row, error } = await supabase.from('users').insert(data).select('*').single();
    if (error) throw new Error(error.message);
    return row;
  },

  async update(id: string, updates: Partial<Omit<DbUser, 'id' | 'created_at'>>): Promise<DbUser | null> {
    if (USE_MOCK) {
      return mockDb.users.update(id, updates);
    }
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async upsertByEmail(data: Omit<DbUser, 'id' | 'created_at' | 'updated_at'>): Promise<DbUser> {
    if (USE_MOCK) {
      return mockDb.users.upsertByEmail(data);
    }
    const { data: row, error } = await supabase
      .from('users')
      .upsert(data, { onConflict: 'email' })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return row;
  },

  async list(): Promise<DbUser[]> {
    if (USE_MOCK) {
      return mockDb.users.list();
    }
    const { data } = await supabase.from('users').select('*');
    return data ?? [];
  },
};

// ── Outfits ───────────────────────────────────────────────────────────────────

export const outfitsDb = {
  async create(data: Omit<DbOutfit, 'id' | 'created_at'>): Promise<DbOutfit> {
    if (USE_MOCK) {
      return mockDb.outfits.create(data);
    }
    const { data: row, error } = await supabase.from('outfits').insert(data).select('*').single();
    if (error) throw new Error(error.message);
    return row;
  },

  async findById(id: string): Promise<DbOutfit | null> {
    if (USE_MOCK) {
      return mockDb.outfits.findById(id) ?? null;
    }
    const { data } = await supabase.from('outfits').select('*').eq('id', id).single();
    return data;
  },

  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ items: DbOutfit[]; total: number }> {
    if (USE_MOCK) {
      return mockDb.outfits.findByUserId(userId, page, limit);
    }
    const offset = (page - 1) * limit;
    const { data, count, error } = await supabase
      .from('outfits')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new Error(error.message);
    return { items: data ?? [], total: count ?? 0 };
  },

  async findAll(
    page: number,
    limit: number,
    statusFilter?: string
  ): Promise<{ items: DbOutfit[]; total: number }> {
    if (USE_MOCK) {
      return mockDb.outfits.findAll(page, limit, statusFilter);
    }
    const offset = (page - 1) * limit;
    let query = supabase
      .from('outfits')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (statusFilter) query = query.eq('status', statusFilter);
    const { data, count, error } = await query;
    if (error) throw new Error(error.message);
    return { items: data ?? [], total: count ?? 0 };
  },

  async update(id: string, updates: Partial<Omit<DbOutfit, 'id' | 'created_at'>>): Promise<DbOutfit | null> {
    if (USE_MOCK) {
      return mockDb.outfits.update(id, updates);
    }
    const { data, error } = await supabase
      .from('outfits')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};

// ── Feedback ──────────────────────────────────────────────────────────────────

export const feedbackDb = {
  async create(data: Omit<DbFeedback, 'id' | 'created_at'>): Promise<DbFeedback> {
    if (USE_MOCK) {
      return mockDb.feedback.create(data);
    }
    const { data: row, error } = await supabase.from('feedback').insert(data).select('*').single();
    if (error) throw new Error(error.message);
    return row;
  },

  async findByOutfitId(outfitId: string): Promise<DbFeedback | null> {
    if (USE_MOCK) {
      return mockDb.feedback.findByOutfitId(outfitId) ?? null;
    }
    const { data } = await supabase.from('feedback').select('*').eq('outfit_id', outfitId).single();
    return data;
  },

  async findById(id: string): Promise<DbFeedback | null> {
    if (USE_MOCK) {
      return mockDb.feedback.findById(id) ?? null;
    }
    const { data } = await supabase.from('feedback').select('*').eq('id', id).single();
    return data;
  },
};
