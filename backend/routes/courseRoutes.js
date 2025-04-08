const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// Create a course
router.post('/', protect, courseController.createCourse);

// Get all courses
router.get('/', protect, courseController.getAllCourses);

// Get single course
router.get('/:courseId', protect, courseController.getCourseById);

// Update course
router.put('/:courseId', protect, courseController.updateCourse);

// Delete course
router.delete('/:courseId', protect, courseController.deleteCourse);

// Reorder modules
router.put('/:courseId/reorder-modules', protect, courseController.reorderModules);

// Reorder units
router.put('/:courseId/:moduleId/reorder-units', protect, courseController.reorderUnits);

// Reorder contents
router.put('/:courseId/:moduleId/:unitId/reorder-content', protect, courseController.reorderContent);

// Fetch course progress for a user
router.get('/:courseId/progress', protect, courseController.getCourseProgress);

// Complete a unit (award XP at the end of a unit)
router.post('/:courseId/complete-unit', protect, courseController.completeUnit);

module.exports = router;
