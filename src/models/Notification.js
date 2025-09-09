const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: { 
        type: String, 
        enum: {
            values: ['email', 'sms', 'push', 'assignment', 'course', 'announcement', 'reminder'],
            message: 'Invalid notification type. Must be one of: email, sms, push, assignment, course, announcement, reminder'
        },
        required: [true, 'Notification type is required'],
        default: 'email'
    },
    data: {
        assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        url: String,
        metadata: {
            subject: String,
            priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
            category: String,
            additionalInfo: String
        }
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;