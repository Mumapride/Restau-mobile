import api from "../lib/axios.js";

/** List the weekly menu (Tuesday - Friday) for the active semester. GET /api/menu-schedule */
export const getMenuSchedules = async () => {
  const { data } = await api.get("/menu-schedule");
  return Array.isArray(data) ? data : [];
};

/** Create a scheduled meal. POST /api/menu-schedule (ADMIN only) */
export const createMenuSchedule = async (payload) => {
  const { data } = await api.post("/menu-schedule", payload);
  return data;
};

/** Update a scheduled meal. PUT /api/menu-schedule/:id (ADMIN only) */
export const updateMenuSchedule = async (id, payload) => {
  const { data } = await api.put(`/menu-schedule/${id}`, payload);
  return data;
};

/** Delete a scheduled meal. DELETE /api/menu-schedule/:id (ADMIN only) */
export const deleteMenuSchedule = async (id) => {
  const { data } = await api.delete(`/menu-schedule/${id}`);
  return data;
};
