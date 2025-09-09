const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const userController = require('../controllers/user');

router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, userController.updateMe);
router.delete('/me', authMiddleware, userController.deleteMe);
router.put('/me/password', authMiddleware, userController.updatePassword);

router.get('/me/courses', authMiddleware, userController.getMyCourses);
router.post('/me/courses/:id/enroll', authMiddleware, userController.enrollInCourse);
router.post('/me/courses/:id/assignments', authMiddleware, userController.submitAssignment);
router.get('/me/courses/:id/assignments/:assignmentId/submissions', authMiddleware, userController.getMyAssignmentSubmissions);
router.get('/me/courses/:id/assignments/:assignmentId/grades', authMiddleware, userController.getMyAssignmentGrades);
router.get('/me/courses/:id/assignments/:assignmentId/feedback', authMiddleware, userController.getMyAssignmentFeedback);

router.get('/me/notifications', authMiddleware, userController.getMyNotifications);
router.put('/me/notifications/:id/read', authMiddleware, userController.markNotificationAsRead);
router.delete('/me/notifications/:id', authMiddleware, userController.deleteNotification);

module.exports = router;