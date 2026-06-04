import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';

const USE_MOCK = process.env.USE_MOCK_SERVICES === 'true';
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'outfit-images';
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const BASE_URL = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

// Ensure local uploads directory exists
if (USE_MOCK) {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  console.log(`📁 Storage Mode: Local (${UPLOADS_DIR})`);
} else {
  console.log('☁️  Storage Mode: Supabase');
}

class StorageService {
  /**
   * Upload an outfit image buffer.
   * Returns the public URL of the uploaded image.
   */
  async uploadOutfitImage(
    buffer: Buffer,
    mimeType: string,
    userId: string
  ): Promise<string> {
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `${userId}_${uuidv4()}.${extension}`;

    if (USE_MOCK) {
      // ── Local storage ──────────────────────────────────────────────────────
      const filePath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(filePath, buffer);
      return `${BASE_URL}/uploads/${fileName}`;
    }

    // ── Supabase Storage ───────────────────────────────────────────────────
    const supabasePath = `${userId}/${fileName}`;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(supabasePath, buffer, { contentType: mimeType, upsert: false });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(supabasePath);
    return data.publicUrl;
  }

  /**
   * Delete an image. Handles both local files and Supabase paths.
   */
  async deleteImage(publicUrl: string): Promise<void> {
    if (USE_MOCK) {
      try {
        const fileName = publicUrl.split('/uploads/')[1];
        if (!fileName) return;
        const filePath = path.join(UPLOADS_DIR, fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.error('[StorageService] Failed to delete local file:', err);
      }
      return;
    }

    // Supabase deletion
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
    if (pathParts.length < 2) return;
    const filePath = pathParts[1];
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) console.error(`[StorageService] Failed to delete ${filePath}:`, error.message);
  }
}

export const storageService = new StorageService();
