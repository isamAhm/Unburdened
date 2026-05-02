import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth headers and set Content-Type appropriately
apiClient.interceptors.request.use(
  (config) => {
    const sessionSecret = localStorage.getItem("sessionSecret");
    if (sessionSecret) {
      config.headers["X-Appwrite-Session"] = sessionSecret;
    }
    
    // For FormData, remove Content-Type so axios sets multipart/form-data with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      // For non-FormData, set JSON Content-Type
      config.headers["Content-Type"] = "application/json";
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear session on unauthorized
      localStorage.removeItem("sessionSecret");
      localStorage.removeItem("userReactions");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
