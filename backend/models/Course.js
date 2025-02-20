// Course.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ContentSchema = new Schema({
  contentType: {
    type: String,
    enum: ['video', 'mcq', 'fillInBlank', 'text'],
    required: true,
  },
  videoUrl: { type: String, default: null },
  pdfFileId: { type: String, default: null },
  question: { type: String, default: null },
  options: [String], // MCQ options
  correctAnswer: { type: String, default: null },
  textContent: { type: String, default: null },
});

const UnitSchema = new Schema({
  unitName: { type: String, required: true },
  contents: [ContentSchema],
});

const ModuleSchema = new Schema({
  moduleName: { type: String, required: true },
  units: [UnitSchema],
});

const CourseSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    imageBase64: { type: String, default: null }, // If storing images as Base64

    // ------------------------
    // Old (Backward-Compat)
    // ------------------------
    visibility: {
      type: String,
      enum: ['public', 'schoolGroup', 'school'],
      default: 'public',
    },
    schoolGroup: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    school: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    permittedSchools: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // Because your 'School' is also a 'User' with role=school
      },
    ],

    // ------------------------
    // New Approach (Streamlined)
    // ------------------------
    isPublic: { 
      type: Boolean, 
      default: false,
    },
    allowedSchoolGroups: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // 'schoolGroup' user docs
      },
    ],
    allowedSchools: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // 'school' user docs
      },
    ],

    // Course creator (admin, schoolGroup, or school)
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    modules: [ModuleSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', CourseSchema);
