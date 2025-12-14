import apiClient from "./apiClient";

// ---------------------------
// Auth Routes
// ---------------------------
export const register = (userData) =>
  apiClient.post("/auth/register", userData);

export const login = (credentials) =>
  apiClient.post("/auth/login", credentials);

export const forgotPassword = (emailData) =>
  apiClient.post("/auth/forgot-password", emailData);

export const resetPassword = (data) =>
  apiClient.post("/auth/reset-password", data);

// ---------------------------
// Current Affairs Routes
// ---------------------------

// Get all categories (e.g., UPSC, SSC)
export const getAllCategories = () =>
  apiClient.get("/currentaffairs/categories");

// Get "All" page data (Categories + Subcategories grouped)
export const getAllCategoriesWithSubs = () =>
  apiClient.get("/currentaffairs/all");

// Get a specific category landing page (e.g., /currentaffairs/upsc)
export const getCategoryLanding = (categoryKey) =>
  apiClient.get(`/currentaffairs/${categoryKey}`);

// Get articles list for a subcategory (e.g., /currentaffairs/upsc/upsc_ias/articles)
// queryParams can be: ?page=1&limit=20&month=2023-10
export const getArticlesList = (categoryKey, subId, queryParams = "") =>
  apiClient.get(
    `/currentaffairs/${categoryKey}/${subId}/articles${queryParams}`
  );

// Get a single article detail
export const getArticleDetail = (categoryKey, subId, articleId) =>
  apiClient.get(`/currentaffairs/${categoryKey}/${subId}/${articleId}`);

// ---------------------------
// Admin Routes (Protected)
// ---------------------------
// Example: Create Category
export const createCategory = (data) => apiClient.post("/admin/category", data);

// Example: Create Content
export const createContent = (data) => apiClient.post("/admin/content", data);

// ---------------------------
// Admin Course Routes
// ---------------------------

// 1. Get All Courses
export const getAllCourses = () => apiClient.get("/admin/courses");

// 2. Get Single Course by ID
export const getCourseById = (id) => apiClient.get(`/admin/courses/${id}`);

// 3. Create Course (All-in-One)
// Note: 'data' must be a FormData object because of file uploads
export const createCourse = (formData) =>
  apiClient.post("/admin/courses/all-in-one", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// 4. Update Course (All-in-One)
export const updateCourse = (id, formData) =>
  apiClient.put(`/admin/courses/${id}/all-in-one`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// 5. Delete Course
export const deleteCourse = (id) => apiClient.delete(`/admin/courses/${id}`);

// --- Helper for Dropdowns (Categories, Languages, Validities) ---
// You likely need endpoints to fetch these to populate dropdowns in the editor
export const getAllLanguages = () => apiClient.get("/admin/languages");
export const getAllValidities = () => apiClient.get("/admin/validities");
export const getAllCategoriesAdmin = () => apiClient.get("/admin/categories");

// Login (Matches authController.loginAdmin)
export const adminLoginAPI = (credentials) =>
  apiClient.post("/admin/login", credentials);

// (Optional) Get Profile
export const getAdminProfileAPI = () => apiClient.get("/admin/me");
