# Major Project BCA - Backend

A Node.js backend application with Docker support for containerized development and testing.

## Features

- RESTful API with Express.js
- MongoDB database with Mongoose ODM
- Redis for caching and job queues
- BullMQ for background job processing
- JWT authentication
- Email notifications with Nodemailer
- Comprehensive testing with Jest
- Docker containerization

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

## Quick Start with Docker

1. **Clone and navigate to the project:**
   ```bash
   cd "Major Project BCA/Backend"
   ```

2. **Start the application:**
   ```bash
   npm run docker:up
   ```

3. **View logs:**
   ```bash
   npm run docker:logs
   ```

4. **Stop the application:**
   ```bash
   npm run docker:down
   ```

## Testing with Docker

Run tests in Docker containers:
```bash
npm run docker:test
```

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB and Redis locally or use Docker:**
   ```bash
   docker run -d -p 27017:27017 mongo:7
   docker run -d -p 6379:6379 redis:7-alpine
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run worker` - Start notification worker
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:coverage` - Run tests with coverage report
- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:test` - Run tests in Docker
- `npm run docker:logs` - View Docker logs

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic services
├── subscribers/     # Background job workers
└── utils/           # Utility functions

tests/
├── unit/            # Unit tests
├── integration/     # Integration tests
└── setup.js         # Test configuration
```

## API Endpoints

- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/me` - Get current user profile
- `PUT /api/v1/me` - Update current user profile
- `DELETE /api/v1/me` - Delete current user account

## Docker Services

- **app** - Main Node.js application (port 3000)
- **mongo** - MongoDB database (port 27017)
- **redis** - Redis cache/queue (port 6379)
- **worker** - Background job processor

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/majorproject |
| REDIS_URL | Redis connection string | redis://localhost:6379 |
| JWT_SECRET | JWT signing secret | - |
| EMAIL_HOST | SMTP host | - |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_USER | SMTP username | - |
| EMAIL_PASS | SMTP password | - |