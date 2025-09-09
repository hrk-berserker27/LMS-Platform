module.exports = {
    USER_ROLES: ['student', 'instructor', 'admin'],
    NOTIFICATION_TYPES: ['assignment', 'course', 'email', 'sms', 'push'],
    DEFAULT_PAGE_SIZE: 20,
    JWT_EXPIRES_IN: '1d',
    PASSWORD_MIN_LENGTH: 8,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    COURSE_STATUSES: ['active', 'inactive', 'completed'],
    ASSIGNMENT_STATUSES: ['pending', 'submitted', 'graded'],
    EMAIL_SUBJECTS: {
        ASSIGNMENT_GRADED: 'Your Assignment Has Been Graded',
        NEW_ASSIGNMENT: 'New Assignment Posted',
        COURSE_UPDATE: 'Course Update Notification'
    },
    REDIS_QUEUE_NAMES: {
        NOTIFICATIONS: 'notifications'
    },
    MESSAGES: {
        AUTH: {
            USER_EXISTS: 'User already exists',
            REGISTRATION_SUCCESS: 'User registered successfully',
            REGISTRATION_FAILED: 'Registration failed',
            LOGIN_SUCCESS: 'Login successful',
            LOGIN_FAILED: 'Login failed',
            INVALID_CREDENTIALS: 'Invalid credentials'
        },
        USER: {
            NOT_FOUND: 'User not found',
            FORBIDDEN: 'Forbidden',
            UNAUTHORIZED: 'Access denied. No token provided.',
            INVALID_TOKEN: 'Invalid token.',
            CREATED: 'User created',
            UPDATED: 'User updated successfully',
            DELETED: 'User deleted successfully',
            PROFILE_UPDATED: 'Profile updated successfully',
            ACCOUNT_DELETED: 'Account deleted',
            PASSWORD_UPDATED: 'Password updated',
            FETCH_FAILED: 'Failed to fetch users',
            CREATE_FAILED: 'Failed to create user',
            UPDATE_FAILED: 'Failed to update user',
            DELETE_FAILED: 'Failed to delete user',
            PROFILE_FETCH_FAILED: 'Failed to fetch profile',
            PROFILE_UPDATE_FAILED: 'Failed to update profile',
            ACCOUNT_DELETE_FAILED: 'Failed to delete account',
            PASSWORD_UPDATE_FAILED: 'Failed to update password',
            MISSING_FIELDS: 'Missing required fields: oldPassword, newPassword',
            PASSWORD_INCORRECT: 'Incorrect old password'
        },
        COURSE: {
            NOT_IMPLEMENTED: 'Not implemented yet',
            CREATE_FAILED: 'Failed to create course',
            UPDATE_FAILED: 'Failed to update course',
            DELETE_FAILED: 'Failed to delete course',
            FETCH_FAILED: 'Failed to get course',
            ENROLL_FAILED: 'Failed to enroll in course',
            NOT_FOUND: 'Course not found'
        },
        ASSIGNMENT: {
            NOT_IMPLEMENTED: 'Not implemented yet',
            CREATE_FAILED: 'Failed to create assignment',
            UPDATE_FAILED: 'Failed to update assignment',
            DELETE_FAILED: 'Failed to delete assignment',
            GRADE_FAILED: 'Failed to grade assignment',
            SUBMIT_SUCCESS: 'Assignment submitted successfully',
            SUBMIT_FAILED: 'Failed to submit assignment',
            NOT_FOUND: 'Assignment not found',
            INVALID_COURSE: 'Assignment does not belong to this course',
            PAST_DEADLINE: 'Assignment submission deadline has passed',
            NO_SUBMISSION: 'No submission found for this assignment',
            CREATE_SUCCESS: 'Assignment created successfully',
            UPDATE_SUCCESS: 'Assignment updated successfully',
            DELETE_SUCCESS: 'Assignment deleted successfully',
            GRADE_SUCCESS: 'Assignment graded successfully',
            HAS_SUBMISSIONS: 'Cannot delete assignment with existing submissions'
        },
        NOTIFICATION: {
            FETCH_FAILED: 'Failed to fetch notifications',
            MARK_READ_FAILED: 'Failed to mark notification as read',
            DELETE_FAILED: 'Failed to delete notification',
            DELETED: 'Notification deleted'
        },
        VALIDATION: {
            NAME_MIN: 'Name must be at least 2 characters long',
            NAME_MAX: 'Name cannot exceed 50 characters',
            NAME_REQUIRED: 'Name is required',
            EMAIL_INVALID: 'Please provide a valid email address',
            EMAIL_REQUIRED: 'Email is required',
            PASSWORD_MIN: 'Password must be at least 8 characters long',
            PASSWORD_REQUIRED: 'Password is required',
            PASSWORD_COMPLEXITY: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            ROLE_INVALID: 'Role must be one of: student, instructor, admin',
            ROLE_REQUIRED: 'Role is required',
            ALL_FIELDS_REQUIRED: 'Missing required fields: name, email, password, role',
            PASSWORD_LENGTH: 'Password must be at least 8 characters long',
            REQUIRED_FIELDS: 'Missing required fields'
        },
        REGEX: {
            EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
        }
    }
};