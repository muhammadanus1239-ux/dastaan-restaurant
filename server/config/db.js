const mongoose = require('mongoose');

const connectDB = () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('<username>') || mongoUri.includes('<password>')) {
    const message = 'MongoDB connection failed: MONGO_URI is missing or still uses a placeholder value.';
    console.error(message);
    return Promise.reject(new Error(message));
  }

  return mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000
  })
    .then((conn) => {
      console.log('MongoDB connected');
      console.log(`MongoDB host: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error.message);
      throw error;
    });
};

module.exports = connectDB;
