// courseController.js

const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const User = require('../models/User');

/**
 * Utility function: Only 'admin', 'schoolGroup', or 'school' can create/edit courses.
 */
function canManageCourses(user) {
  return ['admin', 'schoolGroup', 'school'].includes(user.role);
}

/**
 * Utility function: return base XP for completing a piece of content, based on content type.
 */
function getXPForContentType(contentType) {
  switch (contentType) {
    case 'video':
      return 8;
    case 'mcq':
      return 12;
    case 'fillInBlank':
      return 15;
    case 'text':
      return 5;
    default:
      return 2; // fallback
  }
}

/**
 * POST /api/courses
 * Create a new course.
 */
exports.createCourse = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!canManageCourses(currentUser)) {
      return res.status(403).json({ message: 'You do not have permission to create courses.' });
    }

    const {
      name,
      description,
      imageBase64,

      // Old approach
      visibility,
      schoolGroup,
      school,
      permittedSchools,

      // New approach
      isPublic,
      allowedSchoolGroups,
      allowedSchools,

      modules,
    } = req.body;

    // Build course document
    const newCourse = new Course({
      // Shared
      name,
      description,
      imageBase64: imageBase64 || null,
      createdBy: currentUser.userId,
      modules: modules || [],

      // Old approach (for backward compat)
      visibility: visibility || 'public',
      schoolGroup: null,
      school: null,
      permittedSchools: permittedSchools || [],

      // New approach
      isPublic: !!isPublic, // convert truthy to boolean
      allowedSchoolGroups: allowedSchoolGroups || [],
      allowedSchools: allowedSchools || [],
    });

    // If old visibility is 'schoolGroup', set schoolGroup
    if (visibility === 'schoolGroup') {
      newCourse.schoolGroup = schoolGroup || null;
    } else if (visibility === 'school') {
      newCourse.school = school || null;
    }

    const savedCourse = await newCourse.save();

    return res.status(201).json({
      message: 'Course created successfully.',
      course: savedCourse,
    });
  } catch (err) {
    console.error('Create Course Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * GET /api/courses
 * Fetch all courses (you can add filters as needed).
 */
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('createdBy', 'name role')
      .lean();

    return res.status(200).json(courses);
  } catch (err) {
    console.error('Get All Courses Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * GET /api/courses/:courseId
 * Fetch a single course by ID.
 */
exports.getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId)
      .populate('createdBy', 'name role')
      .lean();

    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    return res.status(200).json(course);
  } catch (err) {
    console.error('Get Course Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * PUT /api/courses/:courseId
 * Update a course (name, description, modules, etc.).
 */
exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const currentUser = req.user;

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Only creator or admin
    const isOwner = course.createdBy.toString() === currentUser.userId;
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this course.' });
    }

    // Pull from request body
    const {
      name,
      description,
      imageBase64,

      // Old approach
      visibility,
      schoolGroup,
      school,
      permittedSchools,

      // New approach
      isPublic,
      allowedSchoolGroups,
      allowedSchools,

      modules,
    } = req.body;

    // Update fields if provided
    if (name !== undefined) course.name = name;
    if (description !== undefined) course.description = description;
    if (imageBase64 !== undefined) course.imageBase64 = imageBase64;

    // If old approach visibility is updated
    if (visibility !== undefined) {
      course.visibility = visibility;
      if (visibility === 'schoolGroup') {
        course.schoolGroup = schoolGroup || null;
        course.school = null;
      } else if (visibility === 'school') {
        course.school = school || null;
        course.schoolGroup = null;
      } else {
        // 'public'
        course.schoolGroup = null;
        course.school = null;
      }
    }

    if (modules !== undefined) {
      course.modules = modules;
    }

    if (permittedSchools !== undefined) {
      course.permittedSchools = permittedSchools;
    }

    // New approach
    if (isPublic !== undefined) {
      course.isPublic = !!isPublic;
    }
    if (allowedSchoolGroups !== undefined) {
      course.allowedSchoolGroups = allowedSchoolGroups;
    }
    if (allowedSchools !== undefined) {
      course.allowedSchools = allowedSchools;
    }

    const updatedCourse = await course.save();

    return res.status(200).json({
      message: 'Course updated successfully.',
      course: updatedCourse,
    });
  } catch (err) {
    console.error('Update Course Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * DELETE /api/courses/:courseId
 * Delete a course (only creator or admin).
 */
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const currentUser = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Only owner or admin
    const isOwner = course.createdBy.toString() === currentUser.userId;
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this course.' });
    }

    await course.deleteOne();
    return res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (err) {
    console.error('Delete Course Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * PUT /api/courses/:courseId/reorder-modules
 * Reorder the modules array.
 * Expects { newModuleOrder: [moduleId1, moduleId2, ...] }
 */
exports.reorderModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { newModuleOrder } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Map moduleId -> module
    const modulesMap = new Map();
    course.modules.forEach((m) => modulesMap.set(m._id.toString(), m));

    // Rebuild in new order
    const reordered = [];
    newModuleOrder.forEach((id) => {
      const moduleData = modulesMap.get(id);
      if (moduleData) reordered.push(moduleData);
    });

    course.modules = reordered;
    await course.save();

    return res.status(200).json({
      message: 'Modules reordered successfully.',
      modules: course.modules,
    });
  } catch (err) {
    console.error('Reorder Modules Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * PUT /api/courses/:courseId/:moduleId/reorder-units
 * Reorder the units in a given module.
 * Expects { newUnitOrder: [unitId1, unitId2, ...] }
 */
exports.reorderUnits = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    const { newUnitOrder } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const targetModule = course.modules.id(moduleId);
    if (!targetModule) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    // Map unitId -> unit
    const unitsMap = new Map();
    targetModule.units.forEach((u) => unitsMap.set(u._id.toString(), u));

    const reordered = [];
    newUnitOrder.forEach((id) => {
      const unitData = unitsMap.get(id);
      if (unitData) reordered.push(unitData);
    });

    targetModule.units = reordered;
    await course.save();

    return res.status(200).json({
      message: 'Units reordered successfully.',
      modules: course.modules,
    });
  } catch (err) {
    console.error('Reorder Units Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * PUT /api/courses/:courseId/:moduleId/:unitId/reorder-content
 * Reorder the content items in a given unit.
 * Expects { newContentOrder: [contentId1, contentId2, ...] }
 */
exports.reorderContent = async (req, res) => {
  try {
    const { courseId, moduleId, unitId } = req.params;
    const { newContentOrder } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    const targetModule = course.modules.id(moduleId);
    if (!targetModule) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    const targetUnit = targetModule.units.id(unitId);
    if (!targetUnit) {
      return res.status(404).json({ message: 'Unit not found.' });
    }

    // Map contentId -> content item
    const contentMap = new Map();
    targetUnit.contents.forEach((c) => contentMap.set(c._id.toString(), c));

    const reordered = [];
    newContentOrder.forEach((id) => {
      const contentItem = contentMap.get(id);
      if (contentItem) reordered.push(contentItem);
    });

    targetUnit.contents = reordered;
    await course.save();

    return res.status(200).json({
      message: 'Content reordered successfully.',
      modules: course.modules,
    });
  } catch (err) {
    console.error('Reorder Content Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /api/courses/:courseId/complete-content
 * For a student to mark content as completed, awarding XP & updating streak.
 * Expects { contentId } in the body.
 */
exports.completeContent = async (req, res) => {
  try {
    const currentUser = req.user;
    const { courseId } = req.params;
    const { contentId } = req.body;

    // Only students "complete" content
    if (currentUser.role !== 'student') {
      return res.status(403).json({ message: 'Only students can complete content.' });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Locate the content type
    let foundContentType = null;
    outerLoop: for (const mod of course.modules) {
      for (const unit of mod.units) {
        for (const c of unit.contents) {
          if (c._id.toString() === contentId) {
            foundContentType = c.contentType;
            break outerLoop;
          }
        }
      }
    }

    if (!foundContentType) {
      return res.status(404).json({ message: 'Content not found in this course.' });
    }

    // Check or create progress
    let progress = await CourseProgress.findOne({
      user: currentUser.userId,
      course: courseId,
    });
    if (!progress) {
      progress = await CourseProgress.create({
        user: currentUser.userId,
        course: courseId,
        completedContentIds: [],
      });
    }

    // If already completed
    if (progress.completedContentIds.includes(contentId)) {
      return res.status(200).json({ message: 'Content already completed.' });
    }

    // Mark completed
    progress.completedContentIds.push(contentId);
    await progress.save();

    // Award XP
    const userDoc = await User.findById(currentUser.userId);
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let xpToAward = getXPForContentType(foundContentType);

    // Streak logic
    const now = new Date();
    const lastActive = userDoc.lastActiveDate ? new Date(userDoc.lastActiveDate) : null;

    if (!lastActive) {
      userDoc.streak = 1;
      xpToAward += 5;
    } else {
      const diffInMs = now.getTime() - lastActive.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) {
        xpToAward += 2;
      } else if (diffInDays === 1) {
        userDoc.streak += 1;
        xpToAward += 5;
      } else {
        userDoc.streak = 1;
        xpToAward += 2;
      }
    }

    userDoc.lastActiveDate = now;
    userDoc.xp += xpToAward;

    await userDoc.save();

    return res.status(200).json({
      message: 'Content completed and XP/streak updated.',
      xpAwarded: xpToAward,
      totalXP: userDoc.xp,
      streak: userDoc.streak,
    });
  } catch (err) {
    console.error('Complete Content Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * GET /api/courses/:courseId/progress
 * Fetch course progress for the current user.
 */
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const currentUser = req.user; // Ensure `protect` middleware is used

    // Find progress for this user & course
    const progress = await CourseProgress.findOne({
      user: currentUser._id,
      course: courseId,
    });

    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this course.' });
    }

    return res.status(200).json(progress);
  } catch (err) {
    console.error('Get Course Progress Error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

