import axios from "axios";

// --- FIX: Get 'adminToken' directly (matches authSlice) ---
const getToken = () => {
  return localStorage.getItem("adminToken");
};

// Create the axios client
const apiClient = axios.create({
  // Use your backend's base URL
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
