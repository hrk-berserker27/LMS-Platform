# Local Development Setup

## Install MongoDB
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. MongoDB will run on localhost:27017 by default

## Install Redis
1. Download Redis for Windows from https://github.com/microsoftarchive/redis/releases
2. Install and start Redis service
3. Redis will run on localhost:6379 by default

## Start Services
```bash
# Start MongoDB (if not running as service)
mongod --dbpath C:\data\db

# Start Redis (if not running as service)
redis-server
```

Your current .env file will work with these local installations.