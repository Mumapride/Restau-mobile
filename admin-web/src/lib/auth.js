// RESTAU admin web — localStorage-backed authentication state.
// NOTE: The RESTAU backend issues bearer tokens (JWT) and does not set httpOnly
// cookies. Storing the token in localStorage is the most compatible frontend
// approach available, but it is inherently exposed to XSS. We never keep the
// token in memory-only state in a way that survives a page refresh, and we
// clear it on any 401/403 response from the backend.

const TOKEN_KEY = "restau_admin_web_token";
const USER_KEY = "restau_admin_web_user";

export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getAuthUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuth = (token, user) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Call this when the session is no longer valid (401/403) or the user logs out.
 * Triggers a redirect to the login page.
 */
export const logout = (onLogout) => {
  clearAuth();
  if (typeof onLogout === "function") onLogout();
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getAuthUser();
  return !!token && !!user;
};

export const isAdminUser = () => {
  const user = getAuthUser();
  return !!user && user.role === "ADMIN";
};
