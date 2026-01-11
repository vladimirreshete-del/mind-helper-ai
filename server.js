import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (PostgreSQL)
// On Render, simply add a PostgreSQL database and link it. 
// It will automatically provide the 'DATABASE_URL' env variable.
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// --- API ROUTES EXAMPLE ---

// 1. Get User Data
app.get('/api/users/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    // Example query:
    // const result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    // res.json(result.rows[0]);
    
    // Mock response until DB is set up
    res.json({ status: 'ok', message: `Data for ${telegramId}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 2. Save Mood
app.post('/api/mood', async (req, res) => {
  try {
    const { userId, score, emotions, note } = req.body;
    // await pool.query('INSERT INTO mood_entries ...');
    res.json({ status: 'saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save mood' });
  }
});

// 3. Payment Webhook (Example for Stripe/Yookassa)
app.post('/api/webhook/payment', async (req, res) => {
    // Validate signature and update user tariff in DB
    console.log("Payment received", req.body);
    res.sendStatus(200);
});

// --- SERVE FRONTEND ---

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - return index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});