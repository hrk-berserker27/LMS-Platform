const User = require('../../src/models/User');

const getTestPassword = () => process.env.TEST_PASSWORD || 'TestPass123!';

describe('User Model', () => {
    test('should create a valid user', async () => {
        const userData = {
            name: 'John Doe',
            email: 'john@test.com',
            password: getTestPassword(),
            role: 'student'
        };

        const user = new User(userData);
        const savedUser = await user.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.email).toBe(userData.email);
        expect(savedUser.role).toBe(userData.role);
        expect(savedUser.createdAt).toBeDefined();
        expect(savedUser.updatedAt).toBeDefined();
    });

    test('should require name field', async () => {
        const userData = {
            email: 'john@test.com',
            password: getTestPassword(),
            role: 'student'
        };

        const user = new User(userData);
        
        await expect(user.save()).rejects.toThrow();
    });

    test('should require unique email', async () => {
        const userData = {
            name: 'John Doe',
            email: 'john@test.com',
            password: getTestPassword(),
            role: 'student'
        };

        await new User(userData).save();
        
        const duplicateUser = new User(userData);
        await expect(duplicateUser.save()).rejects.toThrow();
    });

    test('should validate role enum', async () => {
        const userData = {
            name: 'John Doe',
            email: 'john@test.com',
            password: getTestPassword(),
            role: 'invalid-role'
        };

        const user = new User(userData);
        
        await expect(user.save()).rejects.toThrow();
    });
});