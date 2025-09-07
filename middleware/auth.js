const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

const auth = async (req, res, next) => {
  // console.log('Auth called');
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id || decoded._id).select('-password'); 

    if (!req.user) {
      console.error('Auth middleware: User not found for decoded ID:', decoded.id || decoded._id);
      return res.status(401).json({ error: 'Not authorized, user not found.' });
    }
    // Attach isAdmin for downstream checks
    req.user.isAdmin = req.user.role === 'admin' || req.user.role === 'super admin';
    // console.log(`Auth middleware: User ID ${req.user._id} attached to req.user. isAdmin: ${req.user.isAdmin}`);
    // req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware token error:', err.message);
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Not authorized, token expired.' });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Not authorized, invalid token.' });
    }
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

function authorizeRoles(req, res, next) {
  // console.log('authorizeRoles called');
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super admin')) {
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
}

module.exports = { auth, authorizeRoles };