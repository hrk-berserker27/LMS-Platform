const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    assignments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
    }],
    videos: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        url: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: function(url) {
                    return /^https?:\/\/.+/.test(url);
                },
                message: 'Please provide a valid URL starting with http:// or https://'
            }
        },
        duration: {
            type: Number,
            min: 0
        }
    }]
}, {
    timestamps: true
});

let Course;
try {
    Course = mongoose.model('Course', courseSchema);
} catch (error) {
    Course = mongoose.model('Course');
}

module.exports = Course;