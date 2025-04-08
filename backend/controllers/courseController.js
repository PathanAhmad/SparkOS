const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const User = require('../models/User');
const mongoose = require("mongoose");

/**
 * Utility function: Only 'admin', 'schoolGroup', or 'school' can create/edit courses.
 */
function canManageCourses(user) {
  return ['admin', 'schoolGroup', 'school'].includes(user.role);
}

/**
 * POST /api/courses
 * Create a new course.
 */
exports.createCourse = async (req, res) => {
  try {
    const currentUser = req.user;
    if (!canManageCourses(currentUser)) {
      return res
        .status(403)
        .json({ message: 'You do not have permission to create courses.' });
    }

    const {
      name,
      description,
      imageBase64,
      // Use only new approach fields:
      isPublic,
      allowedSchoolGroups,
      allowedSchools,
      modules,
    } = req.body;

    if (Array.isArray(modules)) {
      for (const module of modules) {
        for (const unit of module.units || []) {
          for (const content of unit.contents || []) {
            if (content.contentType === 'pdf' && !content.pdfFileId) {
              console.warn('⚠️ PDF content is missing pdfFileId:', content);
            }
            if (content.contentType === 'text' && !content.textContent) {
              console.warn('⚠️ Text content is missing textContent:', content);
            }
          }
        }
      }
    }

    // Build course document using only new approach fields.
    const newCourse = new Course({
      name,
      description,
      imageBase64: imageBase64 || null,
      createdBy: currentUser.userId,
      modules: modules || [],
      isPublic: !!isPublic,
      allowedSchoolGroups: allowedSchoolGroups || [],
      allowedSchools: allowedSchools || [],
    });

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
 * Fetch all courses.
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

    // Only creator or admin can update
    const isOwner = course.createdBy.toString() === currentUser.userId;
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this course.' });
    }

    const {
      name,
      description,
      imageBase64,
      // Use only new approach fields:
      isPublic,
      allowedSchoolGroups,
      allowedSchools,
      modules,
    } = req.body;

    if (name !== undefined) course.name = name;
    if (description !== undefined) course.description = description;
    if (imageBase64 !== undefined) course.imageBase64 = imageBase64;
    if (modules !== undefined) course.modules = modules;
    if (isPublic !== undefined) {
      course.isPublic = !!isPublic;
    }
    if (allowedSchoolGroups !== undefined) {
      course.allowedSchoolGroups = allowedSchoolGroups;
    }
    if (allowedSchools !== undefined) {
      course.allowedSchools = allowedSchools;
    }

    // Optional: validate pdf/text content when updating
    if (Array.isArray(course.modules)) {
      for (const module of course.modules) {
        for (const unit of module.units || []) {
          for (const content of unit.contents || []) {
            if (content.contentType === 'pdf' && !content.pdfFileId) {
              console.warn('⚠️ [UPDATE] PDF content is missing pdfFileId:', content);
            }
            if (content.contentType === 'text' && !content.textContent) {
              console.warn('⚠️ [UPDATE] Text content is missing textContent:', content);
            }
          }
        }
      }
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

    const isOwner = course.createdBy.toString() === currentUser.userId;
    const isAdmin = currentUser.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: 'Not authorized to delete this course.' });
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

    const modulesMap = new Map();
    course.modules.forEach((m) => modulesMap.set(m._id.toString(), m));

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
 * GET /api/courses/:courseId/progress
 * Fetch course progress for the current user.
 */
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const currentUser = req.user;

    console.log(`🔎 Fetching progress for user: ${currentUser._id} | course: ${courseId}`);

    // ✅ Ensure query uses **correct ObjectId** formatting
    const progress = await CourseProgress.findOne({
      user: currentUser._id.toString(),  // ✅ Ensure it's a string for direct matching
      course: courseId.toString(),  // ✅ Ensure it's a string for direct matching
    });

    if (!progress) {
      console.log("⚠️ No progress found. Returning empty.");
      return res.status(200).json({ completedContentIds: [] });
    }

    console.log("✅ Progress Found:", progress);
    return res.status(200).json(progress);
  } catch (err) {
    console.error("❌ Get Course Progress Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/courses/:courseId/complete-unit
 * Marks an entire unit as completed, awarding XP based on total mistakes.
 * Expects { unitId, mistakes } in the body.
 */
exports.completeUnit = async (req, res) => {
  try {
    const currentUser = req.user;
    const { courseId } = req.params;
    const { unitId, mistakes } = req.body;

    if (currentUser.role !== "student") {
      return res.status(403).json({ message: "Only students can complete units." });
    }

    // ✅ Use `unitId.toString()` to prevent ObjectId mismatch
    const unitIdStr = unitId.toString();

    // ✅ Get existing progress
    let progress = await CourseProgress.findOne({ user: currentUser._id, course: courseId });

    if (progress && progress.completedContentIds.includes(unitIdStr)) {
      console.log(`🟡 User ${currentUser._id} already completed unit ${unitIdStr}. Granting 5 XP.`);
      const userDoc = await User.findById(currentUser._id);
      userDoc.xp += 5; 
      userDoc.lastActiveDate = new Date();
      await userDoc.save();

      return res.status(200).json({
        message: "Unit already completed. Bonus XP granted.",
        xpAwarded: 5,
        totalXP: userDoc.xp,
        streak: userDoc.streak,
        alreadyCompleted: true,
      });
    }

    // ✅ Store unitId as **string** in `completedContentIds`
    progress = await CourseProgress.findOneAndUpdate(
      { user: currentUser._id, course: courseId },
      { $addToSet: { completedContentIds: unitIdStr } }, // ✅ Store as string
      { upsert: true, new: true }
    );

    // ✅ Award XP
    const xpToAward = mistakes === 0 ? 10 : 7;
    const userDoc = await User.findById(currentUser._id);
    userDoc.xp += xpToAward;
    userDoc.lastActiveDate = new Date();
    await userDoc.save();

    return res.status(200).json({
      message: "Unit completed and XP updated.",
      xpAwarded: xpToAward,
      totalXP: userDoc.xp,
      streak: userDoc.streak,
      alreadyCompleted: false,
    });
  } catch (err) {
    console.error("Complete Unit Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// function getModulesWithUnitStatus(modules = [], progress) {
//   const completedUnits = new Set(progress?.completedContentIds || []); // ✅ Store completed unit IDs

//   let lastCompletedUnit = null; // ✅ Track the last completed unit globally

//   return modules.map((module, moduleIndex) => {
//     let previousUnitCompleted = false;

//     const unitsWithStatus = module.units.map((unit, unitIndex) => {
//       const unitId = unit._id.toString();
//       const isUnitCompleted = completedUnits.has(unitId); // ✅ Only check unit-level completion

//       // ✅ Always unlock the first unit of the course
//       let unitStatus = "locked";
//       if (moduleIndex === 0 && unitIndex === 0) {
//         unitStatus = "unlocked";
//       } 
//       // ✅ If the previous unit is completed, unlock the next one
//       else if (previousUnitCompleted) {
//         unitStatus = "unlocked";
//       }

//       // ✅ If this unit is completed, store it as the last completed unit
//       if (isUnitCompleted) {
//         lastCompletedUnit = { moduleIndex, unitIndex };
//         unitStatus = "completed";
//       }

//       previousUnitCompleted = isUnitCompleted; // ✅ Track last completed unit in this module
//       return { ...unit, unitStatus };
//     });

//     // ✅ If this module contains the last completed unit, unlock the next unit
//     if (lastCompletedUnit && lastCompletedUnit.moduleIndex === moduleIndex) {
//       const nextUnit = unitsWithStatus[lastCompletedUnit.unitIndex + 1];
//       if (nextUnit && nextUnit.unitStatus === "locked") {
//         nextUnit.unitStatus = "unlocked";
//       }
//     }

//     return { ...module, unitsWithStatus };
//   });
// }


