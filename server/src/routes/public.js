import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import Category from '../models/Category.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { HttpError, wrap } from '../middleware/error.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { gradeAttempt, buildResult } from '../services/scoring.js';

const r = Router();
const GRACE_MS = 30000;
const card = 'title slug description difficulty durationMinutes questionCount featured createdAt category';
const oid = id => { if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Not found.'); return id; };
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const paging = q => ({ page: Math.max(1, parseInt(q.page) || 1), limit: Math.min(50, Math.max(1, parseInt(q.limit) || 12)) });

r.get('/categories', wrap(async (_req, res) => {
  const counts = await Quiz.aggregate([{ $match: { published: true } }, { $group: { _id: '$category', n: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map(c => [String(c._id), c.n]));
  const cats = await Category.find().sort('name').lean();
  res.json(cats.map(c => ({ ...c, quizCount: map[String(c._id)] || 0 })));
}));

r.get('/quizzes', wrap(async (req, res) => {
  const { page, limit } = paging(req.query);
  const { category, q, difficulty, featured, sort } = req.query;
  const f = { published: true };
  if (typeof category === 'string' && category) {
    const c = await Category.findOne({ slug: category }).select('_id');
    if (!c) return res.json({ items: [], total: 0, page, pages: 0 });
    f.category = c._id;
  }
  if (typeof q === 'string' && q.trim()) f.title = new RegExp(q.trim().slice(0, 50).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (['Easy', 'Medium', 'Hard'].includes(difficulty)) f.difficulty = difficulty;
  if (featured === 'true') f.featured = true;
  const [items, total] = await Promise.all([
    Quiz.find(f).sort(sort === 'new' ? '-createdAt' : '-featured -createdAt').skip((page - 1) * limit).limit(limit).select(card).populate('category', 'name slug').lean(),
    Quiz.countDocuments(f),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));

r.get('/quizzes/daily', wrap(async (_req, res) => {
  const items = await Quiz.find({ published: true }).sort('_id').select(card).populate('category', 'name slug').lean();
  res.json(items.length ? items[Math.floor(Date.now() / 864e5) % items.length] : null);
}));

r.get('/quizzes/:slug', wrap(async (req, res) => {
  const quiz = await Quiz.findOne({ slug: req.params.slug, published: true }).select(card).populate('category', 'name slug').lean();
  if (!quiz) throw new HttpError(404, 'Quiz not found.');
  res.json(quiz);
}));

r.post('/quizzes/:id/start', optionalAuth, wrap(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: oid(req.params.id), published: true });
  if (!quiz) throw new HttpError(404, 'Quiz not found.');
  if (req.user) { // resume an unfinished attempt after a refresh or interruption
    const open = await QuizAttempt.findOne({ user: req.user._id, quiz: quiz._id, status: 'in_progress', expiresAt: { $gt: new Date() } });
    if (open) return res.json({ attemptId: open.id });
  }
  const ids = (await Question.find({ quiz: quiz._id }).select('_id').lean()).map(q => q._id);
  if (!ids.length) throw new HttpError(409, 'This quiz has no questions yet.');
  const a = await QuizAttempt.create({ user: req.user?._id, quiz: quiz._id, questionIds: shuffle(ids), total: ids.length, expiresAt: new Date(Date.now() + quiz.durationMinutes * 60000) });
  res.status(201).json({ attemptId: a.id });
}));

async function loadAttempt(req) {
  const a = await QuizAttempt.findById(oid(req.params.id));
  if (!a) throw new HttpError(404, 'Attempt not found.');
  if (a.user && String(a.user) !== String(req.user?._id)) throw new HttpError(403, 'This attempt belongs to another account.');
  return a;
}

r.get('/attempts/:id', optionalAuth, wrap(async (req, res) => {
  const a = await loadAttempt(req);
  const quiz = await Quiz.findById(a.quiz).select('title slug difficulty durationMinutes category').populate('category', 'name slug').lean();
  const base = { status: a.status, quiz, expiresAt: a.expiresAt };
  if (a.status === 'submitted') return res.json({ ...base, result: await buildResult(a) });
  const qs = await Question.find({ _id: { $in: a.questionIds } }).select('text options').lean(); // answers are not selected
  const by = new Map(qs.map(q => [String(q._id), q]));
  res.json({ ...base, questions: a.questionIds.map(i => by.get(String(i))).filter(Boolean).map(q => ({ id: q._id, text: q.text, options: q.options })) });
}));

r.post('/attempts/:id/submit', optionalAuth, wrap(async (req, res) => {
  const { answers } = z.object({ answers: z.record(z.string(), z.number().int().min(0).max(5)) }).parse(req.body);
  const a = await loadAttempt(req);
  if (a.status !== 'in_progress') throw new HttpError(409, 'This attempt was already submitted.');
  const g = await gradeAttempt(a, answers);
  // Atomic claim: only one request can flip in_progress -> submitted, which blocks duplicate submissions.
  const done = await QuizAttempt.findOneAndUpdate(
    { _id: a._id, status: 'in_progress' },
    { $set: { ...g, status: 'submitted', submittedAt: new Date(), timedOut: Date.now() > a.expiresAt.getTime() + GRACE_MS } },
    { new: true });
  if (!done) throw new HttpError(409, 'This attempt was already submitted.');
  res.json(await buildResult(done));
}));

r.get('/me/attempts', requireAuth, wrap(async (req, res) => {
  const { page, limit } = paging({ ...req.query, limit: req.query.limit || 10 });
  const f = { user: req.user._id, status: 'submitted' };
  const [items, total] = await Promise.all([
    QuizAttempt.find(f).sort('-submittedAt').skip((page - 1) * limit).limit(limit).select('quiz score total percentage submittedAt').populate('quiz', 'title slug').lean(),
    QuizAttempt.countDocuments(f),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));

r.get('/me/stats', requireAuth, wrap(async (req, res) => {
  const [s] = await QuizAttempt.aggregate([
    { $match: { user: req.user._id, status: 'submitted' } },
    { $group: { _id: null, attempts: { $sum: 1 }, average: { $avg: '$percentage' }, best: { $max: '$percentage' }, quizzes: { $addToSet: '$quiz' } } },
  ]);
  res.json({ attempts: s?.attempts || 0, average: Math.round(s?.average || 0), best: s?.best || 0, completedQuizzes: s?.quizzes.length || 0 });
}));
export default r;
