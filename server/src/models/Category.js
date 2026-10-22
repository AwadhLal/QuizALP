import mongoose from 'mongoose';
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '', maxlength: 300 },
  icon: { type: String, default: 'BookOpen' },
}, { timestamps: true });
export default mongoose.model('Category', s);
