import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { HttpError, wrap } from './error.js';
async function read(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  try { return await User.findById(jwt.verify(h.slice(7), process.env.JWT_SECRET).sub); } catch { return null; }
}
export const optionalAuth = wrap(async (req, _res, next) => { req.user = await read(req); next(); });
export const requireAuth = wrap(async (req, _res, next) => {
  req.user = await read(req);
  if (!req.user) throw new HttpError(401, 'Please sign in to continue.');
  next();
});
export const requireAdmin = [requireAuth, (req, _res, next) => req.user.role === 'admin' ? next() : next(new HttpError(403, 'Admin access required.'))];
