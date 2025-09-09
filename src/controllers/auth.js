const User = require('../models/User');
const { hashPassword, comparePassword, generateToken } = require('../utils/utils');
const { MESSAGES } = require('../constants/constants');
const { logger } = require('../utils/logger');

const authController = {
    register: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;
            
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({ message: MESSAGES.AUTH.USER_EXISTS });
            }
            
            // Validate password before hashing
            const { MESSAGES: { REGEX } } = require('../constants/constants');
            if (!REGEX.PASSWORD.test(password)) {
                return res.status(400).json({ message: MESSAGES.VALIDATION.PASSWORD_COMPLEXITY });
            }
            
            const hashedPassword = await hashPassword(password);
            const user = new User({ name, email, password: hashedPassword, role });
            // Skip validation since we already validated the password
            await user.save({ validateBeforeSave: false });
            
            const token = generateToken({ id: user._id, email: user.email, role: user.role });
            
            res.status(201).json({
                message: MESSAGES.AUTH.REGISTRATION_SUCCESS,
                token,
                user: { id: user._id, name, email, role }
            });
        } catch (error) {
            logger.error('User registration failed', { 
                timestamp: new Date().toISOString(),
                operation: 'register',
                status: 'failed',
                error: error.message || error.toString() || 'Unknown error',
                errorName: error.name,
                stack: error.stack
            });
            const message = MESSAGES.AUTH.REGISTRATION_FAILED;
            res.status(500).json({ message });
        }
    },
    
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });
            }
            
            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });
            }
            
            const token = generateToken({ id: user._id, email: user.email, role: user.role });
            
            res.status(200).json({
                message: MESSAGES.AUTH.LOGIN_SUCCESS,
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });
        } catch (error) {
            logger.error('User login failed', { 
                timestamp: new Date().toISOString(),
                operation: 'login',
                status: 'failed'
            });
            const message = MESSAGES.AUTH.LOGIN_FAILED;
            res.status(500).json({ message });
        }
    }
};

module.exports = authController;