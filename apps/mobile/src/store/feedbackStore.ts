import { create } from 'zustand';
import type { Feedback } from '@fitcheck/shared';

interface FeedbackState {
  // Cache: outfitId → Feedback
  cache: Record<string, Feedback>;
  generating: Set<string>;  // outfitIds currently being generated

  // Actions
  setFeedback: (outfitId: string, feedback: Feedback) => void;
  getFeedback: (outfitId: string) => Feedback | undefined;
  setGenerating: (outfitId: string, generating: boolean) => void;
  isGenerating: (outfitId: string) => boolean;
  clearCache: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  cache: {},
  generating: new Set(),

  setFeedback: (outfitId, feedback) =>
    set((state) => ({ cache: { ...state.cache, [outfitId]: feedback } })),

  getFeedback: (outfitId) => get().cache[outfitId],

  setGenerating: (outfitId, generating) =>
    set((state) => {
      const next = new Set(state.generating);
      if (generating) next.add(outfitId);
      else next.delete(outfitId);
      return { generating: next };
    }),

  isGenerating: (outfitId) => get().generating.has(outfitId),

  clearCache: () => set({ cache: {}, generating: new Set() }),
}));
