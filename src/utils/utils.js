const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret, email } = require('../config/config');
const nodemailer = require('nodemailer');

// Create singleton transporter for better performance
let transporter = null;
const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransporter({
            host: email.host,
            port: email.port,
            secure: email.port === 465,
            requireTLS: true,
            auth: {
                user: email.user,
                pass: email.pass
            },
            tls: {
                rejectUnauthorized: process.env.NODE_ENV === 'production'
            }
        });
    }
    return transporter;
};

// Hash a password
async function hashPassword(password) {
    try {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        throw new Error('Password hashing failed');
    }
}

// Compare a password
async function comparePassword(password, hash) {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
}

// Generate JWT token
function generateToken(payload, expiresIn = '1d') {
    try {
        return jwt.sign(payload, jwtSecret, { expiresIn });
    } catch (error) {
        throw new Error('Token generation failed');
    }
}

// Verify JWT token
function verifyToken(token) {
    if (!token) {
        return { error: 'Token is required' };
    }
    
    try {
        const decoded = jwt.verify(token, jwtSecret);
        return { success: true, decoded };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { error: 'Token expired' };
        }
        if (error.name === 'JsonWebTokenError') {
            return { error: 'Invalid token' };
        }
        return { error: 'Token verification failed' };
    }
}

// Send email
async function sendEmail({ to, subject, text, html }) {
    if (!email.user || !email.pass) {
        throw new Error('Email configuration is incomplete');
    }
    
    if (!to || !subject) {
        throw new Error('Email recipient and subject are required');
    }
    
    try {
        const emailTransporter = getTransporter();
        return await emailTransporter.sendMail({
            from: `"Your App" <${email.user}>`,
            to,
            subject,
            text,
            html
        });
    } catch (error) {
        const sanitizedMessage = error.message ? error.message.replace(/[\r\n]/g, ' ') : 'Unknown error';
        throw new Error(`Email sending failed: ${sanitizedMessage}`);
    }
}

// Pagination helper
function paginate(query, { page = 1, pageSize = 20 }) {
    // Validate and sanitize inputs
    const validPage = Math.max(1, parseInt(page, 10) || 1);
    const validPageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
    
    const skip = (validPage - 1) * validPageSize;
    return query.skip(skip).limit(validPageSize);
}

// Format notification object
function formatNotification(notification) {
    return {
        id: notification._id,
        message: notification.message,
        type: notification.type,
        data: notification.data,
        read: notification.read,
        createdAt: notification.createdAt
    };
}

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    sendEmail,
    paginate,
    formatNotification
};