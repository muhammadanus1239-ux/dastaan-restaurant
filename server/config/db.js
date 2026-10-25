const mongoose = require('mongoose');

let connectionPromise = null;

const connectDB = () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === '' || mongoUri.includes('<username>') || mongoUri.includes('<password>')) {
    const message = 'MongoDB connection failed: MONGO_URI is missing or still uses a placeholder value.';
    console.error(message);
    return Promise.reject(new Error(message));
  }

  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 })
    .then((conn) => {
      console.log('MongoDB connected');
      console.log(`MongoDB host: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error('MongoDB connection error:', error.message);
      console.error('Error name:', error.name);
      if (error.reason && error.reason.servers) {
        error.reason.servers.forEach((desc, host) => {
          console.error('Server', host, '->', desc.error ? desc.error.message : desc.type);
        });
      }
      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;