// Helper function for parsing integers
const parseIntWithDefault = (value, defaultValue) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

// Validate JWT secret in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is required in production');
    process.exit(1);
}

if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
    console.warn('WARNING: Using fallback JWT secret. Set JWT_SECRET environment variable.');
}

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    dbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/majorproject',
    jwtSecret: process.env.JWT_SECRET || 'fallback-dev-secret-' + Date.now(),
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseIntWithDefault(process.env.EMAIL_PORT, 587),
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://127.0.0.1:3000',
    upload: {
        maxFileSize: parseIntWithDefault(process.env.MAX_FILE_SIZE, 5242880), // 5MB
        path: process.env.UPLOAD_PATH || 'uploads/'
    },
    rateLimit: {
        windowMs: parseIntWithDefault(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 minutes
        maxRequests: parseIntWithDefault(process.env.RATE_LIMIT_MAX_REQUESTS, 100)
    }
};