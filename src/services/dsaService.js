import apiClient from "./apiClient";

const unwrap = (response) => {
  const payload = response.data;
  const data = payload?.data ?? payload;

  return data?.problem ?? data?.problems ?? data?.dsa ?? data?.stats ?? data;
};

export const getProblems = async (params = {}) => {
  const response = await apiClient.get("/api/admin/dsa", { params });
  return unwrap(response);
};

export const getProblem = async (id) => {
  const response = await apiClient.get(`/api/admin/dsa/${id}`);
  return unwrap(response);
};

export const createProblem = async (payload) => {
  const response = await apiClient.post("/api/admin/dsa", payload);
  return unwrap(response);
};

export const updateProblem = async (id, payload) => {
  const response = await apiClient.put(`/api/admin/dsa/${id}`, payload);
  return unwrap(response);
};

export const deleteProblem = async (id) => {
  const response = await apiClient.delete(`/api/admin/dsa/${id}`);
  return unwrap(response);
};

export const searchProblems = async (query) => {
  const response = await apiClient.get("/api/admin/dsa/search", {
    params: { q: query },
  });
  return unwrap(response);
};

export const updateStatus = async (id, status) => {
  const response = await apiClient.patch(`/api/admin/dsa/${id}/status`, {
    status,
  });

  return unwrap(response);
};

export const markRevised = async (id) => {
  const response = await apiClient.post(`/api/admin/dsa/${id}/revise`);
  return unwrap(response);
};

export const getStats = async () => {
  const response = await apiClient.get("/api/admin/dsa/stats");
  return unwrap(response);
};
