const crypto = require("crypto");
const bcrypt = require("bcryptjs");

/**
 * Generate a 6-digit OTP
 * Uses crypto for secure random number generation
 * @returns {string} - 6-digit OTP string
 */
function generateOTP() {
  // Generate random number between 100000 and 999999
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hash OTP for secure storage
 * @param {string} otp - Plain text OTP
 * @returns {Promise<string>} - Hashed OTP
 */
async function hashOTP(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

/**
 * Verify OTP against stored hash
 * @param {string} inputOTP - User-provided OTP
 * @param {string} hashedOTP - Stored hashed OTP
 * @returns {Promise<boolean>} - True if OTP matches
 */
async function verifyOTP(inputOTP, hashedOTP) {
  return bcrypt.compare(inputOTP, hashedOTP);
}

module.exports = { generateOTP, hashOTP, verifyOTP };
