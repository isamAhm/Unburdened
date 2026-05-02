const {
  databases,
  DATABASE_ID,
  POSTS_COLLECTION_ID,
  USERS_COLLECTION_ID,
  COMMENTS_COLLECTION_ID,
  POST_LIKES_COLLECTION_ID,
  SAVED_POSTS_COLLECTION_ID,
} = require("../config/appwrite");
const { ID, Query } = require("node-appwrite");

class DatabaseService {
  // Posts operations
  static async getAllPosts() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        [Query.orderDesc("$createdAt")]
      );
      console.log(`Fetched ${response.documents.length} posts from Appwrite`);
      return response.documents;
    } catch (error) {
      console.error("Error fetching posts from Appwrite:", error);
      throw new Error("Failed to fetch posts");
    }
  }

  static async createPost(content, mood, userId) {
    try {
      const documentId = ID.unique();
      const title = content.trim().slice(0, 120) || "Untitled";
      const documentData = {
        content,
        mood,
        userId,
        likes: 0,
        commentsCount: 0,
      };

      if (process.env.APPWRITE_POSTS_INCLUDE_TITLE !== "false") {
        documentData.title = title;
      }

      const response = await databases.createDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        documentId,
        documentData
      );
      console.log("Post created successfully in Appwrite:", response.$id);
      return response;
    } catch (error) {
      console.error("Error creating post in Appwrite:", {
        message: error.message,
        code: error.code,
        response: error.response, // Appwrite SDK errors
      });
      throw error;
    }
  }

  static async incrementPostCounter(postId, field, delta = 1) {
    try {
      const post = await databases.getDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId
      );

      if (!post) {
        throw new Error("Post not found");
      }

      const currentValue = Number(post[field]) || 0;
      const nextValue = Math.max(0, currentValue + delta);

      const response = await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId,
        {
          [field]: nextValue,
        }
      );
      return response;
    } catch (error) {
      console.error("Error incrementing post counter:", error);
      throw new Error("Failed to update post counter");
    }
  }

  static async togglePostLike(postId, userId) {
    try {
      console.log(
        `Toggling like for post ${postId}, user ${userId}, collection: ${POST_LIKES_COLLECTION_ID}`
      );
      const existing = await databases.listDocuments(
        DATABASE_ID,
        POST_LIKES_COLLECTION_ID,
        [Query.equal("postId", [postId]), Query.equal("userId", [userId])]
      );

      if (existing.total > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          POST_LIKES_COLLECTION_ID,
          existing.documents[0].$id
        );
        const post = await this.incrementPostCounter(postId, "likes", -1);
        return { liked: false, likes: post.likes };
      }

      const documentId = ID.unique();
      await databases.createDocument(
        DATABASE_ID,
        POST_LIKES_COLLECTION_ID,
        documentId,
        {
          postId,
          userId,
        }
      );
      const post = await this.incrementPostCounter(postId, "likes", 1);
      return { liked: true, likes: post.likes };
    } catch (error) {
      console.error("Error toggling like:", {
        message: error.message,
        code: error.code,
        response: error.response,
        type: error.type,
      });
      throw error;
    }
  }

  static async listComments(postId) {
    try {
      console.log(
        `Fetching comments for post ${postId}, collection: ${COMMENTS_COLLECTION_ID}`
      );
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        [Query.equal("postId", [postId]), Query.orderAsc("$createdAt")]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching comments:", {
        message: error.message,
        code: error.code,
        response: error.response,
        type: error.type,
        postId,
        collection: COMMENTS_COLLECTION_ID,
      });
      throw error;
    }
  }

  static async addComment(postId, userId, content, parentId = null) {
    try {
      console.log(
        `Adding comment to post ${postId}, user ${userId}, collection: ${COMMENTS_COLLECTION_ID}`
      );
      if (parentId) {
        const parentComment = await databases.getDocument(
          DATABASE_ID,
          COMMENTS_COLLECTION_ID,
          parentId
        );
        if (!parentComment || parentComment.postId !== postId) {
          throw new Error("Invalid parent comment");
        }
      }

      const documentId = ID.unique();
      const commentData = {
        postId,
        userId,
        content,
      };

      // Only include parentId if it's not null
      if (parentId) {
        commentData.parentId = parentId;
      }

      const comment = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        documentId,
        commentData
      );

      await this.incrementPostCounter(postId, "commentsCount", 1);

      return comment;
    } catch (error) {
      console.error("Error creating comment:", {
        message: error.message,
        code: error.code,
        response: error.response,
        type: error.type,
      });
      throw error;
    }
  }

  static async deletePost(postId) {
    try {
      await databases.deleteDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId);
      return { message: "Post deleted successfully" };
    } catch (error) {
      console.error("Error deleting post:", error);
      throw new Error("Failed to delete post");
    }
  }

  // User operations
  static async createUser(userId, email, name) {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          email,
          name,
          bio: "",
          avatarUrl: null,
          avatarFileId: null,
        }
      );
      return response;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  static async getUser(userId) {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );
      return response;
    } catch (error) {
      console.error("Error fetching user:", {
        message: error.message,
        code: error.code,
        response: error.response,
      });

      // If the profile document doesn't exist yet, treat it as "no profile"
      // instead of a hard error so profile/avatar operations don't fail.
      if (error.code === 404 || error?.response?.code === 404) {
        return null;
      }

      throw new Error("Failed to fetch user");
    }
  }

  static async updateUserProfile(userId, updates) {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        updates
      );
      return response;
    } catch (error) {
      // If document doesn't exist, create it (upsert behaviour)
      if (error.code === 404) {
        try {
          const response = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            {
              email: updates.email || "",
              name: updates.name || "",
              bio: updates.bio || "",
              avatarUrl: updates.avatarUrl || null,
              avatarFileId: updates.avatarFileId || null,
              createdAt: new Date().toISOString(),
              status: "active",
              isVerified: false,
              loginAttempts: 0,
            }
          );
          return response;
        } catch (createError) {
          console.error("Error creating user profile document:", createError);
          throw new Error("Failed to create user profile");
        }
      }
      console.error("Error updating user profile:", error);
      throw new Error("Failed to update user profile");
    }
  }

  static async listUserPosts(userId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        [Query.equal("userId", [userId]), Query.orderDesc("$createdAt")]
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw new Error("Failed to fetch user posts");
    }
  }

  static async getPost(postId) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId
      );
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  }

  static async updatePost(postId, data) {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId,
        data
      );
      return response;
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }

  // Saved posts operations
  static async toggleSavePost(postId, userId) {
    try {
      console.log(
        `Toggling save for post ${postId}, user ${userId}, collection: ${SAVED_POSTS_COLLECTION_ID}`
      );
      const existing = await databases.listDocuments(
        DATABASE_ID,
        SAVED_POSTS_COLLECTION_ID,
        [Query.equal("postId", [postId]), Query.equal("userId", [userId])]
      );

      if (existing.total > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          SAVED_POSTS_COLLECTION_ID,
          existing.documents[0].$id
        );
        return { saved: false };
      }

      const documentId = ID.unique();
      await databases.createDocument(
        DATABASE_ID,
        SAVED_POSTS_COLLECTION_ID,
        documentId,
        {
          postId,
          userId,
        }
      );
      return { saved: true };
    } catch (error) {
      console.error("Error toggling save:", {
        message: error.message,
        code: error.code,
        response: error.response,
        type: error.type,
      });
      throw error;
    }
  }

  static async listSavedPosts(userId) {
    try {
      const savedResponse = await databases.listDocuments(
        DATABASE_ID,
        SAVED_POSTS_COLLECTION_ID,
        [Query.equal("userId", [userId]), Query.orderDesc("$createdAt")]
      );

      const postIds = savedResponse.documents.map((doc) => doc.postId);
      
      if (postIds.length === 0) {
        return [];
      }

      const posts = await Promise.all(
        postIds.map(async (postId) => {
          try {
            return await this.getPost(postId);
          } catch (error) {
            console.warn(`Post ${postId} not found, skipping`);
            return null;
          }
        })
      );

      return posts.filter((post) => post !== null);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      throw new Error("Failed to fetch saved posts");
    }
  }
}

module.exports = DatabaseService;
