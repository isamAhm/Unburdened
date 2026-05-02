const { storage, MEDIA_BUCKET_ID } = require("./config/appwrite");

async function fixBucketConfig() {
  try {
    console.log("Updating bucket:", MEDIA_BUCKET_ID);
    
    // Update bucket to allow more image formats and disable file security
    const bucket = await storage.updateBucket(
      MEDIA_BUCKET_ID,
      "media", // name
      [
        'read("any")',
        'create("users")',
        'read("users")',
        'update("users")',
        'delete("users")'
      ], // permissions
      false, // fileSecurity - DISABLE so bucket permissions apply to all files
      true, // enabled
      10000000, // maximumFileSize (10MB)
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'AVIF'], // allowedFileExtensions
      undefined, // compression
      undefined, // encryption
      undefined  // antivirus
    );
    
    console.log("\nBucket updated successfully!");
    console.log("- File Security:", bucket.fileSecurity);
    console.log("- Allowed Extensions:", bucket.allowedFileExtensions);
    console.log("- Permissions:", bucket.$permissions);
    
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    if (error.response) {
      console.error("Response:", error.response);
    }
  }
}

fixBucketConfig();
