import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// Load env before importing any services (they read process.env at module init)
dotenv.config();

import { authRoutes } from './routes/authRoutes';
import { userRoutes } from './routes/userRoutes';
import { outfitRoutes } from './routes/outfitRoutes';
import { feedbackRoutes } from './routes/feedbackRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static uploads (mock mode only) ──────────────────────────────────────────
if (process.env.USE_MOCK_SERVICES === 'true') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/outfits', outfitRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/admin', adminRoutes);

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  const isMock = process.env.USE_MOCK_SERVICES === 'true';
  console.log(`\n🚀 FitCheck API running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   DB Mode     : ${isMock ? '🗄️  Mock (local JSON)' : '☁️  Supabase'}`);
  console.log(`   Storage     : ${isMock ? '📁 Local /uploads' : '☁️  Supabase Storage'}`);
  console.log(`   Groq AI     : ${process.env.GROQ_API_KEY ? '✅ Connected' : '⚠️  Mock mode'}\n`);
});

export default app;
