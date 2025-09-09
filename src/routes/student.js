const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const studentMiddleware = require('../middleware/student');
const courseController = require('../controllers/course');
const assignmentController = require('../controllers/assignment');

router.post('/courses/:id/enroll', authMiddleware, studentMiddleware, courseController.enrollInCourse);
router.post('/courses/:id/assignments', authMiddleware, studentMiddleware, assignmentController.submitAssignment);
router.get('/courses/:id/assignments/:assignmentId/grade', authMiddleware, studentMiddleware, assignmentController.getAssignmentGrade);

module.exports = router;