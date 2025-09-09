const mongoose = require('mongoose');
const { dbUri } = require('./config');
const { sanitizeLog } = require('../utils/logger');

const connectDB = async () => {
    try {
        // Set mongoose options for compatibility
        mongoose.set('strictQuery', false);
        
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferCommands: true
        };
        
        await mongoose.connect(dbUri, options);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', sanitizeLog(err.message));
        // Don't exit in development or tests
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

mongoose.connection.on('error', () => {
    // Only log generic error message to prevent information disclosure
    console.error('MongoDB connection error occurred');
});
// export the function
module.exports = connectDB;