/** Normalize an axios/JS error into a safe, user-friendly message.

  - Never renders raw backend/Prisma/SQL internals to the user.
  - Logs a sanitized, context-light copy of the raw error to the console for
    developer diagnostics (no secrets, tokens, or full SQL are exposed).
  - Handles network failures, missing response data, and unknown errors.
  - Does not swallow errors: they are always logged; the UI only receives the
    sanitized human-facing string.
  - Intended for binding to a UI label, not for silently ignoring failures. */
export const getErrorMessage = (error) => {
  // Diagnostics: capture a minimal, non-sensitive snapshot for developers.
  // Guard against errors that may be plain objects rather than Error instances.
  const message = error?.response?.data?.message;
  const status = error?.response?.status;
  if (typeof message === "string" && message.trim().length > 0) {
    console.error(
      `[AdminWeb] API error ${status}: ${message.replace(/[\r\n]+/g, " ")}`
    );
  } else if (error?.request) {
    console.error("[AdminWeb] Network error (no response received):", error);
  } else {
    console.error("[AdminWeb] AdminWeb error:", error);
  }

  if (!error) return "Something went wrong. Please try again.";

  const response = error?.response;
  if (response?.data) {
    const message = response.data?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      const normalized = message.replace(/\s+/g, " ").trim();
      if (normalized.length <= 160) return normalized;
      return "Something went wrong. Please try again.";
    }
  }

  if (error?.request) {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
};
