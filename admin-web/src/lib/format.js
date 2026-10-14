/**
 * RESTAU admin web — date / currency formatting helpers.
 * Backend returns ISO 8601 strings (MySQL DateTime). We render on the client.
 */

/**
 * Convert any date value to the "YYYY-MM-DD" string required by <input type="date">.
 * Returns "" when the value is empty or invalid.
 */
export const toDateInputValue = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Format a short date like "Oct 10, 2026" */
export const formatDate = (value, fallback = "—") => {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/** Format a date-time like "Oct 10, 2026, 08:32 AM" */
export const formatDateTime = (value, fallback = "—") => {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Format an integer as a compact number (1,250) */
export const formatNumber = (value, maxFractionDigits = 0) => {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits });
};

/** Format a FCFA amount with thousand separators and CFA suffix */
export const formatCurrency = (value, fallback = "—") => {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  return `${n.toLocaleString("fr-CA")} FCFA`;
};

/** Mask a token (e.g. QR) so only the first/last characters are visible */
export const maskToken = (value, visible = 4) => {
  if (!value) return "—";
  if (value.length <= visible * 2) return value;
  return (
    value.slice(0, visible) +
    "…".repeat(Math.ceil((value.length - visible * 2) / 2)) +
    value.slice(-visible)
  );
};

/** Format a short time like "14:32" */
export const formatTime = (value, fallback = "—") => {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};
