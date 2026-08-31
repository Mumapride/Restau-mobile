import axios from "axios";

const BASE_URL = "http://10.206.52.86:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// Get the currently active semester
export const getActiveSemester = async () => {
  const response = await api.get("/semesters/active");
  return response.data;
};

// Create a semester
export const createSemester = async (semesterData) => {
  const response = await api.post("/semesters", semesterData);
  return response.data;
};

// Update a semester
export const updateSemester = async (id, semesterData) => {
  const response = await api.put(
    `/semesters/${id}`,
    semesterData
  );

  return response.data;
};

// Close a semester
export const closeSemester = async (id) => {
  const response = await api.put(
    `/semesters/${id}/close`
  );

  return response.data;
};