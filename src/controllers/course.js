const { MESSAGES } = require('../constants/constants');
const Course = require('../models/Course');

// create controllers for courses
const courseController = {
    createCourse: async (req, res) => {
        try {
            const { title, description } = req.body;
            const course = new Course({
                title,
                description,
                instructor: req.user.id
            });
            await course.save();
            res.status(201).json({ message: MESSAGES.COURSE.CREATE_SUCCESS, course });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.COURSE.CREATE_FAILED });
        }
    },
    deleteCourse: async (req, res) => {
        try {
            const course = await Course.findOneAndDelete({ 
                _id: req.params.id, 
                instructor: req.user.id 
            });
            if (!course) {
                return res.status(404).json({ message: MESSAGES.COURSE.NOT_FOUND });
            }
            res.status(200).json({ message: MESSAGES.COURSE.DELETE_SUCCESS });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.COURSE.DELETE_FAILED });
        }
    },
    updateCourse: async (req, res) => {
        try {
            const { title, description } = req.body;
            const course = await Course.findOneAndUpdate(
                { _id: req.params.id, instructor: req.user.id },
                { title, description },
                { new: true }
            );
            if (!course) {
                return res.status(404).json({ message: MESSAGES.COURSE.NOT_FOUND });
            }
            res.status(200).json({ message: MESSAGES.COURSE.UPDATE_SUCCESS, course });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.COURSE.UPDATE_FAILED });
        }
    },
    getCourse: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id)
                .populate('instructor', 'name email')
                .populate('students', 'name email');
            if (!course) {
                return res.status(404).json({ message: MESSAGES.COURSE.NOT_FOUND });
            }
            res.status(200).json(course);
        } catch (error) {
            res.status(500).json({ message: MESSAGES.COURSE.FETCH_FAILED });
        }
    },
    enrollInCourse: async (req, res) => {
        try {
            const course = await Course.findById(req.params.id);
            if (!course) {
                return res.status(404).json({ message: MESSAGES.COURSE.NOT_FOUND });
            }
            if (course.students.includes(req.user.id)) {
                return res.status(409).json({ message: MESSAGES.COURSE.ALREADY_ENROLLED });
            }
            course.students.push(req.user.id);
            await course.save();
            res.status(200).json({ message: MESSAGES.COURSE.ENROLL_SUCCESS });
        } catch (error) {
            res.status(500).json({ message: MESSAGES.COURSE.ENROLL_FAILED });
        }
    }
};

module.exports = courseController;
