const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 * Limits requests to prevent abuse
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: {
    message: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
});

/**
 * OTP verification rate limiter
 * Prevents OTP brute force attacks
 */
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 OTP verification attempts per 5 minutes
  message: {
    message: "Too many OTP verification attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP resend rate limiter
 * Prevents OTP email spam
 */
const resendOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 resend requests per 5 minutes
  message: {
    message: "Too many OTP resend requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, otpLimiter, resendOtpLimiter };
