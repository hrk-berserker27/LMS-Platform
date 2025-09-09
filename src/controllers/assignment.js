const { MESSAGES } = require('../constants/constants');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const { logger, sanitizeLog } = require('../utils/logger');

const assignmentController = {
    createAssignment: async (req, res) => {
        try {
            const { title, description, dueDate, maxPoints } = req.body;
            const { courseId } = req.params;
            const instructorId = req.user.id;
            
            // Validate required fields
            if (!title || !description || !dueDate) {
                logger.warn('Assignment creation failed - missing required fields', { 
                    instructorId: sanitizeLog(instructorId) 
                });
                return res.status(400).json({ message: MESSAGES.VALIDATION.REQUIRED_FIELDS });
            }
            
            // Verify course exists and instructor has access
            const course = await Course.findById(courseId);
            if (!course) {
                logger.warn('Assignment creation failed - course not found', { 
                    courseId: sanitizeLog(courseId) 
                });
                return res.status(404).json({ message: MESSAGES.COURSE.NOT_FOUND });
            }
            
            if (course.instructor.toString() !== instructorId) {
                logger.warn('Assignment creation failed - unauthorized instructor', { 
                    instructorId: sanitizeLog(instructorId), 
                    courseId: sanitizeLog(courseId) 
                });
                return res.status(403).json({ message: MESSAGES.USER.FORBIDDEN });
            }
            
            // Create assignment
            const assignment = new Assignment({
                title,
                description,
                course: courseId,
                instructor: instructorId,
                dueDate: new Date(dueDate),
                maxPoints: maxPoints || 100
            });
            
            await assignment.save();
            
            logger.info('Assignment created successfully', { 
                assignmentId: sanitizeLog(assignment._id), 
                instructorId: sanitizeLog(instructorId) 
            });
            
            res.status(201).json({ 
                message: MESSAGES.ASSIGNMENT.CREATE_SUCCESS,
                assignment: {
                    id: assignment._id,
                    title: assignment.title,
                    description: assignment.description,
                    dueDate: assignment.dueDate,
                    maxPoints: assignment.maxPoints
                }
            });
            
        } catch (error) {
            logger.error('Assignment creation failed', sanitizeLog(error.message), { 
                instructorId: sanitizeLog(req.user?.id) 
            });
            res.status(500).json({ message: MESSAGES.ASSIGNMENT.CREATE_FAILED });
        }
    },
    updateAssignment: async (req, res) => {
        try {
            const { assignmentId } = req.params;
            const { title, description, dueDate, maxPoints } = req.body;
            const instructorId = req.user.id;
            
            // Find assignment
            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                logger.warn('Assignment update failed - assignment not found', { 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NOT_FOUND });
            }
            
            // Check instructor authorization
            if (assignment.instructor.toString() !== instructorId) {
                logger.warn('Assignment update failed - unauthorized instructor', { 
                    instructorId: sanitizeLog(instructorId), 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(403).json({ message: MESSAGES.USER.FORBIDDEN });
            }
            
            // Update fields if provided
            if (title) assignment.title = title;
            if (description) assignment.description = description;
            if (dueDate) assignment.dueDate = new Date(dueDate);
            if (maxPoints !== undefined) assignment.maxPoints = maxPoints;
            
            await assignment.save();
            
            logger.info('Assignment updated successfully', { 
                assignmentId: sanitizeLog(assignmentId), 
                instructorId: sanitizeLog(instructorId) 
            });
            
            res.status(200).json({ 
                message: MESSAGES.ASSIGNMENT.UPDATE_SUCCESS,
                assignment: {
                    id: assignment._id,
                    title: assignment.title,
                    description: assignment.description,
                    dueDate: assignment.dueDate,
                    maxPoints: assignment.maxPoints
                }
            });
            
        } catch (error) {
            logger.error('Assignment update failed', sanitizeLog(error.message), { 
                instructorId: sanitizeLog(req.user?.id), 
                assignmentId: sanitizeLog(req.params?.assignmentId) 
            });
            res.status(500).json({ message: MESSAGES.ASSIGNMENT.UPDATE_FAILED });
        }
    },
    deleteAssignment: async (req, res) => {
        try {
            const { assignmentId } = req.params;
            const instructorId = req.user.id;
            
            // Find assignment
            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                logger.warn('Assignment deletion failed - assignment not found', { 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NOT_FOUND });
            }
            
            // Check instructor authorization
            if (assignment.instructor.toString() !== instructorId) {
                logger.warn('Assignment deletion failed - unauthorized instructor', { 
                    instructorId: sanitizeLog(instructorId), 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(403).json({ message: MESSAGES.USER.FORBIDDEN });
            }
            
            // Check if there are submissions
            if (assignment.submissions.length > 0) {
                logger.warn('Assignment deletion failed - has submissions', { 
                    assignmentId: sanitizeLog(assignmentId), 
                    submissionCount: assignment.submissions.length 
                });
                return res.status(400).json({ message: MESSAGES.ASSIGNMENT.HAS_SUBMISSIONS });
            }
            
            await Assignment.findByIdAndDelete(assignmentId);
            
            logger.info('Assignment deleted successfully', { 
                assignmentId: sanitizeLog(assignmentId), 
                instructorId: sanitizeLog(instructorId) 
            });
            
            res.status(200).json({ message: MESSAGES.ASSIGNMENT.DELETE_SUCCESS });
            
        } catch (error) {
            logger.error('Assignment deletion failed', sanitizeLog(error.message), { 
                instructorId: sanitizeLog(req.user?.id), 
                assignmentId: sanitizeLog(req.params?.assignmentId) 
            });
            res.status(500).json({ message: MESSAGES.ASSIGNMENT.DELETE_FAILED });
        }
    },
    gradeAssignment: async (req, res) => {
        try {
            const { assignmentId, studentId } = req.params;
            const { grade, feedback } = req.body;
            const instructorId = req.user.id;
            
            // Validate required fields
            if (grade === undefined || grade === null) {
                logger.warn('Assignment grading failed - missing grade', { 
                    instructorId: sanitizeLog(instructorId), 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(400).json({ message: MESSAGES.VALIDATION.REQUIRED_FIELDS });
            }
            
            // Find assignment
            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                logger.warn('Assignment grading failed - assignment not found', { 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NOT_FOUND });
            }
            
            // Check instructor authorization
            if (assignment.instructor.toString() !== instructorId) {
                logger.warn('Assignment grading failed - unauthorized instructor', { 
                    instructorId: sanitizeLog(instructorId), 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(403).json({ message: MESSAGES.USER.FORBIDDEN });
            }
            
            // Find student submission
            const submission = assignment.submissions.find(
                sub => sub.student.toString() === studentId
            );
            
            if (!submission) {
                logger.warn('Assignment grading failed - no submission found', { 
                    studentId: sanitizeLog(studentId), 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NO_SUBMISSION });
            }
            
            // Validate grade range
            if (grade < 0 || grade > assignment.maxPoints) {
                logger.warn('Assignment grading failed - invalid grade range', { 
                    grade: sanitizeLog(grade), 
                    maxPoints: assignment.maxPoints 
                });
                return res.status(400).json({ 
                    message: `Grade must be between 0 and ${assignment.maxPoints}` 
                });
            }
            
            // Update submission
            submission.grade = grade;
            submission.feedback = feedback || '';
            submission.status = 'graded';
            submission.gradedAt = new Date();
            
            await assignment.save();
            
            logger.info('Assignment graded successfully', { 
                assignmentId: sanitizeLog(assignmentId), 
                studentId: sanitizeLog(studentId), 
                instructorId: sanitizeLog(instructorId) 
            });
            
            res.status(200).json({ 
                message: MESSAGES.ASSIGNMENT.GRADE_SUCCESS,
                grade: {
                    assignmentId,
                    studentId,
                    grade: submission.grade,
                    feedback: submission.feedback,
                    gradedAt: submission.gradedAt
                }
            });
            
        } catch (error) {
            logger.error('Assignment grading failed', sanitizeLog(error.message), { 
                instructorId: sanitizeLog(req.user?.id), 
                assignmentId: sanitizeLog(req.params?.assignmentId) 
            });
            res.status(500).json({ message: MESSAGES.ASSIGNMENT.GRADE_FAILED });
        }
    },
    
    submitAssignment: async (req, res) => {
        try {
            const { id: courseId, assignmentId } = req.params;
            const { content, attachments } = req.body;
            const studentId = req.user.id;
            
            // Validate required fields
            if (!content) {
                logger.warn('Assignment submission failed - missing content', { 
                    studentId: sanitizeLog(studentId), 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(400).json({ message: MESSAGES.VALIDATION.REQUIRED_FIELDS });
            }
            
            // Find assignment
            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                logger.warn('Assignment submission failed - assignment not found', { 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NOT_FOUND });
            }
            
            // Check if assignment belongs to course
            if (assignment.course.toString() !== courseId) {
                logger.warn('Assignment submission failed - assignment not in course', { 
                    assignmentId: sanitizeLog(assignmentId), 
                    courseId: sanitizeLog(courseId) 
                });
                return res.status(400).json({ message: MESSAGES.ASSIGNMENT.INVALID_COURSE });
            }
            
            // Check deadline
            if (new Date() > assignment.dueDate) {
                logger.warn('Assignment submission failed - past deadline', { 
                    studentId: sanitizeLog(studentId), 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(400).json({ message: MESSAGES.ASSIGNMENT.PAST_DEADLINE });
            }
            
            // Check if already submitted
            const existingSubmission = assignment.submissions.find(
                sub => sub.student.toString() === studentId
            );
            
            if (existingSubmission) {
                // Update existing submission
                existingSubmission.content = content;
                existingSubmission.attachments = attachments || [];
                existingSubmission.submittedAt = new Date();
                existingSubmission.status = 'submitted';
            } else {
                // Create new submission
                assignment.submissions.push({
                    student: studentId,
                    content,
                    attachments: attachments || [],
                    submittedAt: new Date(),
                    status: 'submitted'
                });
            }
            
            await assignment.save();
            
            logger.info('Assignment submitted successfully', { 
                studentId: sanitizeLog(studentId), 
                assignmentId: sanitizeLog(assignmentId) 
            });
            
            res.status(200).json({ 
                message: MESSAGES.ASSIGNMENT.SUBMIT_SUCCESS,
                submissionId: assignment.submissions[assignment.submissions.length - 1]._id
            });
            
        } catch (error) {
            logger.error('Assignment submission failed', sanitizeLog(error.message), { 
                studentId: sanitizeLog(req.user?.id), 
                assignmentId: sanitizeLog(req.params?.assignmentId) 
            });
            res.status(500).json({ message: MESSAGES.ASSIGNMENT.SUBMIT_FAILED });
        }
    },
    
    getAssignmentGrade: async (req, res) => {
        try {
            const { assignmentId } = req.params;
            const studentId = req.user.id;
            
            // Find assignment
            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) {
                logger.warn('Grade retrieval failed - assignment not found', { 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NOT_FOUND });
            }
            
            // Find student's submission
            const submission = assignment.submissions.find(
                sub => sub.student.toString() === studentId
            );
            
            if (!submission) {
                logger.warn('Grade retrieval failed - no submission found', { 
                    studentId: sanitizeLog(studentId), 
                    assignmentId: sanitizeLog(assignmentId) 
                });
                return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NO_SUBMISSION });
            }
            
            logger.info('Assignment grade retrieved', { 
                studentId: sanitizeLog(studentId), 
                assignmentId: sanitizeLog(assignmentId) 
            });
            
            res.status(200).json({
                assignmentId,
                grade: submission.grade,
                feedback: submission.feedback,
                status: submission.status,
                submittedAt: submission.submittedAt,
                gradedAt: submission.gradedAt
            });
            
        } catch (error) {
            logger.error('Grade retrieval failed', sanitizeLog(error.message), { 
                studentId: sanitizeLog(req.user?.id), 
                assignmentId: sanitizeLog(req.params?.assignmentId) 
            });
            res.status(500).json({ message: MESSAGES.ASSIGNMENT.GRADE_FAILED });
        }
    }
};

module.exports = assignmentController;