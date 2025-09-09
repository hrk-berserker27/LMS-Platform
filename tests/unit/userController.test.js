const userController = require('../../src/controllers/user');
const User = require('../../src/models/User');
const { hashPassword } = require('../../src/utils/utils');

jest.mock('../../src/models/User');
jest.mock('../../src/utils/utils');

describe('User Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            user: { id: 'user123' },
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        test('should create user successfully', async () => {
            try {
                const userData = {
                    name: 'John Doe',
                    email: 'john@test.com',
                    password: process.env.TEST_PASSWORD || 'testpass' + Date.now(),
                    role: 'student'
                };
                req.body = userData;

                User.findOne.mockResolvedValue(null);
                hashPassword.mockResolvedValue('hashedpassword');
                const mockUser = { _id: 'user123', ...userData, save: jest.fn() };
                User.mockImplementation(() => mockUser);

                await userController.createUser(req, res);

                expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
                expect(hashPassword).toHaveBeenCalledWith(userData.password);
                expect(mockUser.save).toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(201);
            } catch (error) {
                throw new Error(`Test failed: ${error.message}`);
            }
        });

        test('should return 409 if user already exists', async () => {
            req.body = { 
                name: 'John Doe',
                email: 'existing@test.com',
                password: 'TestPass123!',
                role: 'student'
            };
            User.findOne.mockResolvedValue({ email: 'existing@test.com' });

            await userController.createUser(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
        });
    });

    describe('getUserById', () => {
        test('should return user by id', async () => {
            const mockUser = { _id: 'user123', name: 'John Doe' };
            req.params.id = 'user123';
            
            const mockQuery = { select: jest.fn().mockResolvedValue(mockUser) };
            User.findById.mockReturnValue(mockQuery);

            await userController.getUserById(req, res);

            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(mockQuery.select).toHaveBeenCalledWith('-password');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        test('should return 404 if user not found', async () => {
            try {
                req.params.id = 'nonexistent';
                
                const mockQuery = { select: jest.fn().mockResolvedValue(null) };
                User.findById.mockReturnValue(mockQuery);

                await userController.getUserById(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
            } catch (error) {
                throw new Error(`Test failed: ${error.message}`);
            }
        });
    });
});