import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google GenAI Client (Server Side)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Prompts & Constants (Moved to server for security)
const SYSTEM_INSTRUCTION_BASE = `
Ты - MindHelper AI, профессиональный и эмпатичный ИИ-психолог.
Твоя цель: Оказывать психологическую поддержку, помогать в самопознании и управлении эмоциями.
Ты НЕ врач и НЕ можешь выписывать лекарства или ставить официальные диагнозы. Если ситуация критическая, ты должен мягко направить человека к специалистам.

Твои основные принципы:
1. Эмпатия и принятие.
2. Безоценочность.
3. Конфиденциальность (симулированная).
4. Этичность.

Если пользователь упоминает суицид, селфхарм или насилие, ты ОБЯЗАН:
1. Выразить сочувствие и поддержку.
2. Предложить немедленно обратиться в экстренные службы.
3. Предоставить контакты доверия.
`;

const PERSONA_PROMPTS = {
  'empathic': "Используй подход, основанный на активном слушании, валидации эмоций и теплой поддержке. Твой тон мягкий и успокаивающий.",
  'cbt': "Используй методы Когнитивно-Поведенческой Терапии (КПТ). Помогай пользователю находить когнитивные искажения, анализировать автоматические мысли и искать альтернативные взгляды. Будь структурированным.",
  'mindfulness': "Фокусируйся на осознанности, дыхании и присутствии в моменте. Предлагай короткие практики заземления. Твой тон медленный и медитативный.",
  'coach': "Используй техники мотивационного интервьюирования. Помогай ставить цели, искать ресурсы и преодолевать барьеры. Будь энергичным и вдохновляющим."
};

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize Database Tables
const initDb = async () => {
  try {
    console.log('Initializing database...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        telegram_id BIGINT UNIQUE NOT NULL,
        first_name TEXT,
        username TEXT,
        tariff VARCHAR(50) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS mood_entries (
        id SERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(telegram_id),
        score INTEGER,
        emotions TEXT[],
        note TEXT,
        date TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Database tables ready.');
  } catch (err) {
    console.error('Error initializing database. Ensure DATABASE_URL is set correctly.', err);
  }
};

// Run DB Init on startup
initDb();

// --- API ROUTES ---

// 1. Chat Endpoint (Gemini Proxy)
app.post('/api/chat', async (req, res) => {
    try {
        const { history, message, persona, tariff } = req.body;

        let specificInstruction = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS['empathic'];
        
        if (tariff === 'free') {
            specificInstruction += "\n[ОГРАНИЧЕНИЕ ТАРИФА: Твои ответы должны быть краткими и общими. Не углубляйся в детальный психоанализ. Напоминай иногда, что это пробная версия.]";
        } else if (tariff === 'pro' || tariff === 'premium') {
             specificInstruction += "\n[ТВОЙ УРОВЕНЬ: Максимально глубокий и персонализированный анализ.]";
        }

        const systemInstruction = `${SYSTEM_INSTRUCTION_BASE}\n\nСпециализация на текущую сессию: ${specificInstruction}`;
        
        // Use flash model for speed and efficiency as per guidelines for text tasks
        const modelName = tariff === 'premium' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

        // Prepare contents
        const contents = [
            ...history.slice(-10).map(msg => ({ 
                role: msg.role,
                parts: [{ text: msg.text }]
            })),
            {
                role: 'user',
                parts: [{ text: message }]
            }
        ];

        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
            }
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to generate response from AI" });
    }
});

// 2. Get User Data
app.get('/api/users/:telegramId', async (req, res) => {
  try {
    const { telegramId } = req.params;
    
    // Check if user exists, if not create
    let result = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    
    if (result.rows.length === 0) {
       // Create new user automatically
       result = await pool.query(
         'INSERT INTO users (telegram_id, tariff) VALUES ($1, $2) RETURNING *',
         [telegramId, 'free']
       );
    }
    
    res.json({ status: 'ok', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 3. Save Mood
app.post('/api/mood', async (req, res) => {
  try {
    const { userId, score, emotions, note } = req.body;
    
    // Ensure user exists first
    const userCheck = await pool.query('SELECT * FROM users WHERE telegram_id = $1', [userId]);
    if (userCheck.rows.length === 0) {
        await pool.query('INSERT INTO users (telegram_id) VALUES ($1)', [userId]);
    }

    await pool.query(
      'INSERT INTO mood_entries (user_id, score, emotions, note) VALUES ($1, $2, $3, $4)',
      [userId, score, emotions, note]
    );
    res.json({ status: 'saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save mood' });
  }
});

// 4. Payment Webhook (Stub)
app.post('/api/webhook/payment', async (req, res) => {
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