import apiClient from "./client";

export const profileAPI = {
  getProfile: async () => {
    const response = await apiClient.get("/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put("/profile", data);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    console.log("FormData created:", {
      hasFile: formData.has("file"),
      file: file ? { name: file.name, type: file.type, size: file.size } : null,
    });

    // Let axios handle FormData automatically - it will set the correct Content-Type
    const response = await apiClient.post("/profile/avatar", formData);

    return response.data;
  },
};

