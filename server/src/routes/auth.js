import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { HttpError, wrap } from '../middleware/error.js';
import { requireAuth } from '../middleware/auth.js';
const email = z.string().trim().toLowerCase().email('Enter a valid email address.').max(120);
const password = z.string().min(8, 'Password must be at least 8 characters.').max(100);
const registerSchema = z.object({ name: z.string().trim().min(2, 'Enter your name.').max(60), email, password });
const loginSchema = z.object({ email, password: z.string().min(1, 'Enter your password.').max(100) });
const token = u => jwt.sign({ sub: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = u => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const r = Router();
r.post('/register', wrap(async (req, res) => {
  const d = registerSchema.parse(req.body);
  if (await User.exists({ email: d.email })) throw new HttpError(409, 'An account with this email already exists.');
  const u = await User.create({ name: d.name, email: d.email, passwordHash: await bcrypt.hash(d.password, 12), role: 'user' });
  res.status(201).json({ token: token(u), user: pub(u) });
}));
r.post('/login', wrap(async (req, res) => {
  const d = loginSchema.parse(req.body);
  const u = await User.findOne({ email: d.email }).select('+passwordHash');
  if (!u || !(await bcrypt.compare(d.password, u.passwordHash))) throw new HttpError(401, 'Incorrect email or password.');
  res.json({ token: token(u), user: pub(u) });
}));
r.get('/me', requireAuth, (req, res) => res.json({ user: pub(req.user) }));
r.patch('/me', requireAuth, wrap(async (req, res) => {
  const { name } = z.object({ name: z.string().trim().min(2).max(60) }).parse(req.body);
  req.user.name = name; await req.user.save();
  res.json({ user: pub(req.user) });
}));
export default r;
