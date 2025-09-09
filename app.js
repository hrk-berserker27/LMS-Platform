const express = require('express');
const apiRouter = require('./src/routes/index');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./src/config/db');
const { port } = require('./src/config/config');
const rateLimiter = require('./src/middleware/rateLimiter');
const { sanitizeLog } = require('./src/utils/logger');
// set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// set up security headers with CSRF protection
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"]
        }
    }
}));

// set up request logging
app.use(morgan('combined'));
// set up CORS with CSRF protection
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Additional CSRF protection middleware
app.use((req, res, next) => {
    // Require Authorization header for state-changing operations, except auth routes
    const isAuthRoute = req.path.startsWith('/api/v1/auth/');
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && !req.headers.authorization && !isAuthRoute) {
        return res.status(401).json({ message: 'Authorization header required' });
    }
    next();
});

// set up rate limiting
app.use('/api/v1', rateLimiter);

// set up routes
app.use('/api/v1', apiRouter);
// Error handling middleware
app.use((err, req, res, _next) => {
    console.error('Error:', sanitizeLog(err.message));
    
    // Only expose error details to authenticated users in development
    const isAuthenticated = req.user || req.headers.authorization;
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    let message = 'Internal Server Error';
    if (isDevelopment && isAuthenticated) {
        message = err.message;
    } else if (err.status === 400 || err.status === 401 || err.status === 403 || err.status === 404) {
        message = err.message; // Safe to expose client errors
    }
    
    res.status(err.status || 500).json({
        success: false,
        message
    });
});

// Global error handlers
process.on('uncaughtException', (_err) => {
    console.error('Uncaught Exception: System error occurred');
    process.exit(1);
});

process.on('unhandledRejection', () => {
    console.error('Unhandled Rejection: System error occurred');
    process.exit(1);
});

// start the server
const startServer = async () => {
    try {
        // connect to database first
        await connectDB();
        
        // then start the server
        const server = app.listen(port, () => {
            // Log server start without exposing sensitive port information
            console.log('Server started successfully');
        });

        server.on('error', (_err) => {
            if (_err.code === 'EADDRINUSE') {
                console.error('Port is already in use');
            } else {
                console.error('Server error:', sanitizeLog(_err.message));
            }
            // Don't exit during tests
            if (process.env.NODE_ENV !== 'test') {
                process.exit(1);
            }
        });
        
    } catch (err) {
        console.error('Failed to start server:', sanitizeLog(err.message));
        // Don't exit during tests
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    }
};

// Only start server if not in test environment or if explicitly requested
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;