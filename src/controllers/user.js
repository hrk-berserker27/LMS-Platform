const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Notification = require('../models/Notification');
const { hashPassword, comparePassword, paginate, formatNotification } = require('../utils/utils');
const { MESSAGES } = require('../constants/constants');

// create controllers for users and features available to each user
const userController = {
    getAllUsers: async (req, res) => {
        try {
            const baseQuery = User.find().select('-password');
            const paginatedQuery = paginate(baseQuery, { page: req.query.page, pageSize: req.query.pageSize });
            const users = await paginatedQuery;
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.USER.FETCH_FAILED });
        }
    },
    getUserById: async (req, res) => {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) return res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.USER.FETCH_FAILED });
        }
    },
    createUser: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;
            
            // Input validation
            if (!name || !email || !password || !role) {
                return res.status(400).json({ message: MESSAGES.VALIDATION.ALL_FIELDS_REQUIRED });
            }
            
            if (password.length < 6) {
                return res.status(400).json({ message: MESSAGES.VALIDATION.PASSWORD_LENGTH });
            }
            
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(409).json({ message: MESSAGES.AUTH.USER_EXISTS });
            
            const hashed = await hashPassword(password);
            const user = new User({ name, email, password: hashed, role });
            await user.save();
            res.status(201).json({ message: MESSAGES.USER.CREATED, user: { id: user._id, name, email, role } });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.USER.CREATE_FAILED });
        }
    },
    updateUser: async (req, res) => {
        try {
            // Explicitly destructure allowed fields to prevent mass assignment
            const { name, email, password, role } = req.body;
            const updates = {};
            
            if (name !== undefined) updates.name = name;
            if (email !== undefined) updates.email = email;
            if (role !== undefined) updates.role = role;
            if (password !== undefined) {
                updates.password = await hashPassword(password);
            }
            
            const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
            if (!user) return res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.USER.UPDATE_FAILED });
        }
    },
    getMe: async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            if (!user) return res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.USER.PROFILE_FETCH_FAILED });
        }
    },
    updateMe: async (req, res) => {
        try {
            // Only allow safe fields to be updated (exclude password and role)
            const { name, email } = req.body;
            const updates = {};
            
            if (name !== undefined) updates.name = name;
            if (email !== undefined) updates.email = email;
            
            const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
            if (!user) return res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.USER.PROFILE_UPDATE_FAILED });
        }
    },
    deleteMe: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.user.id);
            res.status(200).json({ message: MESSAGES.USER.ACCOUNT_DELETED });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.USER.ACCOUNT_DELETE_FAILED });
        }
    },
    updatePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;
            
            // Input validation
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: MESSAGES.USER.MISSING_FIELDS });
            }
            
            if (newPassword.length < 6) {
                return res.status(400).json({ message: MESSAGES.VALIDATION.PASSWORD_LENGTH });
            }
            
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
            
            const isMatch = await comparePassword(oldPassword, user.password);
            if (!isMatch) return res.status(400).json({ message: MESSAGES.USER.PASSWORD_INCORRECT });
            
            user.password = await hashPassword(newPassword);
            await user.save();
            res.status(200).json({ message: MESSAGES.USER.PASSWORD_UPDATED });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.USER.PASSWORD_UPDATE_FAILED });
        }
    },
    getMyNotifications: async (req, res) => {
        try {
            const query = Notification.find({ user: req.user.id });
            const paginatedQuery = paginate(query, { page: req.query.page, pageSize: req.query.pageSize });
            const notifications = await paginatedQuery.exec();
            res.status(200).json(notifications.map(formatNotification));
        } catch (error) {
            res.status(500).json({ message: MESSAGES.NOTIFICATION.FETCH_FAILED });
        }
    },
    markNotificationAsRead: async (req, res) => {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: req.params.id, user: req.user.id },
                { read: true },
                { new: true }
            );
            if (!notification) return res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
            res.status(200).json(formatNotification(notification));
        } catch (error) {
            res.status(500).json({ message: MESSAGES.NOTIFICATION.MARK_READ_FAILED });
        }
    },
    deleteNotification: async (req, res) => {
        try {
            const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
            if (!notification) return res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
            res.status(200).json({ message: MESSAGES.NOTIFICATION.DELETED });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.NOTIFICATION.DELETE_FAILED });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) return res.status(404).json({ message: MESSAGES.USER.NOT_FOUND });
            res.status(200).json({ message: MESSAGES.USER.DELETED });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.USER.DELETE_FAILED });
        }
    },
    
    // Course-related methods
    getMyCourses: async (req, res) => {
        try {
            const baseQuery = req.user.role === 'instructor' 
                ? Course.find({ instructor: req.user.id })
                : Course.find({ students: req.user.id });
            
            const paginatedQuery = paginate(baseQuery, { page: req.query.page, pageSize: req.query.pageSize });
            const courses = await paginatedQuery.populate('instructor', 'name email');
            res.status(200).json(courses);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.COURSE.FETCH_FAILED });
        }
    },
    
    enrollInCourse: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);
            if (!course) return res.status(404).json({ message: MESSAGES.COURSE.NOT_FOUND });
            
            if (course.students.includes(req.user.id)) {
                return res.status(400).json({ message: MESSAGES.COURSE.ALREADY_ENROLLED });
            }
            
            course.students.push(req.user.id);
            await course.save();
            res.status(200).json({ message: MESSAGES.COURSE.ENROLL_SUCCESS });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.COURSE.ENROLL_FAILED });
        }
    },
    
    // Assignment-related methods
    submitAssignment: async (req, res) => {
        try {
            const { content } = req.body;
            if (!content) {
                return res.status(400).json({ message: MESSAGES.ASSIGNMENT.CONTENT_REQUIRED });
            }
            
            const assignment = await Assignment.findOne({ 
                course: req.params.id,
                _id: req.body.assignmentId 
            });
            if (!assignment) return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NOT_FOUND });
            
            // Check if already submitted
            const existingSubmission = assignment.submissions.find(
                sub => sub.student.toString() === req.user.id
            );
            if (existingSubmission) {
                return res.status(400).json({ message: MESSAGES.ASSIGNMENT.ALREADY_SUBMITTED });
            }
            
            assignment.submissions.push({
                student: req.user.id,
                content,
                attachments: req.body.attachments || []
            });
            
            await assignment.save();
            res.status(201).json({ message: MESSAGES.ASSIGNMENT.SUBMIT_SUCCESS });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.ASSIGNMENT.SUBMIT_FAILED });
        }
    },
    
    getMyAssignmentSubmissions: async (req, res) => {
        try {
            const assignment = await Assignment.findById(req.params.assignmentId)
                .populate('submissions.student', 'name email');
            if (!assignment) return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NOT_FOUND });
            
            const mySubmissions = assignment.submissions.filter(
                sub => sub.student._id.toString() === req.user.id
            );
            res.status(200).json(mySubmissions);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.ASSIGNMENT.FETCH_FAILED });
        }
    },
    
    getMyAssignmentGrades: async (req, res) => {
        try {
            const assignment = await Assignment.findById(req.params.assignmentId);
            if (!assignment) return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NOT_FOUND });
            
            const mySubmission = assignment.submissions.find(
                sub => sub.student.toString() === req.user.id
            );
            
            if (!mySubmission || !mySubmission.grade) {
                return res.status(404).json({ message: MESSAGES.ASSIGNMENT.GRADE_NOT_FOUND });
            }
            
            res.status(200).json(mySubmission.grade);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.ASSIGNMENT.FETCH_FAILED });
        }
    },
    
    getMyAssignmentFeedback: async (req, res) => {
        try {
            const assignment = await Assignment.findById(req.params.assignmentId);
            if (!assignment) return res.status(404).json({ message: MESSAGES.ASSIGNMENT.NOT_FOUND });
            
            const mySubmission = assignment.submissions.find(
                sub => sub.student.toString() === req.user.id
            );
            
            if (!mySubmission || !mySubmission.grade || !mySubmission.grade.feedback) {
                return res.status(404).json({ message: MESSAGES.ASSIGNMENT.FEEDBACK_NOT_FOUND });
            }
            
            res.status(200).json({ feedback: mySubmission.grade.feedback });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.ASSIGNMENT.FETCH_FAILED });
        }
    }
};

module.exports = userController;