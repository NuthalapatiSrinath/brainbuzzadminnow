import apiClient from "../apiClient";

const BASE_URL = "/admin/courses";

// ✅ CORRECT: Must point to '/all-in-one' to handle files & complex JSON
export const createCourse = async (formData) => {
  const response = await apiClient.post(`${BASE_URL}/all-in-one`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getAllCourses = async () => {
  const response = await apiClient.get(BASE_URL);
  return response.data;
};
