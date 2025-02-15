// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');  // Import the multer middleware

// Public endpoints
// Use upload.single('profileImage') to handle a single file upload from the field 'profileImage'
router.post('/register', upload.single('profileImage'), authController.registerUser);
router.post('/login', authController.loginUser);

// Public GET routes to fetch approved schools / groups
router.get('/schools', authController.getSchools);
router.get('/schoolGroups', authController.getSchoolGroups);

// Public GET route for pending approvals (or protected if you prefer)
router.get('/pending-approvals', authController.getPendingApprovals);

// Protected endpoint: Approve or Reject a user
router.post('/approve-user', protect, authController.approveUser);
router.post('/reject-user', protect, authController.rejectUser);

module.exports = router;
