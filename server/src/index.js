import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
for (const k of ['MONGODB_URI', 'JWT_SECRET']) if (!process.env[k]) { console.error(`Missing ${k}. Copy .env.example to .env and fill it in.`); process.exit(1); }
if (process.env.JWT_SECRET.length < 32) { console.error('JWT_SECRET must be at least 32 characters.'); process.exit(1); }
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`QuizALP API listening on :${port}`));
