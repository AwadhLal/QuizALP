import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { HttpError, wrap } from '../middleware/error.js';
import { requireAdmin } from '../middleware/auth.js';

const r = Router();
r.use(requireAdmin); // every admin API requires a valid token AND role === 'admin'
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'item';
const paging = q => ({ page: Math.max(1, parseInt(q.page) || 1), limit: Math.min(100, Math.max(1, parseInt(q.limit) || 20)) });
const idParam = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id.');

const catSchema = z.object({ name: z.string().trim().min(2).max(60), description: z.string().trim().max(300).default(''), icon: z.string().trim().max(30).default('BookOpen') });
const quizSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(600).default(''),
  category: idParam,
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  durationMinutes: z.number().int().min(1).max(180),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  questions: z.array(z.object({
    text: z.string().trim().min(3).max(500),
    options: z.array(z.string().trim().min(1).max(200)).min(2).max(6),
    correctIndex: z.number().int().min(0),
    explanation: z.string().trim().max(1000).default(''),
  }).refine(q => q.correctIndex < q.options.length, 'Correct answer must match one of the options.')).min(1, 'Add at least one question.').max(100),
});

r.get('/stats', wrap(async (_req, res) => {
  const [users, quizzes, published, attempts, avg, top] = await Promise.all([
    User.countDocuments(), Quiz.countDocuments(), Quiz.countDocuments({ published: true }),
    QuizAttempt.countDocuments({ status: 'submitted' }),
    QuizAttempt.aggregate([{ $match: { status: 'submitted' } }, { $group: { _id: null, a: { $avg: '$percentage' } } }]),
    QuizAttempt.aggregate([{ $match: { status: 'submitted' } }, { $group: { _id: '$quiz', attempts: { $sum: 1 }, average: { $avg: '$percentage' } } }, { $sort: { attempts: -1 } }, { $limit: 5 },
      { $lookup: { from: 'quizzes', localField: '_id', foreignField: '_id', as: 'q' } }, { $project: { attempts: 1, average: { $round: ['$average', 0] }, title: { $arrayElemAt: ['$q.title', 0] } } }]),
  ]);
  res.json({ users, quizzes, published, attempts, averageScore: Math.round(avg[0]?.a || 0), top });
}));

r.get('/users', wrap(async (req, res) => {
  const { page, limit } = paging(req.query);
  const [items, total] = await Promise.all([User.find().sort('-createdAt').skip((page - 1) * limit).limit(limit).select('name email role createdAt').lean(), User.countDocuments()]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));

r.post('/categories', wrap(async (req, res) => {
  const d = catSchema.parse(req.body);
  res.status(201).json(await Category.create({ ...d, slug: slugify(d.name) }));
}));
r.put('/categories/:id', wrap(async (req, res) => {
  const d = catSchema.parse(req.body);
  const c = await Category.findByIdAndUpdate(idParam.parse(req.params.id), { ...d, slug: slugify(d.name) }, { new: true });
  if (!c) throw new HttpError(404, 'Category not found.');
  res.json(c);
}));
r.delete('/categories/:id', wrap(async (req, res) => {
  const id = idParam.parse(req.params.id);
  if (await Quiz.exists({ category: id })) throw new HttpError(409, 'Move or delete the quizzes in this category first.');
  await Category.findByIdAndDelete(id);
  res.status(204).end();
}));

r.get('/quizzes', wrap(async (req, res) => {
  const { page, limit } = paging(req.query);
  const [items, total] = await Promise.all([Quiz.find().sort('-createdAt').skip((page - 1) * limit).limit(limit).populate('category', 'name').lean(), Quiz.countDocuments()]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));
r.get('/quizzes/:id', wrap(async (req, res) => {
  const id = idParam.parse(req.params.id);
  const quiz = await Quiz.findById(id).lean();
  if (!quiz) throw new HttpError(404, 'Quiz not found.');
  const questions = await Question.find({ quiz: id }).select('+correctIndex +explanation').sort('_id').lean();
  res.json({ ...quiz, questions });
}));

async function saveQuestions(quizId, questions) {
  await Question.deleteMany({ quiz: quizId });
  await Question.insertMany(questions.map(q => ({ ...q, quiz: quizId })));
  await Quiz.updateOne({ _id: quizId }, { questionCount: questions.length });
}
r.post('/quizzes', wrap(async (req, res) => {
  const { questions, ...d } = quizSchema.parse(req.body);
  if (!(await Category.exists({ _id: d.category }))) throw new HttpError(400, 'Choose a valid category.');
  let slug = slugify(d.title);
  if (await Quiz.exists({ slug })) slug += '-' + Date.now().toString(36);
  const quiz = await Quiz.create({ ...d, slug });
  await saveQuestions(quiz._id, questions);
  res.status(201).json(await Quiz.findById(quiz._id));
}));
r.put('/quizzes/:id', wrap(async (req, res) => {
  const id = idParam.parse(req.params.id);
  const { questions, ...d } = quizSchema.parse(req.body);
  const quiz = await Quiz.findByIdAndUpdate(id, d, { new: true });
  if (!quiz) throw new HttpError(404, 'Quiz not found.');
  await saveQuestions(id, questions);
  res.json(await Quiz.findById(id));
}));
r.patch('/quizzes/:id/publish', wrap(async (req, res) => {
  const { published } = z.object({ published: z.boolean() }).parse(req.body);
  const quiz = await Quiz.findById(idParam.parse(req.params.id));
  if (!quiz) throw new HttpError(404, 'Quiz not found.');
  if (published && !quiz.questionCount) throw new HttpError(409, 'Add questions before publishing.');
  quiz.published = published; await quiz.save();
  res.json(quiz);
}));
r.delete('/quizzes/:id', wrap(async (req, res) => {
  const id = idParam.parse(req.params.id);
  await Promise.all([Question.deleteMany({ quiz: id }), QuizAttempt.deleteMany({ quiz: id })]);
  await Quiz.findByIdAndDelete(id);
  res.status(204).end();
}));
export default r;
