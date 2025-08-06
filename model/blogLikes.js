const mongoose = require("mongoose");

const blogLikedSchema = mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Aspirant',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'dislike'],
        required: true
    },
    liked: Boolean, // Keep for backward compatibility
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for performance
blogLikedSchema.index({ blogId: 1, userId: 1, type: 1 });

module.exports = mongoose.model("blogLikes", blogLikedSchema);