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
