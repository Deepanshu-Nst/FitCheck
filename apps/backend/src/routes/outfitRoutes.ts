import { Router } from 'express';
import multer from 'multer';
import { uploadOutfit, getHistory, getOutfit } from '../controllers/outfitController';
import { authenticate } from '../middleware/authMiddleware';

// Store image in memory buffer for Supabase upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export const outfitRoutes = Router();

outfitRoutes.use(authenticate);
outfitRoutes.post('/upload', upload.single('image'), uploadOutfit);
outfitRoutes.get('/history', getHistory);
outfitRoutes.get('/:id', getOutfit);
