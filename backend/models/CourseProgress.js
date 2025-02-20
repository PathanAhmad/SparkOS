const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Stores which content IDs a given user has completed in a course.
 */
const CourseProgressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    // Each content item has its own _id. We'll store them as strings or ObjectIds.
    completedContentIds: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('CourseProgress', CourseProgressSchema);
