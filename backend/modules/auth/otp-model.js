const mongoose = require("mongoose");

// OTP Schema for email-based multi-factor authentication
// Uses MongoDB TTL index for automatic expiry
const otpSchema = new mongoose.Schema({
  // For login: references existing user
  // For registration: null (user doesn't exist yet)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true, // Stored as hashed value
  },
  purpose: {
    type: String,
    enum: ["login", "register", "password-reset"],
    default: "login",
  },
  // Store pending registration data (only for purpose: "register")
  pendingUserData: {
    name: String,
    password: String, // Already hashed
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // TTL: 5 minutes (300 seconds) - document auto-deletes after expiry
  },
});

// Index for faster lookups
otpSchema.index({ email: 1, purpose: 1 });
otpSchema.index({ userId: 1, purpose: 1 });

// Create and export OTP model
const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;
