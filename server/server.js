const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const connectDB = require('./config/db');

// Load environment variables from server/.env explicitly, with a fallback for root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB if MONGO_URI is defined, non-empty, and real (not placeholder)
const mongoUri = process.env.MONGO_URI;
if (mongoUri && mongoUri.trim() !== '' && !mongoUri.includes('<username>') && !mongoUri.includes('<password>')) {
  connectDB()
    .then(() => {
      console.log('MongoDB bootstrap completed.');
    })
    .catch((error) => {
      console.error('Database bootstrap failed:', error.message);
    });
} else {
  console.log('Notice: MONGO_URI is not configured with real cluster credentials yet.');
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Wait for the DB connection before handling each request (needed on Vercel serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error('DB not ready:', e.message);
  }
  next();
});

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 1. Health check route with MongoDB status (A2 Q2 & Task 2 requirement)
app.get('/api/health', (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    server: 'running',
    port: PORT,
    mongoConnected: isMongoConnected,
    mongoStatus: isMongoConnected ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});

// 2. Auth routes (A2 Q5)
app.use('/api/auth', require('./routes/authRoutes'));

// 3. Menu routes (A2 Q4)
app.use('/api/menu', require('./routes/menuRoutes'));

// 4. Orders routes (A2 Q7)
app.use('/api/orders', require('./routes/orderRoutes'));

// 5. Reservations routes (A2 Q7)
app.use('/api/reservations', require('./routes/reservationRoutes'));

// 6. Tables route (Endpoint 10)
app.use('/api/tables', require('./routes/tableRoutes'));

// 7. Cart routes (saves add-to-cart data in MongoDB)
app.use('/api/cart', require('./routes/cart'));

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Global 500 error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start the server (bind to 0.0.0.0 so devices on same Wi-Fi can access)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DASTAAN Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;