const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION_TIME } = require('./config');

const jwtMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token' });
    }
  
    try {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(403).json({ message: 'Forbidden: Invalid Token' });
        }
        req.user = decoded;
        next();
      });
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
};
module.exports = jwtMiddleware;