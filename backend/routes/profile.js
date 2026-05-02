const express = require("express");
const multer = require("multer");
const { InputFile } = require("node-appwrite/file");
const DatabaseService = require("../services/database");
const StorageService = require("../services/storage");
const AuthService = require("../services/auth");
const authenticateUser = require("../middleware/authenticate");

const router = express.Router();

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed (jpeg, png, gif, webp, avif)"));
  },
});

const buildUserResponse = (account, profileDoc) => ({
  id: account.$id || account.id,
  email: account.email,
  name: profileDoc?.name || account.name,
  bio: profileDoc?.bio || account.bio || "",
  avatarUrl: profileDoc?.avatarUrl ?? account.avatarUrl ?? null,
  avatarFileId: profileDoc?.avatarFileId ?? account.avatarFileId ?? null,
});

// Get profile + posts for authenticated user
router.get("/", authenticateUser, async (req, res) => {
  try {
    const accountResponse = await AuthService.getCurrentUser(req.sessionSecret);

    if (!accountResponse.success) {
      return res.status(500).json({ error: "Failed to load user" });
    }

    let profileDoc = null;
    try {
      profileDoc = await DatabaseService.getUser(req.userId);
    } catch (error) {
      console.warn("Profile document missing for user", req.userId, error);
    }

    const posts = await DatabaseService.listUserPosts(req.userId);

    res.json({
      user: buildUserResponse(accountResponse.user, profileDoc),
      posts,
    });
  } catch (error) {
    console.error("GET /api/profile failed:", error);
    res.status(500).json({ error: error.message || "Failed to load profile" });
  }
});

// Update profile details (name, bio, avatar)
router.put("/", authenticateUser, async (req, res) => {
  const { name, bio, avatarFileId, avatarUrl } = req.body;

  try {
    const updates = {};

    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    if (typeof bio === "string") {
      updates.bio = bio.trim();
    }

    if (avatarFileId !== undefined) {
      updates.avatarFileId = avatarFileId || null;
    }

    if (avatarUrl !== undefined) {
      updates.avatarUrl = avatarUrl || null;
    }

    if (Object.keys(updates).length === 0) {
      return res.json({ message: "Nothing to update" });
    }

    await DatabaseService.updateUserProfile(req.userId, updates);

    if (updates.name) {
      try {
        const account = AuthService.createSessionClient(req.sessionSecret);
        await account.updateName(updates.name);
      } catch (nameError) {
        console.warn("Failed to update Appwrite account name", nameError);
      }
    }

    const accountResponse = await AuthService.getCurrentUser(req.sessionSecret);
    const profileDoc = await DatabaseService.getUser(req.userId);

    res.json({
      user: buildUserResponse(accountResponse.user, profileDoc),
    });
  } catch (error) {
    console.error("PUT /api/profile failed:", error);
    res.status(500).json({ error: error.message || "Failed to update profile" });
  }
});

// Upload avatar and update profile
router.post(
  "/avatar",
  authenticateUser,
  (req, res, next) => {
    // Log incoming request
    console.log("Avatar upload - incoming request:", {
      method: req.method,
      contentType: req.headers["content-type"],
      hasBody: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : [],
    });
    next();
  },
  upload.single("file"),
  (err, req, res, next) => {
    // Multer error handler - must be placed right after upload middleware
    if (err) {
      console.error("Multer error:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || "File upload failed" });
    }
    next();
  },
  async (req, res) => {
    try {
      // Log request details for debugging
      console.log("Avatar upload request:", {
        hasFile: !!req.file,
        bodyKeys: Object.keys(req.body),
        contentType: req.headers["content-type"],
        fileField: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        } : null,
      });

      if (!req.file) {
        console.error("File not found in request:", {
          files: req.files,
          body: req.body,
          bodyKeys: Object.keys(req.body || {}),
          headers: req.headers,
          contentType: req.headers["content-type"],
        });
        return res.status(400).json({ 
          error: "File not found in payload. Please ensure you're sending the file as 'file' in FormData.",
          debug: {
            hasFiles: !!req.files,
            bodyKeys: Object.keys(req.body || {}),
            contentType: req.headers["content-type"],
          }
        });
      }

      // Grab old fileId BEFORE uploading so we can clean it up after
      const currentProfile = await DatabaseService.getUser(req.userId);
      const oldFileId = currentProfile?.avatarFileId || null;

      const inputFile = InputFile.fromBuffer(req.file.buffer, req.file.originalname);
      const uploadResult = await StorageService.uploadFile(inputFile);

      if (!uploadResult.success) {
        return res.status(400).json({ error: uploadResult.error });
      }

      const previewResult = await StorageService.getFilePreviewUrl(
        uploadResult.fileId,
        uploadResult.bucketId
      );

      const avatarUrl = previewResult.success ? previewResult.previewUrl : null;

      console.log("Generated avatar URL:", avatarUrl);

      await DatabaseService.updateUserProfile(req.userId, {
        avatarFileId: uploadResult.fileId,
        avatarUrl,
      });

      // Delete old file only after DB is updated, and only if it differs from the new one
      if (oldFileId && oldFileId !== uploadResult.fileId) {
        try {
          await StorageService.deleteFile(oldFileId);
        } catch (deleteError) {
          console.warn("Failed to delete previous avatar:", deleteError.message);
        }
      }

      const accountResponse = await AuthService.getCurrentUser(req.sessionSecret);
      const profileDoc = await DatabaseService.getUser(req.userId);

      res.json({
        user: buildUserResponse(accountResponse.user, profileDoc),
      });
    } catch (error) {
      console.error("POST /api/profile/avatar failed:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to upload avatar" });
    }
  }
);

module.exports = router;

