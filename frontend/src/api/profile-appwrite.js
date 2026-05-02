import {
  databases,
  storage,
  account,
  DATABASE_ID,
  USERS_COLLECTION_ID,
  POSTS_COLLECTION_ID,
  MEDIA_BUCKET_ID,
  ID,
  Query,
} from "../lib/appwrite";

export const profileAPI = {
  // Get user profile with their posts
  async getProfile() {
    try {
      const user = await account.get();
      const userId = user.$id;

      // Fetch user document
      let userDoc = null;
      try {
        userDoc = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId
        );
      } catch (error) {
        // User document doesn't exist, use account data
        console.log("User document not found, using account data");
        userDoc = {
          name: user.name,
          email: user.email,
          bio: "",
          avatarUrl: null,
          avatarFileId: null,
        };
      }

      // Fetch user's posts
      let posts = [];
      try {
        const postsResponse = await databases.listDocuments(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          [Query.equal("userId", userId), Query.orderDesc("$createdAt"), Query.limit(100)]
        );
        posts = postsResponse.documents;
      } catch (error) {
        console.error("Failed to fetch user posts:", error);
        // Continue with empty posts array
      }

      return {
        user: {
          id: userId,
          email: user.email,
          name: userDoc.name || user.name,
          bio: userDoc.bio || "",
          avatarUrl: userDoc.avatarUrl || null,
          avatarFileId: userDoc.avatarFileId || null,
        },
        posts: posts,
      };
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(data) {
    try {
      const user = await account.get();
      const userId = user.$id;

      // Try to update user document, create if doesn't exist
      let updatedDoc;
      try {
        updatedDoc = await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId,
          {
            name: data.name,
            bio: data.bio || "",
          }
        );
      } catch (error) {
        // Document doesn't exist, create it
        console.log("Creating user document");
        updatedDoc = await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId,
          {
            name: data.name,
            email: user.email,
            bio: data.bio || "",
            avatarUrl: null,
            avatarFileId: null,
            createdAt: new Date().toISOString(),
          }
        );
      }

      // Update account name if changed
      if (data.name && data.name !== user.name) {
        try {
          await account.updateName(data.name);
        } catch (error) {
          console.warn("Failed to update account name:", error);
        }
      }

      return {
        user: {
          id: userId,
          email: user.email,
          name: updatedDoc.name,
          bio: updatedDoc.bio,
          avatarUrl: updatedDoc.avatarUrl,
          avatarFileId: updatedDoc.avatarFileId,
        },
      };
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  },

  // Upload avatar
  async uploadAvatar(file) {
    try {
      const user = await account.get();
      const userId = user.$id;

      // Get current user document to check for existing avatar
      let userDoc = null;
      try {
        userDoc = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId
        );
      } catch (error) {
        // Create user document if it doesn't exist
        console.log("Creating user document for avatar upload");
        userDoc = await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId,
          {
            name: user.name,
            email: user.email,
            bio: "",
            avatarUrl: null,
            avatarFileId: null,
            createdAt: new Date().toISOString(),
          }
        );
      }

      // Upload new file - Appwrite web SDK accepts File object directly
      const uploadedFile = await storage.createFile(
        MEDIA_BUCKET_ID,
        ID.unique(),
        file
      );

      // Get file view URL
      const avatarUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${MEDIA_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

      // Update user document with new avatar
      const updatedDoc = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          avatarUrl: avatarUrl,
          avatarFileId: uploadedFile.$id,
        }
      );

      // Delete old avatar file if it exists and is different
      if (userDoc.avatarFileId && userDoc.avatarFileId !== uploadedFile.$id) {
        try {
          await storage.deleteFile(MEDIA_BUCKET_ID, userDoc.avatarFileId);
        } catch (deleteError) {
          console.warn("Failed to delete old avatar:", deleteError);
        }
      }

      return {
        user: {
          id: userId,
          email: user.email,
          name: updatedDoc.name || user.name,
          bio: updatedDoc.bio || "",
          avatarUrl: updatedDoc.avatarUrl,
          avatarFileId: updatedDoc.avatarFileId,
        },
      };
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      throw error;
    }
  },
};
