const { storage, MEDIA_BUCKET_ID } = require("../config/appwrite");

class StorageService {
  // Upload a file to Appwrite Storage
  static async uploadFile(file, bucketId = MEDIA_BUCKET_ID) {
    try {
      const response = await storage.createFile(
        bucketId,
        "unique()", // Auto-generate file ID
        file
      );
      return {
        success: true,
        fileId: response.$id,
        bucketId: response.bucketId,
        name: response.name,
        sizeOriginal: response.sizeOriginal,
        mimeType: response.mimeType,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        error: error.message || "Failed to upload file",
      };
    }
  }

  // Get file by ID
  static async getFile(fileId, bucketId = MEDIA_BUCKET_ID) {
    try {
      const response = await storage.getFile(bucketId, fileId);
      return {
        success: true,
        file: response,
      };
    } catch (error) {
      console.error("Error getting file:", error);
      return {
        success: false,
        error: error.message || "Failed to get file",
      };
    }
  }

  // Get file download URL
  static async getFileDownloadUrl(fileId, bucketId = MEDIA_BUCKET_ID) {
    try {
      const response = storage.getFileDownload(bucketId, fileId);
      return {
        success: true,
        downloadUrl: response,
      };
    } catch (error) {
      console.error("Error getting download URL:", error);
      return {
        success: false,
        error: error.message || "Failed to get download URL",
      };
    }
  }

  // Get file view URL — works on free plan (no image transformations needed)
  static getFileViewUrl(fileId, bucketId = MEDIA_BUCKET_ID) {
    const { client } = require("../config/appwrite");
    const endpoint = client.config.endpoint;
    const projectId = client.config.project;
    return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
  }

  // Get file preview URL (falls back to view URL if transformations are not available)
  static async getFilePreviewUrl(
    fileId,
    bucketId = MEDIA_BUCKET_ID,
    width = 200,
    height = 200
  ) {
    try {
      // Build the URL directly without making an HTTP call.
      // getFilePreview requires a paid plan; getFileView works on free plans.
      // We construct the view URL manually so no network request is made here.
      const { client } = require("../config/appwrite");
      const endpoint = client.config.endpoint;
      const projectId = client.config.project;

      const viewUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;

      return {
        success: true,
        previewUrl: viewUrl,
      };
    } catch (error) {
      console.error("Error building file URL:", error);
      return {
        success: false,
        error: error.message || "Failed to get file URL",
      };
    }
  }

  // Delete a file
  static async deleteFile(fileId, bucketId = MEDIA_BUCKET_ID) {
    try {
      await storage.deleteFile(bucketId, fileId);
      return {
        success: true,
        message: "File deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting file:", error);
      return {
        success: false,
        error: error.message || "Failed to delete file",
      };
    }
  }

  // List files in a bucket
  static async listFiles(bucketId = MEDIA_BUCKET_ID, limit = 25, offset = 0) {
    try {
      const response = await storage.listFiles(bucketId, [], limit, offset);
      return {
        success: true,
        files: response.files,
        total: response.total,
      };
    } catch (error) {
      console.error("Error listing files:", error);
      return {
        success: false,
        error: error.message || "Failed to list files",
      };
    }
  }
}

module.exports = StorageService;
