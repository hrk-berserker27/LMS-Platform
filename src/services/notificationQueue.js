const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const { logger, sanitizeLog } = require('../utils/logger');

// Setup Redis connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

// Create notification queue
const notificationQueue = new Queue('notifications', { connection });

class NotificationQueueService {
    constructor() {
        this.queue = notificationQueue;
    }

    /**
     * Add a notification to the queue
     * @param {Object} notificationData - The notification data
     * @param {Object} options - Job options (priority, delay, attempts, etc.)
     * @returns {Promise<Object>} Job object
     */
    async addNotification(notificationData, options = {}) {
        try {
            const job = await this.queue.add('notification', notificationData, options);
            logger.info('Notification added to queue', { 
                jobId: sanitizeLog(job.id),
                userId: sanitizeLog(notificationData.userId),
                type: sanitizeLog(notificationData.type)
            });
            return job;
        } catch (error) {
            logger.error('Failed to add notification to queue', sanitizeLog(error.message), {
                userId: sanitizeLog(notificationData?.userId)
            });
            throw error;
        }
    }

    /**
     * Add multiple notifications in bulk
     * @param {Array} notifications - Array of notification data objects
     * @returns {Promise<Array>} Array of job objects
     */
    async addBulkNotifications(notifications) {
        try {
            const bulkJobs = notifications.map(notification => ({
                name: 'notification',
                data: notification
            }));
            
            const jobs = await this.queue.addBulk(bulkJobs);
            logger.info('Bulk notifications added to queue', { count: jobs.length });
            return jobs;
        } catch (error) {
            logger.error('Failed to add bulk notifications to queue', sanitizeLog(error.message));
            throw error;
        }
    }

    /**
     * Get queue statistics
     * @returns {Promise<Object>} Queue statistics
     */
    async getQueueStats() {
        try {
            return await this.queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
        } catch (error) {
            logger.error('Failed to get queue stats', sanitizeLog(error.message));
            throw error;
        }
    }

    /**
     * Clean old completed jobs
     * @param {number} maxAge - Maximum age in milliseconds
     * @param {number} limit - Maximum number of jobs to clean
     * @returns {Promise<Array>} Array of cleaned job IDs
     */
    async cleanOldJobs(maxAge = 24 * 60 * 60 * 1000, limit = 100) {
        try {
            const cleanedJobs = await this.queue.clean(maxAge, limit, 'completed');
            logger.info('Cleaned old jobs from queue', { count: cleanedJobs.length });
            return cleanedJobs;
        } catch (error) {
            logger.error('Failed to clean old jobs', sanitizeLog(error.message));
            throw error;
        }
    }

    /**
     * Pause the queue
     * @returns {Promise<void>}
     */
    async pauseQueue() {
        try {
            await this.queue.pause();
            logger.info('Notification queue paused');
        } catch (error) {
            logger.error('Failed to pause queue', sanitizeLog(error.message));
            throw error;
        }
    }

    /**
     * Resume the queue
     * @returns {Promise<void>}
     */
    async resumeQueue() {
        try {
            await this.queue.resume();
            logger.info('Notification queue resumed');
        } catch (error) {
            logger.error('Failed to resume queue', sanitizeLog(error.message));
            throw error;
        }
    }

    /**
     * Check if queue is paused
     * @returns {Promise<boolean>} True if paused
     */
    async isQueuePaused() {
        try {
            return await this.queue.isPaused();
        } catch (error) {
            logger.error('Failed to check queue pause status', sanitizeLog(error.message));
            throw error;
        }
    }

    /**
     * Get queue health status
     * @returns {Promise<Object>} Health status object
     */
    async getQueueHealth() {
        try {
            const stats = await this.getQueueStats();
            const isPaused = await this.isQueuePaused();
            
            return {
                isHealthy: true,
                stats,
                isPaused,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Queue health check failed', sanitizeLog(error.message));
            return {
                isHealthy: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Close the queue connection
     * @returns {Promise<void>}
     */
    async close() {
        try {
            await this.queue.close();
            logger.info('Notification queue closed');
        } catch (error) {
            logger.error('Failed to close queue', sanitizeLog(error.message));
            throw error;
        }
    }
}

// Create and export singleton instance
const notificationQueueService = new NotificationQueueService();

module.exports = notificationQueueService;
