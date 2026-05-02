import apiClient from "./client";

export const moderationAPI = {
  // Moderate content using OpenAI
  moderateContent: async (content) => {
    const response = await apiClient.post("/moderate", { content });
    return response.data;
  },

  // Moderate content using Appwrite Functions
  moderateContentAppwrite: async (content) => {
    const response = await apiClient.post("/moderate/appwrite", { content });
    return response.data;
  },
};
