const multer = require('multer');
const path = require('path');

// Configure storage: files will be saved in the "uploads" folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Make sure this folder exists (or create it)
  },
  filename: (req, file, cb) => {
    // Use the original name plus a timestamp for uniqueness
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${Date.now()}${ext}`);
  },
});

// Only accept image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

// Limit file size to 2MB (optional)
const limits = {
  fileSize: 1024 * 1024 * 2,
};

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
