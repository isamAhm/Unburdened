const { databases, DATABASE_ID } = require("./config/appwrite");
const { Permission, Role } = require("node-appwrite");

const SAVED_POSTS_COLLECTION_ID = "savedposts";

async function setupSavedPostsCollection() {
  try {
    console.log("Setting up savedposts collection...");

    // Create collection
    const collection = await databases.createCollection(
      DATABASE_ID,
      SAVED_POSTS_COLLECTION_ID,
      "Saved Posts",
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ]
    );

    console.log("Collection created:", collection.$id);

    // Create postId attribute (string, required)
    await databases.createStringAttribute(
      DATABASE_ID,
      SAVED_POSTS_COLLECTION_ID,
      "postId",
      255,
      true
    );
    console.log("Created postId attribute");

    // Create userId attribute (string, required)
    await databases.createStringAttribute(
      DATABASE_ID,
      SAVED_POSTS_COLLECTION_ID,
      "userId",
      255,
      true
    );
    console.log("Created userId attribute");

    // Wait for attributes to be available
    console.log("Waiting for attributes to be available...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create index for faster queries
    await databases.createIndex(
      DATABASE_ID,
      SAVED_POSTS_COLLECTION_ID,
      "userId_postId_idx",
      "key",
      ["userId", "postId"],
      ["ASC", "ASC"]
    );
    console.log("Created index");

    console.log("✅ Saved posts collection setup complete!");
  } catch (error) {
    if (error.code === 409) {
      console.log("Collection already exists");
    } else {
      console.error("Error setting up collection:", error.message);
      console.error("Full error:", error);
    }
  }
}

setupSavedPostsCollection();
