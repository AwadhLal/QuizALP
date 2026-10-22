import { ZodError } from 'zod';
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const notFound = (_req, _res, next) => next(new HttpError(404, 'Route not found.'));
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) return res.status(400).json({ message: err.issues[0]?.message || 'Invalid input.', field: err.issues[0]?.path?.join('.') });
  if (err.code === 11000) return res.status(409).json({ message: 'That value is already in use.' });
  if (err.name === 'CastError' || err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Malformed request.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request is too large.' });
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? 'Something went wrong on our side.' : err.message });
}
