import apiClient from "./client";

export const authAPI = {
  // Register a new user
  register: async (email, password, name) => {
    const response = await apiClient.post("/auth/register", {
      email,
      password,
      name,
    });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });

    // Store session secret in localStorage
    if (response.data.session?.secret) {
      localStorage.setItem("sessionSecret", response.data.session.secret);
    }

    return response.data;
  },

  // Logout user
  logout: async () => {
    const sessionSecret = localStorage.getItem("sessionSecret");
    if (sessionSecret) {
      await apiClient.post("/auth/logout", { sessionSecret });
      localStorage.removeItem("sessionSecret");
      localStorage.removeItem("userReactions");
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  // Verify session
  verifySession: async () => {
    const response = await apiClient.get("/auth/verify");
    return response.data;
  },
};
