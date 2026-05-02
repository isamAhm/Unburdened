const express = require("express");
const multer = require("multer");
const StorageService = require("../services/storage");
const authenticateUser = require("../middleware/authenticate");
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    const allowedTypes = /jpeg|jpg|png|gif|mp4|webm|mov/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and videos are allowed"));
    }
  },
});

// Middleware to verify authentication
// Upload a file
router.post(
  "/upload",
  authenticateUser,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      const result = await StorageService.uploadFile(req.file);

      if (result.success) {
        res.json({
          message: "File uploaded successfully",
          fileId: result.fileId,
          name: result.name,
          size: result.sizeOriginal,
          mimeType: result.mimeType,
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      console.error("POST /api/storage/upload failed:", error);
      const status = error?.response?.status || 500;
      const message =
        error?.response?.message || error?.message || "File upload failed";
      res.status(status).json({ error: message });
    }
  }
);

// Get file download URL
router.get("/download/:fileId", async (req, res) => {
  const { fileId } = req.params;

  try {
    const result = await StorageService.getFileDownloadUrl(fileId);

    if (result.success) {
      res.json({ downloadUrl: result.downloadUrl });
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error("GET /api/storage/download failed:", error);
    const status = error?.response?.status || 500;
    const message =
      error?.response?.message ||
      error?.message ||
      "Failed to get download URL";
    res.status(status).json({ error: message });
  }
});

// Get file preview URL
router.get("/preview/:fileId", async (req, res) => {
  const { fileId } = req.params;
  const { width = 200, height = 200 } = req.query;

  try {
    const result = await StorageService.getFilePreviewUrl(
      fileId,
      undefined,
      parseInt(width),
      parseInt(height)
    );

    if (result.success) {
      res.json({ previewUrl: result.previewUrl });
    } else {
      res.status(404).json({ error: result.error });
    }
  } catch (error) {
    console.error("GET /api/storage/preview failed:", error);
    const status = error?.response?.status || 500;
    const message =
      error?.response?.message || error?.message || "Failed to get preview URL";
    res.status(status).json({ error: message });
  }
});

// Delete a file
router.delete("/:fileId", authenticateUser, async (req, res) => {
  const { fileId } = req.params;

  try {
    const result = await StorageService.deleteFile(fileId);

    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error("DELETE /api/storage/:fileId failed:", error);
    const status = error?.response?.status || 500;
    const message =
      error?.response?.message || error?.message || "Failed to delete file";
    res.status(status).json({ error: message });
  }
});

// List files
router.get("/", authenticateUser, async (req, res) => {
  const { limit = 25, offset = 0 } = req.query;

  try {
    const result = await StorageService.listFiles(
      undefined,
      parseInt(limit),
      parseInt(offset)
    );

    if (result.success) {
      res.json({
        files: result.files,
        total: result.total,
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error("GET /api/storage failed:", error);
    const status = error?.response?.status || 500;
    const message =
      error?.response?.message || error?.message || "Failed to list files";
    res.status(status).json({ error: message });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large" });
    }
  }
  res.status(400).json({ error: error.message });
});

module.exports = router;
