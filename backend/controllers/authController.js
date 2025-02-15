// backend/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * POST /api/auth/register
 * Creates a new user (admin, schoolGroup, school, teacher, or student).
 * Admin is automatically approved. All others start as 'pending' and require higher-level approval.
 */
exports.registerUser = async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      role,
      name,
      school,
      schoolGroup,
      dateOfBirth,
    } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // (Perform duplicate checks and validations as before…)

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Admin is auto-approved; others start as 'pending'
    let initialStatus = role === 'admin' ? 'approved' : 'pending';

    // For students and teachers, store profileImage if uploaded
    let profileImage = null;
    if ((role === 'student' || role === 'teacher') && req.file) {
      profileImage = req.file.filename;
    }

    const newUser = await User.create({
      email,
      username: username || null,
      password: hashedPassword,
      role,
      name,
      registrationStatus: initialStatus,
      school: school || null,
      schoolGroup: schoolGroup || null,
      dateOfBirth: dateOfBirth || null,
      profileImage, // New field
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name,
        registrationStatus: newUser.registrationStatus,
        profileImage: newUser.profileImage,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Admin is auto-approved; others start as 'pending'
    let initialStatus = 'pending';
    if (role === 'admin') {
      initialStatus = 'approved';
    }

    const newUser = await User.create({
      email,
      username: username || null,
      password: hashedPassword,
      role,
      name,
      registrationStatus: initialStatus,
      school: school || null,
      schoolGroup: schoolGroup || null,
      dateOfBirth: dateOfBirth || null,
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      user: {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name,
        registrationStatus: newUser.registrationStatus,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /api/auth/login
 * Users can log in using either email OR username in a 'login' field.
 */
exports.loginUser = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ message: 'Missing login or password.' });
    }

    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        registrationStatus: user.registrationStatus,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * POST /api/auth/approve-user
 * For Admin, SchoolGroup, or School to approve relevant roles.
 * Teachers can approve students. 
 * "Edge Cases" included for already-approved or rejected users.
 */
exports.approveUser = async (req, res) => {
  try {
    const approver = req.user; // { userId, role }
    const { userIdToApprove } = req.body;

    if (!userIdToApprove) {
      return res.status(400).json({ message: 'No user specified to approve.' });
    }

    const userToApprove = await User.findById(userIdToApprove);
    if (!userToApprove) {
      return res.status(404).json({ message: 'Target user not found.' });
    }

    if (userToApprove.registrationStatus === 'approved') {
      return res.status(400).json({ message: 'User is already approved.' });
    }
    if (userToApprove.registrationStatus === 'rejected') {
      return res.status(400).json({ message: 'User is rejected and cannot be approved.' });
    }

    const canApproveNow = await canApprove(approver, userToApprove);
    if (!canApproveNow) {
      return res.status(403).json({ message: 'Permission denied.' });
    }

    userToApprove.registrationStatus = 'approved';
    await userToApprove.save();

    return res.status(200).json({
      message: 'User approved successfully.',
      user: {
        _id: userToApprove._id,
        role: userToApprove.role,
        registrationStatus: userToApprove.registrationStatus,
      },
    });
  } catch (error) {
    console.error('Approve error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * canApprove(approver, target)
 * - Admin can approve everyone.
 * - SchoolGroup can approve School, Teacher, Student if they belong to that group.
 * - School can approve Teacher or Student if they belong to that School.
 * - Teacher can approve Student if they share the same School.
 */
async function canApprove(approver, target) {
  // Admin
  if (approver.role === 'admin') {
    return true;
  }

  // SchoolGroup can approve:
  //  - School if school.schoolGroup == schoolGroup's _id
  //  - Teacher or Student if their "school" references this group
  if (approver.role === 'schoolGroup') {
    if (target.role === 'school') {
      return (
        target.schoolGroup &&
        target.schoolGroup.toString() === approver.userId.toString()
      );
    }
    if (target.role === 'teacher' || target.role === 'student') {
      if (!target.school) return false;
      const schoolDoc = await User.findById(target.school).lean();
      if (!schoolDoc) return false;
      if (schoolDoc.role !== 'school') return false;
      if (!schoolDoc.schoolGroup) return false;
      return schoolDoc.schoolGroup.toString() === approver.userId.toString();
    }
  }

  // School can approve Teacher or Student if teacher/student.school == this School's _id
  // This user IS the school, so its _id is approver.userId
  if (approver.role === 'school') {
    if (target.role === 'teacher' || target.role === 'student') {
      return (
        target.school &&
        target.school.toString() === approver.userId.toString()
      );
    }
  }

  // Teacher can approve Student if they share the same School
  if (approver.role === 'teacher') {
    if (target.role === 'student') {
      const teacherDoc = await User.findById(approver.userId).lean();
      if (!teacherDoc || !teacherDoc.school || !target.school) return false;
      return teacherDoc.school.toString() === target.school.toString();
    }
  }

  return false;
}

exports.getSchools = async (req, res) => {
  try {
    // Fetch only approved schools
    const schools = await User.find(
      { role: 'school', registrationStatus: 'approved' },
      '_id name' // Only return these fields
    ).lean();

    return res.status(200).json(schools);
  } catch (error) {
    console.error('GetSchools error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * GET /api/auth/schoolGroups
 * Returns a list of approved school groups (_id, name).
 */
exports.getSchoolGroups = async (req, res) => {
  try {
    // Fetch only approved school groups
    const groups = await User.find(
      { role: 'schoolGroup', registrationStatus: 'approved' },
      '_id name'
    ).lean();

    return res.status(200).json(groups);
  } catch (error) {
    console.error('GetSchoolGroups error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    // If completely public, do NOT rely on req.user.
    // Just find all pending users in the database:
    const pendingUsers = await User.find(
      { registrationStatus: 'pending' },
      '_id name role registrationStatus'
    ).lean();

    res.status(200).json(pendingUsers);
  } catch (error) {
    console.error('GetPendingApprovals error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const approver = req.user; // { userId, role }
    const { userIdToReject } = req.body;

    if (!userIdToReject) {
      return res.status(400).json({ message: 'No user specified to reject.' });
    }

    const userToReject = await User.findById(userIdToReject);
    if (!userToReject) {
      return res.status(404).json({ message: 'Target user not found.' });
    }

    // Only admin can reject (or delete) for simplicity
    if (approver.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied. Only admins can reject.' });
    }

    // Actually delete the user document
    await userToReject.deleteOne();

    return res.status(200).json({
      message: 'User has been deleted (rejected).',
      deletedUserId: userIdToReject,
    });
  } catch (error) {
    console.error('Reject (delete) error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


