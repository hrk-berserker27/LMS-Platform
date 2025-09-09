const Joi = require('joi');
const { USER_ROLES, MESSAGES, PASSWORD_MIN_LENGTH, NAME_MIN_LENGTH, NAME_MAX_LENGTH } = require('../constants/constants');

const registerSchema = Joi.object({
    name: Joi.string()
        .min(NAME_MIN_LENGTH)
        .max(NAME_MAX_LENGTH)
        .required()
        .messages({
            'string.min': MESSAGES.VALIDATION.NAME_MIN,
            'string.max': MESSAGES.VALIDATION.NAME_MAX,
            'any.required': MESSAGES.VALIDATION.NAME_REQUIRED
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': MESSAGES.VALIDATION.EMAIL_INVALID,
            'any.required': MESSAGES.VALIDATION.EMAIL_REQUIRED
        }),
    password: Joi.string()
        .min(PASSWORD_MIN_LENGTH)
        .pattern(MESSAGES.REGEX.PASSWORD)
        .required()
        .messages({
            'string.min': MESSAGES.VALIDATION.PASSWORD_MIN,
            'string.pattern.base': MESSAGES.VALIDATION.PASSWORD_COMPLEXITY,
            'any.required': MESSAGES.VALIDATION.PASSWORD_REQUIRED
        }),
    role: Joi.string()
        .valid(...USER_ROLES)
        .required()
        .messages({
            'any.only': MESSAGES.VALIDATION.ROLE_INVALID,
            'any.required': MESSAGES.VALIDATION.ROLE_REQUIRED
        })
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': MESSAGES.VALIDATION.EMAIL_INVALID,
            'any.required': MESSAGES.VALIDATION.EMAIL_REQUIRED
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': MESSAGES.VALIDATION.PASSWORD_REQUIRED
        })
});

module.exports = {
    registerSchema,
    loginSchema
};