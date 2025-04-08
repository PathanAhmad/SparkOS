const mongoose = require('mongoose');
const { Schema } = mongoose;

const ContentSchema = new Schema({
  contentType: {
    type: String,
    enum: ['video', 'mcq', 'fillInBlank', 'text', 'pdf'],
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

    // Only permittedSchools is kept for access control.
    permittedSchools: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // Because your 'School' is also a 'User' with role=school
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
