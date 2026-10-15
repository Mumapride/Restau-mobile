import api from "../lib/axios.js";

/** Login an administrator via the real backend contract. */
export const loginAdmin = async (email, password) => {
  const { data } = await api.post("/auth/admin/login", { email, password });
  return data; // { token, user }
};
