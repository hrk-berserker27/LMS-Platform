const { verifyToken } = require('../utils/utils');
const { MESSAGES } = require('../constants/constants');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: MESSAGES.USER.UNAUTHORIZED });
    }

    const result = verifyToken(token);
    
    if (result.error) {
        return res.status(401).json({ message: MESSAGES.USER.INVALID_TOKEN });
    }

    req.user = result.decoded;
    next();
};

module.exports = authMiddleware;