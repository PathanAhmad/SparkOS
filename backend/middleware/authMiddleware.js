const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No token provided.");
      return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure `req.user` is set properly
    if (!decoded || !decoded.userId) {
      console.log("Token decoded but missing `userId`:", decoded);
      return res.status(401).json({ message: 'Invalid token structure.' });
    }

    req.user = { _id: decoded.userId, role: decoded.role };  // Ensure `_id` is attached

    console.log(`User authenticated: ${req.user._id}`);
    next();
  } catch (error) {
    console.error('authMiddleware error:', error);
    return res.status(401).json({ message: 'Token is not valid.' });
  }
};
