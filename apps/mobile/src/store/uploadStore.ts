import { create } from 'zustand';
import type { Occasion } from '@fitcheck/shared';

type UploadStep = 'idle' | 'picking' | 'preview' | 'occasion' | 'uploading' | 'generating' | 'done' | 'error';

interface UploadState {
  step: UploadStep;
  imageUri: string | null;
  imageMimeType: string;
  occasion: Occasion | null;
  notes: string;
  uploadProgress: number;  // 0-100
  outfitId: string | null;
  error: string | null;

  // Actions
  setImage: (uri: string, mimeType: string) => void;
  setOccasion: (occasion: Occasion) => void;
  setNotes: (notes: string) => void;
  setProgress: (progress: number) => void;
  setStep: (step: UploadStep) => void;
  setOutfitId: (id: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  step: 'idle' as UploadStep,
  imageUri: null,
  imageMimeType: 'image/jpeg',
  occasion: null,
  notes: '',
  uploadProgress: 0,
  outfitId: null,
  error: null,
};

export const useUploadStore = create<UploadState>((set) => ({
  ...initialState,

  setImage: (uri, mimeType) => set({ imageUri: uri, imageMimeType: mimeType, step: 'preview' }),
  setOccasion: (occasion) => set({ occasion }),
  setNotes: (notes) => set({ notes }),
  setProgress: (uploadProgress) => set({ uploadProgress }),
  setStep: (step) => set({ step }),
  setOutfitId: (outfitId) => set({ outfitId }),
  setError: (error) => set({ error, step: error ? 'error' : 'idle' }),
  reset: () => set(initialState),
}));
