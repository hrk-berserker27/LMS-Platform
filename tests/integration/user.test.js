const request = require('supertest');
const app = require('../../app');
const User = require('../../src/models/User');
const { hashPassword, generateToken } = require('../../src/utils/utils');

describe('User API Integration Tests', () => {
    let authToken;
    let testUser;

    beforeAll(async () => {
        // Clean up any existing test data
        await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    });

    afterAll(async () => {
        // Clean up test data
        await User.deleteMany({ email: { $regex: /@test\.com$/ } });
    });

    beforeEach(async () => {
        // Create test user with valid password
        const testPassword = 'TestPass123!';
        const hashedPassword = await hashPassword(testPassword);
        
        testUser = new User({
            name: 'Test User',
            email: `test${Date.now()}@test.com`,
            password: hashedPassword,
            role: 'student'
        });
        await testUser.save({ validateBeforeSave: false });

        // Generate auth token
        authToken = generateToken({ id: testUser._id, email: testUser.email, role: testUser.role });
    });

    describe('POST /api/v1/users', () => {
        test('should create a new user', async () => {
            const userData = {
                name: 'John Doe',
                email: `john${Date.now()}@test.com`,
                password: 'TestPass123!',
                role: 'student'
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.user.password).toBeUndefined();
        });

        test('should return 409 for duplicate email', async () => {
            // Ensure test user exists in database
            const existingUser = await User.findById(testUser._id);
            expect(existingUser).toBeTruthy();
            
            const userData = {
                name: 'Test User 2',
                email: existingUser.email, // Same as existing user
                password: 'TestPass123!',
                role: 'student'
            };

            await request(app)
                .post('/api/v1/auth/register')
                .send(userData)
                .expect(409);
        });
    });

    describe('GET /api/v1/admin/users/:id', () => {
        test('should get user by id with admin access', async () => {
            // Ensure test user exists
            const existingTestUser = await User.findById(testUser._id);
            expect(existingTestUser).toBeTruthy();
            
            // Create admin user for this test
            const adminPassword = 'AdminPass123!';
            const hashedAdminPassword = await hashPassword(adminPassword);
            const adminUser = new User({
                name: 'Admin User',
                email: `admin${Date.now()}@test.com`,
                password: hashedAdminPassword,
                role: 'admin'
            });
            await adminUser.save({ validateBeforeSave: false });
            const adminToken = generateToken({ id: adminUser._id, email: adminUser.email, role: adminUser.role });

            const response = await request(app)
                .get(`/api/v1/admin/users/${existingTestUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.name).toBe(existingTestUser.name);
            expect(response.body.email).toBe(existingTestUser.email);
            expect(response.body.password).toBeUndefined();
        });

        test('should return 404 for non-existent user', async () => {
            // Create admin user for this test
            const adminPassword = 'AdminPass123!';
            const hashedAdminPassword = await hashPassword(adminPassword);
            const adminUser = new User({
                name: 'Admin User 2',
                email: `admin2${Date.now()}@test.com`,
                password: hashedAdminPassword,
                role: 'admin'
            });
            await adminUser.save({ validateBeforeSave: false });
            const adminToken = generateToken({ id: adminUser._id, email: adminUser.email, role: adminUser.role });
            const fakeId = '507f1f77bcf86cd799439011';
            
            await request(app)
                .get(`/api/v1/admin/users/${fakeId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(404);
        });
    });

    describe('GET /api/v1/users/me', () => {
        test('should get current user profile', async () => {
            const response = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body.name).toBe(testUser.name);
            expect(response.body.email).toBe(testUser.email);
        });

        test('should return 401 without auth token', async () => {
            await request(app)
                .get('/api/v1/users/me')
                .expect(401);
        });
    });

    describe('PUT /api/v1/users/me', () => {
        test('should update current user profile', async () => {
            // Ensure user exists in database
            const existingUser = await User.findById(testUser._id);
            expect(existingUser).toBeTruthy();
            
            const updateData = { name: 'Updated Name' };

            const response = await request(app)
                .put('/api/v1/users/me')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.name).toBe(updateData.name);
        });
    });
});