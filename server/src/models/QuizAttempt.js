import mongoose from 'mongoose';
const s = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionIds: [mongoose.Schema.Types.ObjectId],
  status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' },
  expiresAt: { type: Date, required: true },
  answers: [{ _id: false, question: mongoose.Schema.Types.ObjectId, selected: Number }],
  score: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  timedOut: { type: Boolean, default: false },
  submittedAt: Date,
}, { timestamps: true });
s.index({ user: 1, status: 1, submittedAt: -1 });
s.index({ quiz: 1 });
export default mongoose.model('QuizAttempt', s);
