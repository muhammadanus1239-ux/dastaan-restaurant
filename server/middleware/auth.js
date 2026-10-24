const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

// Protect routes: verifies Bearer token in Authorization header
const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header with Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      // Extract token after "Bearer "
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, no token provided'
        });
      }

      // Verify token
      const secret = process.env.JWT_SECRET || 'dastaan_jwt_super_secret_key_2026';
      const decoded = jwt.verify(token, secret);

      // If MongoDB is connected, fetch fresh user from DB; otherwise use verified JWT payload
      let user = null;
      if (mongoose.connection.readyState === 1) {
        try {
          user = await User.findById(decoded.id).select('-password');
        } catch (err) {
          user = null;
        }
      }

      if (!user) {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          name: decoded.name || 'User',
          email: decoded.email || '',
          role: decoded.role || 'customer'
        };
      } else {
        req.user = user;
      }

      return next();
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token'
      });
    }
  }

  // No authorization header provided
  return res.status(401).json({
    success: false,
    message: 'Not authorized, no token provided'
  });
};

// Manager role check: only allows manager role through
const managerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied: Manager role required'
  });
};

module.exports = {
  protect,
  managerOnly
};
