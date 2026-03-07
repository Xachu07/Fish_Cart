const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// CORS: allow comma-separated origins (e.g. FRONTEND_URL="http://localhost:5173,https://fishcart.vercel.app")
// or a single origin. When deploying backend, set FRONTEND_URL to https://fishcart.vercel.app (and add localhost for local dev if needed).
const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

// Database
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/shop', require('./routes/shop'));
app.use('/api/areas', require('./routes/areas'));
app.use('/api/partner', require('./routes/partner'));
app.use('/api/admin', require('./routes/adminUsers'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

