const rateLimit = require("express-rate-limit");

/**
 * Applied to POST /user/login and POST /user/register.
 * 10 attempts per 15-minute window per IP (failed requests only).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  validate: {
    trustProxy: false,
  },
  message: {
    message: "Too many attempts from this IP, please try again after 15 minutes.",
  },
});

/**
 * General limiter — available if you need a global ceiling on any route group.
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
  },
  message: {
    message: "Too many requests from this IP, please slow down.",
  },
});

module.exports = { authLimiter, generalLimiter };
