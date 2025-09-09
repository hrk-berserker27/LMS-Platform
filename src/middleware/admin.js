const { MESSAGES } = require('../constants/constants');

// create middleware for admin
const adminMiddleware = (req, res, next) => {
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: MESSAGES.USER.FORBIDDEN });
    }
};

module.exports = adminMiddleware;
