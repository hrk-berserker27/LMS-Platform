const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const Notification = require('../models/Notification');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { logger, sanitizeLog } = require('../utils/logger');

// Email template sanitization
const sanitizeEmailContent = (content) => {
    if (typeof content !== 'string') return String(content);
    
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

// Setup Redis connection with ioredis
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Setup nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: Number(process.env.EMAIL_PORT) === 465,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper functions for better readability
const createNotificationData = (data) => ({
    assignmentId: data?.assignmentId || null,
    courseId: data?.courseId || null,
    url: data?.url || null,
    metadata: data?.metadata || data || {}
});

const sendEmailNotification = async (user, message, data, userId) => {
    const sanitizedMessage = sanitizeEmailContent(message);
    const subject = data?.metadata?.subject || data?.subject || 'Notification';
    const sanitizedSubject = sanitizeEmailContent(subject);
    
    await transporter.sendMail({
        from: `"Your App" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: sanitizedSubject,
        text: message,
        html: `<p>${sanitizedMessage}</p>`
    });
    
    logger.info('Email sent successfully', { userId: sanitizeLog(userId) });
};

const processNotification = async (job) => {
    const { userId, message, type, data } = job.data;

    // Run database operations in parallel
    const notificationData = createNotificationData(data);
    const [, user] = await Promise.all([
        Notification.create({
            user: userId,
            message,
            type,
            data: notificationData
        }),
        User.findById(userId)
    ]);

    // Handle different notification types
    if (type === 'email' && user?.email) {
        await sendEmailNotification(user, message, data, userId);
    } else if (type === 'sms') {
        logger.info('SMS notification queued', { userId: sanitizeLog(userId) });
    } else if (type === 'push') {
        logger.info('Push notification queued', { userId: sanitizeLog(userId) });
    }

    logger.info('Notification processed successfully', { 
        userId: sanitizeLog(userId), 
        type: sanitizeLog(type) 
    });
};

// Create BullMQ worker
const worker = new Worker('notifications', async job => {
    try {
        await processNotification(job);
    } catch (error) {
        const userId = job.data?.userId;
        logger.error('Failed to process notification', sanitizeLog(error.message), { 
            userId: sanitizeLog(userId) 
        });
        throw error;
    }
}, { connection });

worker.on('completed', job => {
    logger.info('Notification job completed', { jobId: sanitizeLog(job.id) });
});

worker.on('failed', (job, err) => {
    logger.error('Notification job failed', { 
        error: sanitizeLog(err.message), 
        jobId: sanitizeLog(job.id) 
    });
});