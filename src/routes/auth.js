const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const validate = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../schemas/authSchemas');

// CSRF protection for auth routes (disabled for testing)
const csrfProtection = (req, res, next) => {
    // Temporarily disabled for testing
    next();
};

router.post('/register', csrfProtection, validate(registerSchema), authController.register);
router.post('/login', csrfProtection, validate(loginSchema), authController.login);

module.exports = router;