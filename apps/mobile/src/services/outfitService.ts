import { apiClient } from './apiClient';
import type { Outfit, Feedback, Occasion } from '@fitcheck/shared';

interface UploadOutfitParams {
  imageUri: string;
  mimeType: string;
  occasion: Occasion;
  notes?: string;
  token: string;
}

interface HistoryResponse {
  success: boolean;
  data: {
    outfits: (Outfit & { feedback?: Pick<Feedback, 'id' | 'overallScore' | 'confidenceLevel'> | null })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
}

export const outfitService = {
  async uploadOutfit({ imageUri, mimeType, occasion, notes, token }: UploadOutfitParams): Promise<Outfit> {
    const formData = new FormData();

    formData.append('image', {
      uri: imageUri,
      name: `outfit.${mimeType.split('/')[1] || 'jpg'}`,
      type: mimeType,
    } as unknown as Blob);

    formData.append('occasion', occasion);
    if (notes) formData.append('notes', notes);

    const res = await apiClient.upload<{ success: boolean; data: { outfit: Outfit } }>(
      '/outfits/upload',
      formData,
      token
    );

    return res.data.outfit;
  },

  async getHistory(token: string, page = 1, limit = 10): Promise<HistoryResponse['data']> {
    const res = await apiClient.get<HistoryResponse>(
      `/outfits/history?page=${page}&limit=${limit}`,
      token
    );
    return res.data;
  },

  async getOutfit(id: string, token: string): Promise<Outfit & { feedback?: Feedback | null }> {
    const res = await apiClient.get<{ success: boolean; data: { outfit: Outfit & { feedback?: Feedback | null } } }>(
      `/outfits/${id}`,
      token
    );
    return res.data.outfit;
  },
};
