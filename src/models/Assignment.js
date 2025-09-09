const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Assignment title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Assignment description is required'],
        trim: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course is required']
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Instructor is required']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    maxPoints: {
        type: Number,
        required: [true, 'Maximum points is required'],
        min: [1, 'Maximum points must be at least 1']
    },
    status: {
        type: String,
        enum: {
            values: ['draft', 'published', 'closed'],
            message: 'Status must be one of: draft, published, closed'
        },
        default: 'draft'
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        content: {
            type: String,
            required: true
        },
        attachments: [{
            filename: String,
            path: String,
            size: Number
        }],
        grade: {
            points: {
                type: Number,
                min: 0
            },
            feedback: String,
            gradedAt: Date,
            gradedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    }]
}, {
    timestamps: true
});

// Index for efficient queries
try {
    assignmentSchema.index({ course: 1, dueDate: 1 });
    assignmentSchema.index({ instructor: 1 });
} catch (error) {
    // Index creation errors are handled silently to prevent schema compilation failure
}

let Assignment;
try {
    Assignment = mongoose.model('Assignment', assignmentSchema);
} catch (error) {
    Assignment = mongoose.model('Assignment');
}

module.exports = Assignment;