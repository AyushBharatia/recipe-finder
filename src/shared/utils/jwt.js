const jwt = require("jsonwebtoken");

// Generate JWT token for a user
// Takes userId (MongoDB ObjectId) and returns JWT token string
function generateToken(userId) {
  const payload = { userId };
  const secret = process.env.JWT_SECRET;
  const options = {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  };

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  return jwt.sign(payload, secret, options);
}

// Verify and decode JWT token
// Takes token string and returns decoded payload object
// Throws error if token is invalid or expired
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
