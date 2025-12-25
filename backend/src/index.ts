import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import chaptersRouter from './routes/chapters';
import choicesRouter from './routes/choices';
import sketchesRouter from './routes/sketches';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
  ].filter(Boolean)
}));
app.use(express.json());

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Routes
app.use('/api/chapters', chaptersRouter);
app.use('/api/choices', choicesRouter);
app.use('/api/sketches', sketchesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Reversion Ladder API running on port ${PORT}`);
});
