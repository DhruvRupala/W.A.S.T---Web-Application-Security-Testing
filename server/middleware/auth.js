const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Auth Error: No token provided' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired', requireLogout: true });
    }
    console.error('Auth Middleware Error:', e);
    res.status(401).json({ message: 'Invalid Token', requireLogout: true });
  }
};
