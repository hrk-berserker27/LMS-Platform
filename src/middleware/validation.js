// use joi to validate the req body
const Joi = require('joi');
const validationMiddleware = (schema) => {
    return (req, res, next) => {
        if (!schema || typeof schema.validate !== 'function') {
            return res.status(500).json({ message: 'Validation schema not configured' });
        }
        
        try {
            const { error } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }
            next();
        } catch (validationError) {
            return res.status(500).json({ message: 'Validation error occurred' });
        }
    };
};

module.exports = validationMiddleware;