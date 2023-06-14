const crypto = require('crypto');

const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString('hex');
};

const jwtSecret = generateRandomString(32); 

module.exports = {
    JWT_SECRET: jwtSecret,
    JWT_EXPIRATION_TIME: {expiresIn: '24h' }
};
  