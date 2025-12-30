import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import chaptersRouter from './routes/chapters';
import choicesRouter from './routes/choices';
import sketchesRouter from './routes/sketches';
import adminRouter from './routes/admin';
import orchestratorRouter from './routes/orchestrator';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://reversion-ladder-wnp6.vercel.app',
  process.env.CORS_ORIGIN
].filter((origin): origin is string => Boolean(origin));

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10mb' }));

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Routes
app.use('/api/chapters', chaptersRouter);
app.use('/api/choices', choicesRouter);
app.use('/api/sketches', sketchesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/orchestrator', orchestratorRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Reversion Ladder API running on port ${PORT}`);
});
