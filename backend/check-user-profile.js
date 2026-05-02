const DatabaseService = require("./services/database");

// Replace with your actual user ID from the logs
const userId = "690dd81500053f903ea6"; // From the error log you showed

async function checkUserProfile() {
  try {
    console.log("Checking user profile for:", userId);
    
    const profile = await DatabaseService.getUser(userId);
    
    if (profile) {
      console.log("\nProfile found:");
      console.log("- Name:", profile.name);
      console.log("- Email:", profile.email);
      console.log("- Bio:", profile.bio);
      console.log("- Avatar URL:", profile.avatarUrl);
      console.log("- Avatar File ID:", profile.avatarFileId);
    } else {
      console.log("\nProfile document does NOT exist for this user.");
      console.log("This is why uploads were failing - the updateUserProfile was trying to update a non-existent document.");
      console.log("\nThe fix I applied will now CREATE the document if it doesn't exist.");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

checkUserProfile();
