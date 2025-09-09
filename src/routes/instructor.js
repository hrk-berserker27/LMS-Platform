const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const instructorMiddleware = require('../middleware/instructor');
const courseController = require('../controllers/course');
const assignmentController = require('../controllers/assignment');

router.post('/courses', authMiddleware, instructorMiddleware, courseController.createCourse);
router.put('/courses/:id', authMiddleware, instructorMiddleware, courseController.updateCourse);
router.delete('/courses/:id', authMiddleware, instructorMiddleware, courseController.deleteCourse);

router.post('/courses/:id/assignments', authMiddleware, instructorMiddleware, assignmentController.createAssignment);
router.put('/courses/:id/assignments/:assignmentId', authMiddleware, instructorMiddleware, assignmentController.updateAssignment);
router.delete('/courses/:id/assignments/:assignmentId', authMiddleware, instructorMiddleware, assignmentController.deleteAssignment);
router.post('/courses/:id/assignments/:assignmentId/grade', authMiddleware, instructorMiddleware, assignmentController.gradeAssignment);

module.exports = router;