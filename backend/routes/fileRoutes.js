// backend/routes/fileRoutes.js

const express = require("express");
const router = express.Router();
const { uploadPDF, getPDF } = require("../controllers/fileController");

// ✅ No need for upload.single middleware anymore
router.post("/upload-pdf", uploadPDF);
router.get("/pdf/:fileId", getPDF);

module.exports = router;
