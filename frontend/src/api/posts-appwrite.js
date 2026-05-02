import {
  databases,
  account,
  DATABASE_ID,
  POSTS_COLLECTION_ID,
  COMMENTS_COLLECTION_ID,
  POST_LIKES_COLLECTION_ID,
  SAVED_POSTS_COLLECTION_ID,
  ID,
  Query,
} from "../lib/appwrite";

export const postsAPI = {
  // Get all posts
  async getAllPosts() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        [Query.orderDesc("$createdAt"), Query.limit(100)]
      );
      return response.documents;
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      throw error;
    }
  },

  // Create a new post
  async createPost(content, mood, userId) {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        ID.unique(),
        {
          content,
          mood,
          userId,
          likes: 0,
          commentsCount: 0,
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  },

  // Update a post
  async updatePost(postId, content) {
    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId,
        { content }
      );
      return response;
    } catch (error) {
      console.error("Failed to update post:", error);
      throw error;
    }
  },

  // Delete a post
  async deletePost(postId) {
    try {
      await databases.deleteDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete post:", error);
      throw error;
    }
  },

  // Toggle like on a post
  async toggleLike(postId) {
    try {
      const user = await account.get();
      const userId = user.$id;

      // Check if user already liked this post
      const existingLikes = await databases.listDocuments(
        DATABASE_ID,
        POST_LIKES_COLLECTION_ID,
        [
          Query.equal("postId", postId),
          Query.equal("userId", userId),
          Query.limit(1),
        ]
      );

      let liked = false;
      let newLikeCount = 0;

      if (existingLikes.documents.length > 0) {
        // Unlike: delete the like document
        await databases.deleteDocument(
          DATABASE_ID,
          POST_LIKES_COLLECTION_ID,
          existingLikes.documents[0].$id
        );
        liked = false;

        // Decrement likes count
        const post = await databases.getDocument(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          postId
        );
        newLikeCount = Math.max(0, (post.likes || 0) - 1);
        await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId, {
          likes: newLikeCount,
        });
      } else {
        // Like: create a like document
        await databases.createDocument(
          DATABASE_ID,
          POST_LIKES_COLLECTION_ID,
          ID.unique(),
          {
            postId,
            userId,
          }
        );
        liked = true;

        // Increment likes count
        const post = await databases.getDocument(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          postId
        );
        newLikeCount = (post.likes || 0) + 1;
        await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId, {
          likes: newLikeCount,
        });
      }

      return { liked, likes: newLikeCount };
    } catch (error) {
      console.error("Failed to toggle like:", error);
      throw error;
    }
  },

  // Toggle save on a post
  async toggleSave(postId) {
    try {
      const user = await account.get();
      const userId = user.$id;

      // Check if user already saved this post
      const existingSaves = await databases.listDocuments(
        DATABASE_ID,
        SAVED_POSTS_COLLECTION_ID,
        [
          Query.equal("postId", postId),
          Query.equal("userId", userId),
          Query.limit(1),
        ]
      );

      let saved = false;

      if (existingSaves.documents.length > 0) {
        // Unsave: delete the save document
        await databases.deleteDocument(
          DATABASE_ID,
          SAVED_POSTS_COLLECTION_ID,
          existingSaves.documents[0].$id
        );
        saved = false;
      } else {
        // Save: create a save document
        await databases.createDocument(
          DATABASE_ID,
          SAVED_POSTS_COLLECTION_ID,
          ID.unique(),
          {
            postId,
            userId,
          }
        );
        saved = true;
      }

      return { saved };
    } catch (error) {
      console.error("Failed to toggle save:", error);
      throw error;
    }
  },

  // Get saved posts for current user
  async getSavedPosts() {
    try {
      const user = await account.get();
      const userId = user.$id;

      // Get all saved post IDs for this user
      const savedDocs = await databases.listDocuments(
        DATABASE_ID,
        SAVED_POSTS_COLLECTION_ID,
        [Query.equal("userId", userId), Query.limit(100)]
      );

      // Fetch the actual posts
      const postIds = savedDocs.documents.map((doc) => doc.postId);
      if (postIds.length === 0) {
        return [];
      }

      // Fetch posts one by one to avoid query issues
      const posts = [];
      for (const postId of postIds) {
        try {
          const post = await databases.getDocument(
            DATABASE_ID,
            POSTS_COLLECTION_ID,
            postId
          );
          posts.push(post);
        } catch (error) {
          console.warn(`Failed to fetch post ${postId}:`, error);
          // Skip this post if it doesn't exist
        }
      }

      // Sort by creation date
      posts.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

      return posts;
    } catch (error) {
      console.error("Failed to fetch saved posts:", error);
      throw error;
    }
  },

  // Get comments for a post
  async getComments(postId) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        [Query.equal("postId", postId), Query.orderAsc("$createdAt"), Query.limit(100)]
      );
      return response.documents;
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      throw error;
    }
  },

  // Add a comment to a post
  async addComment(postId, content, parentId = null) {
    try {
      const user = await account.get();
      const userId = user.$id;

      const comment = await databases.createDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          postId,
          userId,
          content,
          parentId: parentId || null,
        }
      );

      // Increment comments count on the post
      const post = await databases.getDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId
      );
      await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId, {
        commentsCount: (post.commentsCount || 0) + 1,
      });

      return comment;
    } catch (error) {
      console.error("Failed to add comment:", error);
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(commentId, postId) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        commentId
      );

      // Decrement comments count on the post
      const post = await databases.getDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        postId
      );
      await databases.updateDocument(DATABASE_ID, POSTS_COLLECTION_ID, postId, {
        commentsCount: Math.max(0, (post.commentsCount || 0) - 1),
      });

      return { success: true };
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  },
};
