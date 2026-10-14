import api from "../lib/axios.js";

/** Create a semester (POST /api/semesters) */
export const createSemester = async (payload) => {
  const { data } = await api.post("/semesters", payload);
  return data;
};

/** Get the currently active semester (GET /api/semesters/active) */
export const getActiveSemester = async () => {
  const { data } = await api.get("/semesters/active");
  return data;
};

/** Update a semester (PUT /api/semesters/:id) */
export const updateSemester = async (id, payload) => {
  const { data } = await api.put(`/semesters/${id}`, payload);
  return data;
};

/** Close (deactivate) a semester (PUT /api/semesters/:id/close) */
export const closeSemester = async (id) => {
  const { data } = await api.put(`/semesters/${id}/close`);
  return data;
};
