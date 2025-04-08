// backend/controllers/fileController.js

const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const { Readable } = require("stream");

/**
 * POST /api/files/upload-pdf
 * Uploads a PDF file to MongoDB GridFS.
 * - Expects raw binary PDF in the request body
 * - Expects `filename` in the request headers
 */
exports.uploadPDF = async (req, res) => {
  try {
    const { filename } = req.headers;
    const fileBuffer = req.body;

    if (!filename || !fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      return res.status(400).json({ message: "Missing filename or file data." });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: "pdfs" });

    const readableStream = Readable.from(fileBuffer);
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: "application/pdf",
    });

    readableStream.pipe(uploadStream)
      .on("error", (error) => {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Upload failed." });
      })
      .on("finish", () => {
        res.status(201).json({
          message: "PDF uploaded successfully.",
          fileId: uploadStream.id,
          filename: uploadStream.filename,
        });
      });

  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/files/pdf/:fileId
 * Streams a PDF file by its MongoDB GridFS ID.
 */
exports.getPDF = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: "Invalid file ID." });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: "pdfs" });
    const _id = new mongoose.Types.ObjectId(fileId);

    const files = await bucket.find({ _id }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: "File not found." });
    }

    res.set("Content-Type", files[0].contentType || "application/pdf");
    bucket.openDownloadStream(_id).pipe(res);

  } catch (err) {
    console.error("Serve Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
