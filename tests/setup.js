const mongoose = require('mongoose');

// Test environment variables are handled by Node.js --env-file or Docker

// Setup before all tests
beforeAll(async () => {
    try {
        // Connect to test database (Docker MongoDB)
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/majorproject_test';
        await mongoose.connect(uri);
    } catch (error) {
        console.error('Failed to connect to test database:', error.message);
        console.error('Connection URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/majorproject_test');
        process.exit(1);
    }
});

// Cleanup after each test
afterEach(async () => {
    try {
        // Clear all collections
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    } catch (error) {
        console.error('Failed to cleanup test data:', error.message);
        console.error('Error details:', error.stack);
    }
});

// Cleanup after all tests
afterAll(async () => {
    try {
        // Close database connection
        await mongoose.connection.close();
    } catch (error) {
        console.error('Failed to close database connection:', error.message);
        console.error('Connection state:', mongoose.connection.readyState);
    }
});

// Ensure test environment
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
}