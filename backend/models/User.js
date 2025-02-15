// backend/models/User.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    //-------------------------
    // Shared / Core Fields
    //-------------------------
    username: {
      type: String,
      unique: true,
      sparse: true, // So you can allow some docs without username
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'schoolGroup', 'school', 'teacher', 'student'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    registrationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    // Hierarchy references
    schoolGroup: {
      type: Schema.Types.ObjectId,
      ref: 'SchoolGroup',
      default: null,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      default: null,
    },

    // Optional notifications
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Notification',
      },
    ],

    //-------------------------
    // Student/Teacher-Specific Fields
    //-------------------------
    dateOfBirth: { type: Date },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    profileImage: { type: String, default: null },
  },
  {
    timestamps: true, // automatically manages createdAt, updatedAt
  }
);

module.exports = mongoose.model('User', UserSchema);
