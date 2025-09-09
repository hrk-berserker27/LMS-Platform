# Major Project BCA - Backend API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication & Authorization

### JWT Token Structure
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control
The JWT token contains user information including their role. Different endpoints require different roles:

- **Public Routes**: No authentication required (register, login)
- **User Routes**: Any authenticated user (student, instructor, admin)
- **Admin Routes**: Only users with `role: "admin"`
- **Instructor Routes**: Only users with `role: "instructor"`
- **Student Routes**: Only users with `role: "student"`

### Token Payload Example
```json
{
  "id": "675a1b2c3d4e5f6789012345",
  "email": "john@example.com",
  "role": "student",
  "iat": 1703980800,
  "exp": 1704067200
}
```

### Getting Your Token
1. **Register** or **Login** to receive a JWT token
2. **Include token** in all subsequent requests
3. **Token expires** in 24 hours (1d)
4. **Role determines** which endpoints you can access

---

## 🔐 Authentication Routes

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "<your_secure_password>",
  "role": "student"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "<your_secure_password>"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

## 👤 User Routes

### Get My Profile
```http
GET /users/me
Authorization: Bearer <token>
```

### Update My Profile
```http
PUT /users/me
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

### Update Password
```http
PUT /users/me/password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "oldPassword": "<current_password>",
  "newPassword": "<new_secure_password>"
}
```

### Delete Account
```http
DELETE /users/me
Authorization: Bearer <token>
```

### Get My Courses
```http
GET /users/me/courses
Authorization: Bearer <token>
```

### Enroll in Course
```http
POST /users/me/courses/:id/enroll
Authorization: Bearer <token>
```

### Submit Assignment
```http
POST /users/me/courses/:id/assignments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "assignmentId": "assignment_id",
  "content": "My assignment solution...",
  "attachments": [
    {
      "filename": "solution.pdf",
      "path": "/uploads/solution.pdf"
    }
  ]
}
```

### Get Assignment Submissions
```http
GET /users/me/courses/:id/assignments/:assignmentId/submissions
Authorization: Bearer <token>
```

### Get Assignment Grades
```http
GET /users/me/courses/:id/assignments/:assignmentId/grades
Authorization: Bearer <token>
```

### Get Assignment Feedback
```http
GET /users/me/courses/:id/assignments/:assignmentId/feedback
Authorization: Bearer <token>
```

### Get My Notifications
```http
GET /users/me/notifications?page=1&pageSize=20
Authorization: Bearer <token>
```

### Mark Notification as Read
```http
PUT /users/me/notifications/:id/read
Authorization: Bearer <token>
```

### Delete Notification
```http
DELETE /users/me/notifications/:id
Authorization: Bearer <token>
```

---

## 👨‍💼 Admin Routes
*Requires admin role*

### Get All Users
```http
GET /admin/users?page=1&pageSize=20
Authorization: Bearer <admin_token>
```

### Get User by ID
```http
GET /admin/users/:id
Authorization: Bearer <admin_token>
```

### Create User
```http
POST /admin/users
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "<temporary_password>",
  "role": "student"
}
```

### Update User
```http
PUT /admin/users/:id
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "instructor"
}
```

### Delete User
```http
DELETE /admin/users/:id
Authorization: Bearer <admin_token>
```

---

## 👨‍🏫 Instructor Routes
*Requires instructor role*

### Create Course
```http
POST /instructor/courses
Authorization: Bearer <instructor_token>
```

**Request Body:**
```json
{
  "title": "JavaScript Fundamentals",
  "description": "Learn the basics of JavaScript programming"
}
```

### Update Course
```http
PUT /instructor/courses/:id
Authorization: Bearer <instructor_token>
```

### Delete Course
```http
DELETE /instructor/courses/:id
Authorization: Bearer <instructor_token>
```

### Create Assignment
```http
POST /instructor/courses/:id/assignments
Authorization: Bearer <instructor_token>
```

**Request Body:**
```json
{
  "title": "JavaScript Basics Quiz",
  "description": "Complete the JavaScript exercises",
  "dueDate": "2025-01-15T23:59:59.000Z",
  "maxPoints": 100
}
```

### Update Assignment
```http
PUT /instructor/courses/:id/assignments/:assignmentId
Authorization: Bearer <instructor_token>
```

### Delete Assignment
```http
DELETE /instructor/courses/:id/assignments/:assignmentId
Authorization: Bearer <instructor_token>
```

### Grade Assignment
```http
POST /instructor/courses/:id/assignments/:assignmentId/grade
Authorization: Bearer <instructor_token>
```

**Request Body:**
```json
{
  "studentId": "student_id",
  "points": 85,
  "feedback": "Good work! Consider improving error handling."
}
```

---

## 👨‍🎓 Student Routes
*Requires student role*

### Get Available Courses
```http
GET /student/courses
Authorization: Bearer <student_token>
```

### Enroll in Course
```http
POST /student/courses/:id/enroll
Authorization: Bearer <student_token>
```

---

## 📝 Data Models

### User
```json
{
  "id": "string",
  "name": "string (2-50 chars)",
  "email": "string (valid email)",
  "role": "student|instructor|admin",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Course
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "instructor": "user_id",
  "students": ["user_id"],
  "assignments": ["assignment_id"],
  "videos": [
    {
      "title": "string",
      "url": "string",
      "duration": "number"
    }
  ],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Assignment
```json
{
  "id": "string",
  "title": "string (max 100 chars)",
  "description": "string",
  "course": "course_id",
  "instructor": "user_id",
  "dueDate": "datetime",
  "maxPoints": "number (min 1)",
  "status": "draft|published|closed",
  "submissions": [
    {
      "student": "user_id",
      "submittedAt": "datetime",
      "content": "string",
      "attachments": [
        {
          "filename": "string",
          "path": "string",
          "size": "number"
        }
      ],
      "grade": {
        "points": "number",
        "feedback": "string",
        "gradedAt": "datetime",
        "gradedBy": "user_id"
      }
    }
  ],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Notification
```json
{
  "id": "string",
  "user": "user_id",
  "message": "string",
  "type": "email|sms|push|assignment|course|announcement|reminder",
  "data": "object",
  "read": "boolean",
  "createdAt": "datetime"
}
```

---

## 🔒 Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

---

## 📄 Pagination
Most list endpoints support pagination:
```
?page=1&pageSize=20
```
- `page`: Page number (default: 1)
- `pageSize`: Items per page (default: 20, max: 100)

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "message": "User already exists"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## 🚀 Rate Limiting
- **Window**: 15 minutes
- **Max Requests**: 100 per window per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 🔧 Environment Variables
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/majorproject
JWT_SECRET=your-super-secure-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
REDIS_URL=redis://127.0.0.1:6379
```

---

## 📚 Example Usage

### Complete User Flow Examples

#### Student Registration & Course Enrollment
```javascript
// 1. Register as Student
const registerResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Alice Johnson',
    email: 'alice@student.edu',
    password: '<secure_password>',
    role: 'student'
  })
});

const { token: studentToken } = await registerResponse.json();
// studentToken contains: { id: "...", email: "alice@student.edu", role: "student" }

// 2. Get student profile
const profileResponse = await fetch('/api/v1/users/me', {
  headers: { 'Authorization': `Bearer ${studentToken}` }
});

// 3. Enroll in course (student-only action)
const enrollResponse = await fetch('/api/v1/users/me/courses/675a1b2c3d4e5f6789012345/enroll', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${studentToken}` }
});
```

#### Instructor Course Management
```javascript
// 1. Login as Instructor
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'prof.smith@university.edu',
    password: '<secure_password>'
  })
});

const { token: instructorToken } = await loginResponse.json();
// instructorToken contains: { id: "...", email: "prof.smith@university.edu", role: "instructor" }

// 2. Create course (instructor-only action)
const courseResponse = await fetch('/api/v1/instructor/courses', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${instructorToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Advanced JavaScript',
    description: 'Deep dive into modern JavaScript concepts'
  })
});

// 3. Create assignment (instructor-only action)
const assignmentResponse = await fetch('/api/v1/instructor/courses/675a1b2c3d4e5f6789012345/assignments', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${instructorToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Async/Await Exercise',
    description: 'Implement async functions using modern syntax',
    dueDate: '2025-02-15T23:59:59.000Z',
    maxPoints: 100
  })
});
```

#### Admin User Management
```javascript
// 1. Login as Admin
const adminLoginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@university.edu',
    password: '<secure_password>'
  })
});

const { token: adminToken } = await adminLoginResponse.json();
// adminToken contains: { id: "...", email: "admin@university.edu", role: "admin" }

// 2. Get all users (admin-only action)
const usersResponse = await fetch('/api/v1/admin/users?page=1&pageSize=10', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});

// 3. Create new instructor (admin-only action)
const createUserResponse = await fetch('/api/v1/admin/users', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Dr. Jane Wilson',
    email: 'jane.wilson@university.edu',
    password: '<temporary_password>',
    role: 'instructor'
  })
});
```

### Authorization Error Examples
```javascript
// ❌ Student trying to access admin route
const failedResponse = await fetch('/api/v1/admin/users', {
  headers: { 'Authorization': `Bearer ${studentToken}` }
});
// Returns: 403 Forbidden - { "message": "Forbidden" }

// ❌ No token provided
const noTokenResponse = await fetch('/api/v1/users/me');
// Returns: 401 Unauthorized - { "message": "Access denied. No token provided." }

// ❌ Invalid/expired token
const invalidTokenResponse = await fetch('/api/v1/users/me', {
  headers: { 'Authorization': 'Bearer invalid_token' }
});
// Returns: 401 Unauthorized - { "message": "Invalid token." }
```

---

---

## 🔐 Security Notes

### Token Security
- **Store tokens securely** (localStorage/sessionStorage for web, secure storage for mobile)
- **Include tokens** in Authorization header for all protected routes
- **Handle token expiration** (24-hour expiry, re-login required)
- **Never expose tokens** in URLs or logs

### Role Validation
- **Server-side validation** - All role checks happen on the backend
- **JWT payload** contains user role information
- **Middleware enforcement** - Routes automatically check user roles
- **Principle of least privilege** - Users can only access their authorized resources

### Example Token Validation Flow
1. **Client sends request** with `Authorization: Bearer <token>`
2. **Server validates token** using JWT secret
3. **Server extracts user info** from token payload
4. **Middleware checks role** against route requirements
5. **Request proceeds** if authorized, otherwise returns 403 Forbidden

---

*Last Updated: 6th September, 2025*
*API Version: 1.0*
*Documentation Status: Production Ready*