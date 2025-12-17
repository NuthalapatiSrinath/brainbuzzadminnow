import apiClient from "../apiClient";

const BASE_URL = "/admin/ebooks";

// 1. Get All E-Books
export const getAllEBooks = (queryParams = "") => {
  return apiClient.get(`${BASE_URL}${queryParams}`);
};

// 2. Get Single E-Book
export const getEBookById = (id) => {
  return apiClient.get(`${BASE_URL}/${id}`);
};

// 3. Create E-Book
export const createEBook = (formData) => {
  return apiClient.post(`${BASE_URL}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 4. Update E-Book
export const updateEBook = (id, formData) => {
  return apiClient.put(`${BASE_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 5. Delete E-Book
export const deleteEBook = (id) => {
  return apiClient.delete(`${BASE_URL}/${id}`);
};
