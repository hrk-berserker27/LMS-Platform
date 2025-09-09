#!/usr/bin/env node

const { execSync } = require('child_process');
const IORedis = require('ioredis');

async function checkRedis() {
    try {
        const redis = new IORedis('redis://127.0.0.1:6379');
        await redis.ping();
        await redis.quit();
        console.log('✅ Redis is running');
        return true;
    } catch (error) {
        console.log('❌ Redis is not running');
        return false;
    }
}

async function startRedis() {
    try {
        console.log('🚀 Starting Redis with Docker...');
        execSync('docker-compose -f docker-compose.test.yml up -d redis-test', { stdio: 'inherit' });
        
        // Wait for Redis to be ready
        let attempts = 0;
        while (attempts < 30) {
            if (await checkRedis()) {
                console.log('✅ Redis started successfully');
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
        
        console.log('❌ Redis failed to start within 30 seconds');
        return false;
    } catch (error) {
        console.log('❌ Failed to start Redis:', error.message);
        return false;
    }
}

async function main() {
    console.log('🔧 Setting up test environment...');
    
    const isRedisRunning = await checkRedis();
    
    if (!isRedisRunning) {
        console.log('📦 Redis not found, attempting to start with Docker...');
        const started = await startRedis();
        
        if (!started) {
            console.log('\n📋 Manual setup required:');
            console.log('1. Install Redis: https://redis.io/download');
            console.log('2. Start Redis: redis-server');
            console.log('3. Or use Docker: docker run -d -p 6379:6379 redis:alpine');
            process.exit(1);
        }
    }
    
    console.log('\n✅ Test environment ready!');
    console.log('Run: npm run test:workers');
}

main().catch(console.error);