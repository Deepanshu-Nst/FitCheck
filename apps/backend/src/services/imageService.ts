import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from env at module init
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const isConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  console.log('☁️  Cloudinary: Connected');
} else {
  console.warn('⚠️  Cloudinary: Missing env vars — image uploads will fail');
}

export interface UploadResult {
  url: string;
  publicId: string;
}

export const imageService = {
  /**
   * Upload an image buffer to Cloudinary.
   * Returns the secure URL and public_id for future deletion.
   */
  async upload(buffer: Buffer, mimeType: string, folder = 'fitcheck/outfits'): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          format: mimeType.split('/')[1] || 'jpg',
          transformation: [
            { width: 1200, crop: 'limit' },   // cap max width
            { quality: 'auto:good' },          // smart compression
            { fetch_format: 'auto' },          // serve webp/avif where supported
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload failed'));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      stream.end(buffer);
    });
  },

  /**
   * Delete an image from Cloudinary by its public_id.
   */
  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  },
};
