const rateLimit = require('express-rate-limit');
const { rateLimit: rateLimitConfig } = require('../config/config');

// Create rate limiter
const limiter = rateLimit({
    windowMs: rateLimitConfig.windowMs,
    max: rateLimitConfig.maxRequests,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = limiter;