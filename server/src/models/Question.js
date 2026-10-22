import mongoose from 'mongoose';
const s = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
  text: { type: String, required: true, maxlength: 500 },
  options: { type: [String], validate: v => v.length >= 2 && v.length <= 6 },
  // Never returned unless a query explicitly selects them (server-side grading / review only).
  correctIndex: { type: Number, required: true, select: false },
  explanation: { type: String, default: '', maxlength: 1000, select: false },
}, { timestamps: true });
export default mongoose.model('Question', s);
