const { storage, MEDIA_BUCKET_ID } = require("./config/appwrite");

async function testBucketPermissions() {
  try {
    console.log("Testing bucket:", MEDIA_BUCKET_ID);
    
    // Get bucket details
    const bucket = await storage.getBucket(MEDIA_BUCKET_ID);
    
    console.log("\nBucket details:");
    console.log("- Name:", bucket.name);
    console.log("- ID:", bucket.$id);
    console.log("- Permissions:", bucket.$permissions);
    console.log("- File Security:", bucket.fileSecurity);
    console.log("- Enabled:", bucket.enabled);
    console.log("- Maximum File Size:", bucket.maximumFileSize);
    console.log("- Allowed File Extensions:", bucket.allowedFileExtensions);
    
    // List files
    const files = await storage.listFiles(MEDIA_BUCKET_ID);
    console.log("\nFiles in bucket:", files.total);
    
    if (files.total > 0) {
      const firstFile = files.files[0];
      console.log("\nFirst file:");
      console.log("- ID:", firstFile.$id);
      console.log("- Name:", firstFile.name);
      console.log("- Permissions:", firstFile.$permissions);
      
      // Generate view URL
      const { client } = require("./config/appwrite");
      const endpoint = client.config.endpoint;
      const projectId = client.config.project;
      const viewUrl = `${endpoint}/storage/buckets/${MEDIA_BUCKET_ID}/files/${firstFile.$id}/view?project=${projectId}`;
      
      console.log("\nGenerated view URL:");
      console.log(viewUrl);
      console.log("\nTry opening this URL in your browser. If you get 401, the bucket needs public read permissions.");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    console.error("Code:", error.code);
  }
}

testBucketPermissions();
