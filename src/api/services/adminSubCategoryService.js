import apiClient from "../apiClient";

const BASE_URL = "/admin/subcategories";

// Get SubCategories (Filtered by Parent Category & Section)
export const getAllSubCategories = async (
  categoryId = null,
  section = null
) => {
  const params = new URLSearchParams();
  if (categoryId) params.append("category", categoryId); // Backend expects 'category'
  if (section) params.append("section", section);

  const url = `${BASE_URL}?${params.toString()}`;
  const response = await apiClient.get(url);
  return response.data;
};

// Create or Update SubCategory
export const saveSubCategory = async (data, id = null) => {
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

// Delete Single SubCategory
export const deleteSubCategory = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};

// Bulk Delete SubCategories
export const bulkDeleteSubCategories = async (ids) => {
  const response = await apiClient.post(`${BASE_URL}/bulk-delete`, { ids });
  return response.data;
};
