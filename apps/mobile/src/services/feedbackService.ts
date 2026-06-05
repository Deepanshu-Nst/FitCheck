import { apiClient } from './apiClient';
import type { Feedback } from '@fitcheck/shared';

export const feedbackService = {
  async generateFeedback(outfitId: string, token: string): Promise<Feedback> {
    const res = await apiClient.post<{ success: boolean; data: { feedback: Feedback } }>(
      '/feedback/generate',
      { outfitId },
      token
    );
    return res.data.feedback;
  },

  async getFeedback(outfitId: string, token: string): Promise<Feedback> {
    const res = await apiClient.get<{ success: boolean; data: { feedback: Feedback } }>(
      `/feedback/${outfitId}`,
      token
    );
    return res.data.feedback;
  },
};
