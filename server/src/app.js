import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
const origins = (process.env.CLIENT_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim());
app.set('trust proxy', 1); // free hosts sit behind a proxy; needed for correct per-IP rate limits
app.use(helmet());
app.use(cors({ origin: (o, cb) => cb(null, !o || origins.includes(o)) }));
app.use(express.json({ limit: '100kb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many attempts. Try again in a few minutes.' } }), authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
