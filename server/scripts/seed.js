import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';
import Quiz from '../src/models/Quiz.js';
import Question from '../src/models/Question.js';
import QuizAttempt from '../src/models/QuizAttempt.js';
import data from './seed-data.js';

if (!process.env.MONGODB_URI) { console.error('Set MONGODB_URI in server/.env first.'); process.exit(1); }
await mongoose.connect(process.env.MONGODB_URI);
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

for (const c of data) {
  const cat = await Category.findOneAndUpdate({ slug: slugify(c.name) }, { name: c.name, slug: slugify(c.name), description: c.description, icon: c.icon }, { upsert: true, new: true });
  const slug = slugify(c.quiz.title);
  if (await Quiz.exists({ slug })) continue; // idempotent: never overwrite edited quizzes
  const quiz = await Quiz.create({ title: c.quiz.title, slug, description: c.quiz.description, category: cat._id, difficulty: c.quiz.difficulty, durationMinutes: c.quiz.minutes, published: true, featured: !!c.quiz.featured, questionCount: c.quiz.questions.length });
  await Question.insertMany(c.quiz.questions.map(([text, options, correctIndex, explanation]) => ({ quiz: quiz._id, text, options, correctIndex, explanation })));
}
console.log('Categories and sample quizzes ready.');

const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  if (ADMIN_PASSWORD.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters.');
  await User.findOneAndUpdate({ email: ADMIN_EMAIL.toLowerCase() }, { name: 'Admin', role: 'admin', $setOnInsert: { passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12) } }, { upsert: true });
  console.log(`Admin account ready: ${ADMIN_EMAIL}`);
} else console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set: no admin account created.');

// Optional capacity check: npm run seed -- --demo-users=100
const arg = process.argv.find(a => a.startsWith('--demo-users='));
if (arg) {
  const n = Math.min(1000, parseInt(arg.split('=')[1]) || 0);
  const hash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10); // random, nobody can log in as demo users
  const quizzes = await Quiz.find({ published: true }).select('_id questionCount').lean();
  for (let i = 1; i <= n; i++) {
    const u = await User.findOneAndUpdate({ email: `demo${i}@example.invalid` }, { $setOnInsert: { name: `Demo User ${i}`, passwordHash: hash, role: 'user' } }, { upsert: true, new: true });
    if (await QuizAttempt.exists({ user: u._id })) continue;
    const docs = Array.from({ length: 10 }, () => {
      const q = quizzes[Math.floor(Math.random() * quizzes.length)], total = q.questionCount, score = Math.floor(Math.random() * (total + 1));
      return { user: u._id, quiz: q._id, total, score, percentage: Math.round(score / total * 100), status: 'submitted', submittedAt: new Date(Date.now() - Math.random() * 30 * 864e5), expiresAt: new Date() };
    });
    await QuizAttempt.insertMany(docs);
  }
  console.log(`${n} demo users with 10 attempts each ready (emails end in @example.invalid).`);
}
await mongoose.disconnect();
