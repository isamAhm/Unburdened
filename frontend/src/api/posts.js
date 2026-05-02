import apiClient from "./client";

export const postsAPI = {
  // Get all posts
  getAllPosts: async () => {
    const response = await apiClient.get("/posts");
    return response.data;
  },

  // Create a new post
  createPost: async (content, mood, userId) => {
    const response = await apiClient.post("/posts", { content, mood, userId });
    return response.data;
  },

  // Get authenticated user's posts
  getMyPosts: async () => {
    const response = await apiClient.get("/posts/mine");
    return response.data;
  },

  // Update a post
  updatePost: async (postId, content) => {
    const response = await apiClient.put(`/posts/${postId}`, { content });
    return response.data;
  },

  // Toggle like on a post
  toggleLike: async (postId) => {
    const response = await apiClient.put(`/posts/${postId}/like`);
    return response.data;
  },

  // Get comments for a post
  getComments: async (postId) => {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data;
  },

  // Add a comment to a post
  addComment: async (postId, content, parentId) => {
    const response = await apiClient.post(`/posts/${postId}/comments`, {
      content,
      parentId,
    });
    return response.data;
  },

  // Delete a post
  deletePost: async (postId) => {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response.data;
  },

  // Toggle save on a post
  toggleSave: async (postId) => {
    const response = await apiClient.put(`/posts/${postId}/save`);
    return response.data;
  },

  // Get saved posts
  getSavedPosts: async () => {
    const response = await apiClient.get("/posts/saved/list");
    return response.data;
  },
};
