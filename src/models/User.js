const mongoose = require('mongoose');
const { USER_ROLES, MESSAGES, PASSWORD_MIN_LENGTH, NAME_MIN_LENGTH, NAME_MAX_LENGTH } = require('../constants/constants');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: [NAME_MIN_LENGTH, MESSAGES.VALIDATION.NAME_MIN],
        maxlength: [NAME_MAX_LENGTH, MESSAGES.VALIDATION.NAME_MAX]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(email) {
                try {
                    return MESSAGES.REGEX.EMAIL.test(email);
                } catch (error) {
                    return false;
                }
            },
            message: MESSAGES.VALIDATION.EMAIL_INVALID
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [PASSWORD_MIN_LENGTH, MESSAGES.VALIDATION.PASSWORD_MIN],
        validate: {
            validator: function(password) {
                try {
                    // Only validate if password is being set (not for existing hashed passwords)
                    if (this.isNew || this.isModified('password')) {
                        return MESSAGES.REGEX.PASSWORD.test(password);
                    }
                    return true;
                } catch (error) {
                    return false;
                }
            },
            message: MESSAGES.VALIDATION.PASSWORD_COMPLEXITY
        }
    },
    role: {
        type: String,
        enum: USER_ROLES,
        required: true
    },
    // Add other fields as needed (e.g., courses, notifications)
}, {
    timestamps: true
});

let User;
try {
    User = mongoose.model('User', userSchema);
} catch (error) {
    User = mongoose.model('User');
}

module.exports = User;