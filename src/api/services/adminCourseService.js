import apiClient from "../apiClient";

const BASE_URL = "/admin/courses";

// =========================================================
// GETTERS
// =========================================================

// 1. Get All Courses (Supports query params like ?contentType=ONLINE_COURSE)
export const getAllCourses = (queryParams = "") => {
  return apiClient.get(`${BASE_URL}${queryParams}`);
};

// 2. Get Single Course by ID
export const getCourseById = (id) => {
  return apiClient.get(`${BASE_URL}/${id}`);
};

// =========================================================
// CREATE
// =========================================================

// 3. Create Course (All-in-One Payload)
// Used by AdminOnlineCoursesPage.jsx
export const createCourse = (formData) => {
  return apiClient.post(`${BASE_URL}/all-in-one`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 4. Create Course Shell (Step 1 of Multi-step Wizard)
export const createCourseShell = (data) => {
  return apiClient.post(`${BASE_URL}`, data);
};

// =========================================================
// UPDATES (Granular / Specific)
// =========================================================

// 5. Update Shell (Categories, Date, Type)
export const updateCourseShell = (id, data) => {
  return apiClient.put(`${BASE_URL}/${id}`, data);
};

// 6. Update Basics (Name, Thumbnail, Pricing, Languages)
export const updateCourseBasic = (id, formData) => {
  return apiClient.put(`${BASE_URL}/${id}/basics`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 7. Update Content (Descriptions, Pricing Note, Add Study Materials)
export const updateCourseContent = (id, formData) => {
  return apiClient.put(`${BASE_URL}/${id}/content`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 8. Update Entire Course (All-in-One - Legacy)
// Use this for the simple "Edit" modal if you send everything at once
export const updateCourse = (id, formData) => {
  return apiClient.put(`${BASE_URL}/${id}/all-in-one`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// =========================================================
// NESTED UPDATES (Tutors, Classes, Materials)
// =========================================================

// --- TUTORS ---

export const addTutors = (courseId, formData) => {
  return apiClient.post(`${BASE_URL}/${courseId}/tutors`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateTutor = (courseId, tutorId, formData) => {
  return apiClient.put(`${BASE_URL}/${courseId}/tutors/${tutorId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteTutor = (courseId, tutorId) => {
  return apiClient.delete(`${BASE_URL}/${courseId}/tutors/${tutorId}`);
};

// --- CLASSES ---

export const addClassesToCourse = (courseId, formData) => {
  return apiClient.post(`${BASE_URL}/${courseId}/classes`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateClass = (courseId, classId, formData) => {
  return apiClient.put(`${BASE_URL}/${courseId}/classes/${classId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteClass = (courseId, classId) => {
  return apiClient.delete(`${BASE_URL}/${courseId}/classes/${classId}`);
};

// --- MATERIALS ---

export const deleteStudyMaterial = (courseId, materialId) => {
  return apiClient.delete(
    `${BASE_URL}/${courseId}/study-materials/${materialId}`
  );
};

// =========================================================
// DELETE
// =========================================================

// 9. Delete Entire Course
export const deleteCourse = (id) => {
  return apiClient.delete(`${BASE_URL}/${id}`);
};
