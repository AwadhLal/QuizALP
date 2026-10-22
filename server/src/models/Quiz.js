import mongoose from 'mongoose';
const s = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '', maxlength: 600 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  durationMinutes: { type: Number, min: 1, max: 180, default: 10 },
  published: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  questionCount: { type: Number, default: 0 },
}, { timestamps: true });
s.index({ published: 1, createdAt: -1 });
export default mongoose.model('Quiz', s);
