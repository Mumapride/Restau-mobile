import api from "../lib/axios.js";

/** Reports summary (GET /api/reports/summary, ADMIN) */
export const getReportsSummary = async () => {
  const { data } = await api.get("/reports/summary");
  return data;
};

/** Today's detailed report (GET /api/reports/daily, ADMIN) */
export const getDailyReport = async () => {
  const { data } = await api.get("/reports/daily");
  return data;
};
