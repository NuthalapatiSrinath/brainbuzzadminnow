import apiClient from "../apiClient";

const BASE_URL = "/admin/categories";

// Get Categories (Filtered by Section)
export const getAllCategories = async (section = null) => {
  const url = section ? `${BASE_URL}?section=${section}` : BASE_URL;
  const response = await apiClient.get(url);
  return response.data;
};

// Create or Update Category (Handles Text OR FormData for Images)
export const saveCategory = async (data, id = null) => {
  // Check if data is FormData (has file) or JSON
  const isFormData = data instanceof FormData;
  const config = isFormData
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};

  if (id) {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data, config);
    return response.data;
  } else {
    const response = await apiClient.post(BASE_URL, data, config);
    return response.data;
  }
};

// Delete Single Category
export const deleteCategory = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};

// Bulk Delete Categories
export const bulkDeleteCategories = async (ids) => {
  // We send JSON for bulk delete
  const response = await apiClient.post(`${BASE_URL}/bulk-delete`, { ids });
  return response.data;
};
