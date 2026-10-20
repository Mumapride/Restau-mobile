import api from "../lib/axios.js";

/** Fetch all announcements including drafts (ADMIN only). GET /api/announcements/admin */
export const getAnnouncements = async () => {
  const { data } = await api.get("/announcements/admin");
  return Array.isArray(data) ? data : [];
};

/** Create an announcement (ADMIN only). POST /api/announcements */
export const createAnnouncement = async (payload) => {
  const { data } = await api.post("/announcements", payload);
  return data;
};

/** Update an announcement's title/body only (ADMIN only). PUT /api/announcements/:id */
export const updateAnnouncement = async (id, payload) => {
  const { data } = await api.put(`/announcements/${id}`, payload);
  return data;
};

/** Publish or unpublish an announcement (ADMIN only). PUT /api/announcements/:id/publish */
export const setAnnouncementPublishStatus = async (id, isPublished) => {
  const { data } = await api.put(`/announcements/${id}/publish`, { isPublished });
  return data;
};
