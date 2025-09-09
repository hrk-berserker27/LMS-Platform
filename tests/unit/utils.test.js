const {
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    paginate,
    formatNotification
} = require('../../src/utils/utils');

describe('Utils', () => {
    describe('Password utilities', () => {
        test('should hash password correctly', async () => {
            const password = 'testpassword123';
            const hash = await hashPassword(password);
            
            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(50);
        });

        test('should compare password correctly', async () => {
            const password = 'testpassword123';
            const hash = await hashPassword(password);
            
            const isMatch = await comparePassword(password, hash);
            const isNotMatch = await comparePassword('wrongpassword', hash);
            
            expect(isMatch).toBe(true);
            expect(isNotMatch).toBe(false);
        });
    });

    describe('JWT utilities', () => {
        test('should generate and verify token correctly', () => {
            const payload = { id: '123', email: 'test@test.com' };
            const token = generateToken(payload);
            
            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            
            const result = verifyToken(token);
            expect(result.success).toBe(true);
            expect(result.decoded.id).toBe(payload.id);
            expect(result.decoded.email).toBe(payload.email);
        });

        test('should return error for invalid token', () => {
            const result = verifyToken('invalid-token');
            expect(result.error).toBeDefined();
            expect(result.success).toBeUndefined();
        });
    });

    describe('Pagination utility', () => {
        test('should apply pagination correctly', () => {
            const mockQuery = {
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis()
            };

            paginate(mockQuery, { page: 2, pageSize: 10 });
            
            expect(mockQuery.skip).toHaveBeenCalledWith(10);
            expect(mockQuery.limit).toHaveBeenCalledWith(10);
        });

        test('should use default values', () => {
            const mockQuery = {
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis()
            };

            paginate(mockQuery, {});
            
            expect(mockQuery.skip).toHaveBeenCalledWith(0);
            expect(mockQuery.limit).toHaveBeenCalledWith(20);
        });
    });

    describe('Format notification utility', () => {
        test('should format notification correctly', () => {
            const notification = {
                _id: '507f1f77bcf86cd799439011',
                message: 'Test message',
                type: 'email',
                data: {
                    assignmentId: null,
                    courseId: '507f1f77bcf86cd799439012',
                    url: 'https://example.com',
                    metadata: { subject: 'Test' }
                },
                read: false,
                createdAt: new Date()
            };

            const formatted = formatNotification(notification);
            
            expect(formatted).toEqual({
                id: notification._id,
                message: notification.message,
                type: notification.type,
                data: notification.data,
                read: notification.read,
                createdAt: notification.createdAt
            });
        });
    });
});