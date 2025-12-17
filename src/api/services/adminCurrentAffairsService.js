import apiClient from "../apiClient";

const BASE_URL = "/admin/current-affairs";

// 1. Get All (Supports query params)
export const getAllCurrentAffairs = (queryParams = "") => {
  return apiClient.get(`${BASE_URL}${queryParams}`);
};

// 2. Get Single (⚠️ keep as-is if already used elsewhere)
export const getCurrentAffairById = (type, id) => {
  return apiClient.get(`${BASE_URL}/${type}/${id}`);
};

// 3. Create (already correct)
export const createCurrentAffair = (formData) => {
  return apiClient.post(`${BASE_URL}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

const TYPE_ROUTE_MAP = {
  LatestCurrentAffair: "latest",
  MonthlyCurrentAffair: "monthly",
  StateCurrentAffair: "state",
  LocalCurrentAffair: "local",
  SportsCurrentAffair: "sports",
  InternationalCurrentAffair: "international",
  PoliticsCurrentAffair: "politics",
};

export const updateCurrentAffair = (type, id, formData) => {
  const routeType = TYPE_ROUTE_MAP[type];

  if (!routeType) {
    throw new Error(`Unknown CurrentAffair type: ${type}`);
  }

  console.log("🛠️ Updating Current Affair:", {
    originalType: type,
    routeType,
    id,
    payload: [...formData.entries()],
  });

  return apiClient.put(`/admin/current-affairs/${routeType}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// 5. Delete (⚠️ if delete is also type-based in backend, tell me)
export const deleteCurrentAffair = (type, id) => {
  return apiClient.delete(`${BASE_URL}/${type.toLowerCase()}/${id}`);
};
