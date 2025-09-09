# Setup Guide

## Docker Setup (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Git for version control

### Quick Start
```bash
# Clone and navigate to project
cd "Major Project BCA/Backend"

# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f app
```

### Environment Configuration
Ensure `.env` file exists with required variables:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://admin:970dH4JK@mongo:27017/majorproject?authSource=admin
MONGO_PASSWORD=970dH4JK
JWT_SECRET=your-super-secure-jwt-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
REDIS_URL=redis://redis:6379
```

### Test the Setup
```powershell
# Register a user
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Test User","email":"test@example.com","password":"TestPass123!","role":"student"}'

# Login
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"TestPass123!"}'
```

## Local Development Setup

### Install Dependencies
```bash
npm install
```

### Install MongoDB
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. MongoDB will run on localhost:27017 by default

### Install Redis
1. Download Redis for Windows from https://github.com/microsoftarchive/redis/releases
2. Install and start Redis service
3. Redis will run on localhost:6379 by default

### Start Services Locally
```bash
# Start MongoDB (if not running as service)
mongod --dbpath C:\data\db

# Start Redis (if not running as service)
redis-server

# Start the application
npm run dev
```

## Testing Setup

### Run Tests
```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# With coverage
npm run test:coverage
```

### Test Environment Setup
For worker tests, ensure Redis is running:
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis-test redis:alpine

# Or use the setup script
node scripts/setup-test-env.js
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run worker` - Start notification worker
- `npm test` - Run all tests
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run lint` - Run ESLint

## Troubleshooting

### Common Issues
- **Port conflicts**: Change port in docker-compose.yml from 3001 to another port
- **MongoDB connection failed**: Check credentials in .env file
- **Container not starting**: Check Docker logs with `docker compose logs <service>`

### Debug Commands
```bash
# Check container status
docker compose ps

# View logs
docker compose logs app
docker compose logs mongo

# Test connectivity
docker compose exec app ping mongo
```

For detailed troubleshooting, see [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md).