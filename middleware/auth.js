const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const auth = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Authorization header missing or invalid');
      return res.status(401).send('Access Denied. No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded Token:', decoded);
      req.user = decoded;

      // Check if the user's role is authorized
      if (roles.length && !roles.includes(req.user.role)) {
        console.error('Access Denied. User does not have the required role');
        return res.status(403).send('Access Denied. You do not have the required role');
      }

      next();
    } catch (error) {
      console.error('Token Verification Error:', error.message);
      res.status(400).send('Invalid token');
    }
  };
};

module.exports = auth;