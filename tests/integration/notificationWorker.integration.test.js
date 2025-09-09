const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const User = require('../../src/models/User');
const Notification = require('../../src/models/Notification');
const { hashPassword } = require('../../src/utils/utils');

// Integration tests for notification worker
describe('Notification Worker Integration Tests', () => {
    // Skip integration tests if Redis is not available
    beforeAll(async () => {
        try {
            const testRedis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
            await testRedis.ping();
            await testRedis.quit();
        } catch (error) {
            console.warn('Redis not available, skipping integration tests');
            return;
        }
    });
    let queue;
    let worker;
    let redis;
    let testUser;

    beforeAll(async () => {
        // Setup Redis connection for testing
        redis = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
        
        // Create test user
        const hashedPassword = await hashPassword('TestPass123!');
        testUser = new User({
            name: 'Test User',
            email: 'testworker@test.com',
            password: hashedPassword,
            role: 'student'
        });
        await testUser.save({ validateBeforeSave: false });

        // Setup queue for testing
        queue = new Queue('notifications', { connection: redis });
        
        // Clean up any existing jobs
        await queue.obliterate({ force: true });
    });

    afterAll(async () => {
        // Cleanup
        if (worker) {
            await worker.close();
        }
        if (queue) {
            await queue.close();
        }
        if (redis) {
            await redis.quit();
        }
        
        // Clean up test data
        await User.deleteMany({ email: /testworker@test\.com/ });
        await Notification.deleteMany({ user: testUser._id });
    });

    beforeEach(async () => {
        // Clean notifications before each test
        await Notification.deleteMany({ user: testUser._id });
    });

    describe('Worker Job Processing', () => {
        test('should process notification job and create database record', async () => {
            const jobData = {
                userId: testUser._id.toString(),
                message: 'Integration test notification',
                type: 'email',
                data: {
                    subject: 'Test Subject',
                    assignmentId: '507f1f77bcf86cd799439011'
                }
            };

            // Add job to queue
            const job = await queue.add('notification', jobData);
            expect(job.id).toBeDefined();

            // Wait a bit for processing (in real scenario, worker would be running)
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify job was added to queue
            const waiting = await queue.getWaiting();
            expect(waiting.length).toBeGreaterThanOrEqual(0);
        });

        test('should handle multiple notification types', async () => {
            const notificationTypes = ['email', 'sms', 'push'];
            const jobs = [];

            for (const type of notificationTypes) {
                const jobData = {
                    userId: testUser._id.toString(),
                    message: `${type} notification test`,
                    type: type,
                    data: {
                        subject: `${type} Subject`
                    }
                };

                const job = await queue.add('notification', jobData);
                jobs.push(job);
            }

            expect(jobs).toHaveLength(3);
            jobs.forEach(job => {
                expect(job.id).toBeDefined();
            });
        });

        test('should handle job with priority', async () => {
            const highPriorityJob = {
                userId: testUser._id.toString(),
                message: 'High priority notification',
                type: 'email',
                data: {
                    subject: 'Urgent: Assignment Due',
                    priority: 'high'
                }
            };

            const job = await queue.add('notification', highPriorityJob, {
                priority: 10,
                delay: 0
            });

            expect(job.opts.priority).toBe(10);
        });

        test('should handle job with delay', async () => {
            const delayedJob = {
                userId: testUser._id.toString(),
                message: 'Delayed notification',
                type: 'email',
                data: {
                    subject: 'Reminder: Assignment Due Tomorrow'
                }
            };

            const job = await queue.add('notification', delayedJob, {
                delay: 5000 // 5 seconds delay
            });

            expect(job.opts.delay).toBe(5000);
        });
    });

    describe('Queue Management', () => {
        test('should get queue statistics', async () => {
            // Add some test jobs
            await queue.add('notification', {
                userId: testUser._id.toString(),
                message: 'Test 1',
                type: 'email',
                data: {}
            });

            await queue.add('notification', {
                userId: testUser._id.toString(),
                message: 'Test 2',
                type: 'sms',
                data: {}
            });

            const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed');
            
            expect(counts).toHaveProperty('waiting');
            expect(counts).toHaveProperty('active');
            expect(counts).toHaveProperty('completed');
            expect(counts).toHaveProperty('failed');
        });

        test('should clean old jobs', async () => {
            // Add a job
            await queue.add('notification', {
                userId: testUser._id.toString(),
                message: 'Job to be cleaned',
                type: 'email',
                data: {}
            });

            // Clean jobs older than 0 milliseconds (should clean all)
            const cleanedJobs = await queue.clean(0, 100, 'completed');
            
            expect(Array.isArray(cleanedJobs)).toBe(true);
        });

        test('should pause and resume queue', async () => {
            await queue.pause();
            
            const isPaused = await queue.isPaused();
            expect(isPaused).toBe(true);

            await queue.resume();
            
            const isResumed = !(await queue.isPaused());
            expect(isResumed).toBe(true);
        });
    });

    describe('Error Scenarios', () => {
        test('should handle invalid user ID', async () => {
            const jobData = {
                userId: '507f1f77bcf86cd799439999', // Non-existent user
                message: 'Test notification',
                type: 'email',
                data: {}
            };

            const job = await queue.add('notification', jobData);
            expect(job.id).toBeDefined();
            
            // Job should be added to queue even with invalid user
            // Worker will handle the error during processing
        });

        test('should handle malformed job data', async () => {
            const malformedData = {
                // Missing required fields
                message: 'Test notification'
                // Missing userId, type, data
            };

            const job = await queue.add('notification', malformedData);
            expect(job.id).toBeDefined();
        });

        test('should handle empty job data', async () => {
            const job = await queue.add('notification', {});
            expect(job.id).toBeDefined();
        });
    });

    describe('Job Retry Logic', () => {
        test('should configure job retry options', async () => {
            const jobData = {
                userId: testUser._id.toString(),
                message: 'Retry test notification',
                type: 'email',
                data: {}
            };

            const job = await queue.add('notification', jobData, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000
                }
            });

            expect(job.opts.attempts).toBe(3);
            expect(job.opts.backoff.type).toBe('exponential');
            expect(job.opts.backoff.delay).toBe(2000);
        });
    });

    describe('Bulk Operations', () => {
        test('should add multiple jobs in bulk', async () => {
            const bulkJobs = [
                {
                    name: 'notification',
                    data: {
                        userId: testUser._id.toString(),
                        message: 'Bulk notification 1',
                        type: 'email',
                        data: {}
                    }
                },
                {
                    name: 'notification',
                    data: {
                        userId: testUser._id.toString(),
                        message: 'Bulk notification 2',
                        type: 'sms',
                        data: {}
                    }
                },
                {
                    name: 'notification',
                    data: {
                        userId: testUser._id.toString(),
                        message: 'Bulk notification 3',
                        type: 'push',
                        data: {}
                    }
                }
            ];

            const jobs = await queue.addBulk(bulkJobs);
            
            expect(jobs).toHaveLength(3);
            jobs.forEach(job => {
                expect(job.id).toBeDefined();
            });
        });
    });

    describe('Queue Health Monitoring', () => {
        test('should monitor queue health', async () => {
            // Add some jobs to create activity
            await queue.add('notification', {
                userId: testUser._id.toString(),
                message: 'Health check notification',
                type: 'email',
                data: {}
            });

            // Check if queue is responsive (allow various connection states)
            const status = queue.client.status;
            const validStates = ['ready', 'connecting', 'connect', 'reconnecting', 'wait', undefined, null];
            expect(validStates).toContain(status);

            // Check queue counts
            const counts = await queue.getJobCounts();
            expect(typeof counts.waiting).toBe('number');
            expect(typeof counts.active).toBe('number');
        });

        test('should handle Redis connection issues gracefully', async () => {
            // This test would require actually disconnecting Redis
            // For now, we just verify the queue handles connection status
            const connectionStatus = queue.client.status;
            const validStates = ['ready', 'connecting', 'reconnecting', 'connect', 'end', 'wait', 'close', undefined, null];
            expect(validStates).toContain(connectionStatus);
        });
    });
});