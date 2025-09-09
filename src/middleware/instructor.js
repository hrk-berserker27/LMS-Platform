const { MESSAGES } = require('../constants/constants');

// create middleware for instructor
const instructorMiddleware = (req, res, next) => {
    // Check if user is instructor
    if (req.user && req.user.role === 'instructor') {
        next();
    } else {
        res.status(403).json({ message: MESSAGES.USER.FORBIDDEN });
    }
};

module.exports = instructorMiddleware;
