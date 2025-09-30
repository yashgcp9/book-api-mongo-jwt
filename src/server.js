/* Express + MongoDB + JWT */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const auth = require('./middleware/auth');

const app = express();

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));
app.use(helmet());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'book-api-mongo-jwt', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

// Public read endpoints
app.use('/api/books', auth(false), bookRoutes);

// 404 + error handlers
app.use((req, res, next) => res.status(404).json({ error: 'Not Found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  try {
    if (!MONGODB_URI) throw new Error('MONGODB_URI missing');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`API listening on ${PORT}`));
  } catch (e) {
    console.error('Failed to start:', e.message);
    process.exit(1);
  }
}

start();
