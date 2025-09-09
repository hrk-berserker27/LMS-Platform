// Mock BullMQ and IORedis before requiring anything
const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    addBulk: jest.fn().mockResolvedValue([{ id: 'job-1' }, { id: 'job-2' }]),
    getJobCounts: jest.fn().mockResolvedValue({
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3
    }),
    clean: jest.fn().mockResolvedValue(['job-1', 'job-2']),
    pause: jest.fn().mockResolvedValue(),
    resume: jest.fn().mockResolvedValue(),
    isPaused: jest.fn().mockResolvedValue(false),
    close: jest.fn().mockResolvedValue()
};

jest.mock('bullmq', () => ({
    Queue: jest.fn(() => mockQueue)
}));

jest.mock('ioredis', () => jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn()
})));

const notificationQueue = require('../../src/services/notificationQueue');

describe('Notification Queue Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Queue Operations', () => {
        test('should add notification to queue', async () => {
            const notificationData = {
                userId: 'user-123',
                message: 'Test notification',
                type: 'email',
                data: { subject: 'Test Subject' }
            };

            const result = await notificationQueue.addNotification(notificationData);

            expect(mockQueue.add).toHaveBeenCalledWith('notification', notificationData, {});
            expect(result).toEqual({ id: 'job-123' });
        });

        test('should add notification with options', async () => {
            const notificationData = {
                userId: 'user-123',
                message: 'Priority notification',
                type: 'email',
                data: {}
            };

            const options = {
                priority: 10,
                delay: 5000,
                attempts: 3
            };

            await notificationQueue.addNotification(notificationData, options);

            expect(mockQueue.add).toHaveBeenCalledWith('notification', notificationData, options);
        });

        test('should get queue statistics', async () => {
            const stats = await notificationQueue.getQueueStats();

            expect(mockQueue.getJobCounts).toHaveBeenCalled();
            expect(stats).toEqual({
                waiting: 5,
                active: 2,
                completed: 100,
                failed: 3
            });
        });

        test('should clean old jobs', async () => {
            const cleanedJobs = await notificationQueue.cleanOldJobs(24 * 60 * 60 * 1000); // 24 hours

            expect(mockQueue.clean).toHaveBeenCalledWith(24 * 60 * 60 * 1000, 100, 'completed');
            expect(cleanedJobs).toEqual(['job-1', 'job-2']);
        });

        test('should pause queue', async () => {
            await notificationQueue.pauseQueue();

            expect(mockQueue.pause).toHaveBeenCalled();
        });

        test('should resume queue', async () => {
            await notificationQueue.resumeQueue();

            expect(mockQueue.resume).toHaveBeenCalled();
        });

        test('should check if queue is paused', async () => {
            const isPaused = await notificationQueue.isQueuePaused();

            expect(mockQueue.isPaused).toHaveBeenCalled();
            expect(isPaused).toBe(false);
        });
    });

    describe('Bulk Operations', () => {
        test('should add multiple notifications in bulk', async () => {
            const notifications = [
                {
                    userId: 'user-1',
                    message: 'Notification 1',
                    type: 'email',
                    data: {}
                },
                {
                    userId: 'user-2',
                    message: 'Notification 2',
                    type: 'sms',
                    data: {}
                }
            ];

            // addBulk is already mocked in beforeEach

            const result = await notificationQueue.addBulkNotifications(notifications);

            expect(mockQueue.addBulk).toHaveBeenCalledWith(
                notifications.map(notification => ({
                    name: 'notification',
                    data: notification
                }))
            );
            expect(result).toHaveLength(2);
        });
    });

    describe('Error Handling', () => {
        test('should handle queue add errors', async () => {
            mockQueue.add.mockRejectedValue(new Error('Queue error'));

            const notificationData = {
                userId: 'user-123',
                message: 'Test notification',
                type: 'email',
                data: {}
            };

            await expect(notificationQueue.addNotification(notificationData))
                .rejects.toThrow('Queue error');
        });

        test('should handle stats retrieval errors', async () => {
            mockQueue.getJobCounts.mockRejectedValue(new Error('Stats error'));

            await expect(notificationQueue.getQueueStats())
                .rejects.toThrow('Stats error');
        });
    });

    describe('Health Monitoring', () => {
        test('should provide queue health status', async () => {
            const health = await notificationQueue.getQueueHealth();

            expect(health).toHaveProperty('isHealthy');
            expect(health).toHaveProperty('timestamp');
            if (health.isHealthy) {
                expect(health).toHaveProperty('stats');
                expect(health).toHaveProperty('isPaused');
            } else {
                expect(health).toHaveProperty('error');
            }
        });

        test('should detect unhealthy queue', async () => {
            mockQueue.getJobCounts.mockRejectedValue(new Error('Connection failed'));

            const health = await notificationQueue.getQueueHealth();

            expect(health.isHealthy).toBe(false);
            expect(health.error).toBeDefined();
        });
    });
});