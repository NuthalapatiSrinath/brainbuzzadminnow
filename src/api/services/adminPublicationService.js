import apiClient from "../apiClient";

const BASE_URL = "/admin/publications";

// 1. Get All
export const getAllPublications = (queryParams = "") => {
  return apiClient.get(`${BASE_URL}${queryParams}`);
};

// 2. Get Single
export const getPublicationById = (id) => {
  return apiClient.get(`${BASE_URL}/${id}`);
};

// 3. Create
export const createPublication = (formData) => {
  return apiClient.post(`${BASE_URL}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 4. Update
export const updatePublication = (id, formData) => {
  return apiClient.put(`${BASE_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 5. Delete
export const deletePublication = (id) => {
  return apiClient.delete(`${BASE_URL}/${id}`);
};
