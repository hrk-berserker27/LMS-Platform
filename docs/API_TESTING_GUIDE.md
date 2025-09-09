# API Testing Guide

## Prerequisites

1. **Start Docker Services**
```bash
docker compose up -d
```

2. **Check Container Status**
```bash
docker compose ps
```

3. **Check App Logs**
```bash
docker compose logs app
```

## Basic API Testing

### Test Server Health
```bash
curl http://localhost:3001/api/v1/auth/register
```

### Register a New User
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Test User","email":"test@example.com","password":"TestPass123!","role":"student"}'
```

### Login and Get Token (PowerShell)
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@example.com","password":"TestPass123!"}'
```

```powershell
$token = $response.token
```

```powershell
echo $token
```

### Test Protected Routes
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users/me" -Method GET -Headers @{Authorization="Bearer $token"}
```

## Alternative: Using curl with Token File

### Save Token to File
```powershell
$token | Out-File token.txt
```

### Use Token in curl
```bash
curl -X GET http://localhost:3001/api/v1/users/me -H "Authorization: Bearer $(Get-Content token.txt)"
```

## Complete Test Workflow

### 1. User Registration
```powershell
# Register Student
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"John Student","email":"student@test.com","password":"TestPass123!","role":"student"}'

# Register Instructor  
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Jane Instructor","email":"instructor@test.com","password":"TestPass123!","role":"instructor"}'

# Register Admin
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" -Method POST -ContentType "application/json" -Body '{"name":"Admin User","email":"admin@test.com","password":"TestPass123!","role":"admin"}'
```

### 2. Login and Get Tokens
```powershell
# Student Login
$studentResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"student@test.com","password":"TestPass123!"}'
$studentToken = $studentResponse.token

# Instructor Login
$instructorResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"instructor@test.com","password":"TestPass123!"}'
$instructorToken = $instructorResponse.token

# Admin Login
$adminResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@test.com","password":"TestPass123!"}'
$adminToken = $adminResponse.token
```

### 3. Test Role-Based Access

#### Student Routes
```powershell
# Get student profile
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users/me" -Method GET -Headers @{Authorization="Bearer $studentToken"}

# Get student courses
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users/me/courses" -Method GET -Headers @{Authorization="Bearer $studentToken"}

# Get student notifications
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users/me/notifications" -Method GET -Headers @{Authorization="Bearer $studentToken"}
```

#### Instructor Routes
```powershell
# Create course (instructor only)
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/instructor/courses" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $instructorToken"} -Body '{"title":"JavaScript Fundamentals","description":"Learn the basics of JavaScript programming"}'

# Get instructor profile
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users/me" -Method GET -Headers @{Authorization="Bearer $instructorToken"}
```

#### Admin Routes
```powershell
# Get all users (admin only)
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/users" -Method GET -Headers @{Authorization="Bearer $adminToken"}

# Create user (admin only)
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/users" -Method POST -ContentType "application/json" -Headers @{Authorization="Bearer $adminToken"} -Body '{"name":"New User","email":"newuser@test.com","password":"TestPass123!","role":"student"}'
```

### 4. Test Error Scenarios

#### Unauthorized Access
```powershell
# Try to access protected route without token
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users/me" -Method GET
```

#### Invalid Credentials
```powershell
# Try login with wrong password
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"student@test.com","password":"WrongPassword"}'
```

#### Role-Based Access Denial
```powershell
# Try admin route with student token
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/admin/users" -Method GET -Headers @{Authorization="Bearer $studentToken"}
```

## Debugging Commands

### Check Container Status
```bash
docker compose ps
```

### View Application Logs
```bash
docker compose logs app
```

### View MongoDB Logs
```bash
docker compose logs mongo
```

### Check Network Connectivity
```bash
docker compose exec app ping mongo
```

### Test MongoDB Connection
```bash
docker compose exec mongo mongosh admin --eval "db.auth('admin', '970dH4JK')"
```

### Check Environment Variables
```bash
docker compose exec app env | grep MONGODB
```

## Common Issues and Solutions

### 1. Connection Refused
- Check if containers are running: `docker compose ps`
- Check app logs: `docker compose logs app`
- Restart services: `docker compose restart app`

### 2. MongoDB Connection Failed
- Check MongoDB logs: `docker compose logs mongo`
- Test MongoDB auth: `docker compose exec mongo mongosh admin --eval "db.auth('admin', '970dH4JK')"`
- Reset database: `docker compose down -v && docker compose up -d`

### 3. Authentication Errors
- Verify password complexity: Must contain uppercase, lowercase, number, and special character
- Check token expiry: Tokens expire after 24 hours
- Verify role permissions: Different endpoints require different roles

### 4. JSON Syntax Errors (Windows)
- Use PowerShell instead of Command Prompt
- Use single quotes around JSON in PowerShell
- Create JSON files for complex requests

## Performance Testing

### Load Testing with Multiple Requests
```powershell
# Test multiple registrations
1..10 | ForEach-Object {
    Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" -Method POST -ContentType "application/json" -Body "{`"name`":`"User$_`",`"email`":`"user$_@test.com`",`"password`":`"TestPass123!`",`"role`":`"student`"}"
}
```

### Response Time Testing
```powershell
Measure-Command {
    Invoke-RestMethod -Uri "http://localhost:3001/api/v1/users/me" -Method GET -Headers @{Authorization="Bearer $token"}
}
```

## API Endpoints Reference

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### User Management
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update current user profile
- `DELETE /api/v1/users/me` - Delete current user account
- `PUT /api/v1/users/me/password` - Update password

### Admin Routes
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/users/:id` - Get user by ID
- `POST /api/v1/admin/users` - Create new user
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user

### Instructor Routes
- `POST /api/v1/instructor/courses` - Create course
- `PUT /api/v1/instructor/courses/:id` - Update course
- `DELETE /api/v1/instructor/courses/:id` - Delete course

### Student Routes
- `POST /api/v1/student/courses/:id/enroll` - Enroll in course

For complete API documentation, see `API_DOCUMENTATION.md`.