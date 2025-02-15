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
      profileImage, // Now expecting Base64 string
    } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Validate role
    const validRoles = ['admin', 'schoolGroup', 'school', 'teacher', 'student'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Admins are auto-approved; others start as 'pending'
    const initialStatus = role === 'admin' ? 'approved' : 'pending';

    // Create user with Base64 profile image (if provided)
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
      profileImage: profileImage || null, // Store Base64 directly
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
        profileImage: newUser.profileImage, // Send Base64 image
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

    // Check if user is approved
    if (user.registrationStatus !== 'approved') {
      return res.status(403).json({ message: 'Account pending approval.' });
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
    const approver = req.user;
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

async function canApprove(approver, target) {
  if (approver.role === 'admin') return true;

  if (approver.role === 'schoolGroup') {
    if (target.role === 'school') {
      return target.schoolGroup?.toString() === approver.userId.toString();
    }
    if (['teacher', 'student'].includes(target.role)) {
      const school = await User.findById(target.school);
      return school?.schoolGroup?.toString() === approver.userId.toString();
    }
  }

  if (approver.role === 'school') {
    if (['teacher', 'student'].includes(target.role)) {
      return target.school?.toString() === approver.userId.toString();
    }
  }

  if (approver.role === 'teacher' && target.role === 'student') {
    const teacher = await User.findById(approver.userId);
    return teacher?.school?.toString() === target.school?.toString();
  }

  return false;
}

exports.getSchools = async (req, res) => {
  try {
    const schools = await User.find(
      { role: 'school', registrationStatus: 'approved' },
      '_id name'
    ).lean();
    res.status(200).json(schools);
  } catch (error) {
    console.error('GetSchools error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getSchoolGroups = async (req, res) => {
  try {
    const groups = await User.find(
      { role: 'schoolGroup', registrationStatus: 'approved' },
      '_id name'
    ).lean();
    res.status(200).json(groups);
  } catch (error) {
    console.error('GetSchoolGroups error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
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
    const { userIdToReject } = req.body;
    const approver = req.user;

    if (!userIdToReject) {
      return res.status(400).json({ message: 'No user specified to reject.' });
    }

    const userToReject = await User.findById(userIdToReject);
    if (!userToReject) {
      return res.status(404).json({ message: 'Target user not found.' });
    }

    if (approver.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied. Only admins can reject.' });
    }

    await userToReject.deleteOne();
    res.status(200).json({
      message: 'User has been deleted (rejected).',
      deletedUserId: userIdToReject,
    });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUsersGrouped = async (req, res) => {
  try {
    const schoolGroups = await User.find({ role: 'schoolGroup', registrationStatus: 'approved' }, '_id name').lean();
    
    const groupedData = await Promise.all(schoolGroups.map(async (group) => {
      const schools = await User.find({ role: 'school', schoolGroup: group._id, registrationStatus: 'approved' }, '_id name').lean();

      const schoolsWithUsers = await Promise.all(schools.map(async (school) => {
        const teachers = await User.find({ role: 'teacher', school: school._id, registrationStatus: 'approved' }, '_id name email').lean();
        const students = await User.find({ role: 'student', school: school._id, registrationStatus: 'approved' }, '_id name email').lean();

        return { ...school, teachers, students };
      }));

      return { ...group, schools: schoolsWithUsers };
    }));

    res.status(200).json(groupedData);
  } catch (error) {
    console.error('Fetch Users Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user details
exports.updateUser = async (req, res) => {
  try {
    const { userId, ...updateFields } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    console.log("🔎 Finding user with ID:", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User found. Updating:", updateFields);

    // Perform update
    Object.assign(user, updateFields);
    await user.save();

    console.log("✅ Updated user successfully:", user);

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("❌ Update User Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Fetch user details by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Get User By ID Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
