import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'outfit-images';

class StorageService {
  /**
   * Upload an outfit image buffer to Supabase Storage.
   * Returns the public URL of the uploaded image.
   */
  async uploadOutfitImage(
    buffer: Buffer,
    mimeType: string,
    userId: string
  ): Promise<string> {
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `${userId}/${uuidv4()}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
  }

  /**
   * Delete an image from Supabase Storage by its public URL.
   */
  async deleteImage(publicUrl: string): Promise<void> {
    // Extract file path from public URL
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split(`/${BUCKET_NAME}/`);
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error(`[StorageService] Failed to delete ${filePath}:`, error.message);
    }
  }
}

export const storageService = new StorageService();
