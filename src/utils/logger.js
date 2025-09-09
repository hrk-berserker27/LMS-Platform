const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logger = {
    info: (message, meta = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message: sanitizeLog(message),
            ...meta
        };
        console.log(JSON.stringify(logEntry));
        writeToFile('info.log', logEntry);
    },
    
    error: (message, error = null, meta = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message: sanitizeLog(message),
            error: error ? {
                message: sanitizeLog(error.message),
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            } : null,
            ...meta
        };
        console.error(JSON.stringify(logEntry));
        writeToFile('error.log', logEntry);
    },
    
    warn: (message, meta = {}) => {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'WARN',
            message: sanitizeLog(message),
            ...meta
        };
        console.warn(JSON.stringify(logEntry));
        writeToFile('warn.log', logEntry);
    }
};

// Simple log sanitization utility
const sanitizeLog = (input) => {
    if (typeof input !== 'string') {
        return String(input);
    }
    
    // Remove potential log injection characters
    return input
        .replace(/[\r\n\t]/g, '_')
        .replace(/[^\x20-\x7E]/g, '?')
        .substring(0, 500); // Limit length
};

const writeToFile = (filename, logEntry) => {
    try {
        const logPath = path.join(logsDir, filename);
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(logPath, logLine);
    } catch (err) {
        console.error('Failed to write to log file:', sanitizeLog(err.message));
    }
};

module.exports = { logger, sanitizeLog };