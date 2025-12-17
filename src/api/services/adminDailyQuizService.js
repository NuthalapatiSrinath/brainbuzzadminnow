import apiClient from "../apiClient";

const BASE_URL = "/admin/daily-quizzes";

// 1. Get All Quizzes
export const getAllQuizzes = (queryParams = "") => {
  return apiClient.get(`${BASE_URL}${queryParams}`);
};

// 2. Get Single Quiz
export const getQuizById = (id) => {
  return apiClient.get(`${BASE_URL}/${id}`);
};

// 3. Create Quiz (Renamed to match your Page's import)
export const createDailyQuiz = (data) => {
  return apiClient.post(`${BASE_URL}`, data);
};

// 4. Update Quiz
export const updateQuiz = (id, data) => {
  return apiClient.put(`${BASE_URL}/${id}`, data);
};

// 5. Delete Quiz
export const deleteQuiz = (id) => {
  return apiClient.delete(`${BASE_URL}/${id}`);
};
