const { MESSAGES } = require('../constants/constants');
const { logger } = require('../utils/logger');

// create middleware for student
const studentMiddleware = (req, res, next) => {
    try {
        // Check if user exists and has student role
        if (!req.user) {
            logger.warn('Student middleware: No user in request');
            return res.status(401).json({ message: MESSAGES.USER.UNAUTHORIZED });
        }
        
        if (req.user.role !== 'student') {
            logger.warn('Student middleware: Access denied');
            return res.status(403).json({ message: MESSAGES.USER.FORBIDDEN });
        }
        
        next();
    } catch (error) {
        logger.error('Student middleware error');
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = studentMiddleware;
