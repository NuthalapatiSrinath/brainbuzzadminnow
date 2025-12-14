import axios from "axios";

// Get the token from localStorage
const getToken = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth"));
    return auth ? auth.token : null;
  } catch (e) {
    return null;
  }
};

// Create the axios client
const apiClient = axios.create({
  // Use your backend's base URL
  baseURL: "http://192.168.1.7:4000/api", // <-- Change this if your backend is elsewhere
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
