import React from "react";

/**
 * StatusBadge renders a restrained status pill.
 *
 * The RESTAU backend uses UPPERCASE enum values (Prisma enums):
 *   - PayStatus:  PENDING | VERIFIED | REJECTED
 *   - role/state: ACTIVE | INACTIVE
 * Meal claims are always "completed" (no status enum) and are shown as CLAIMED.
 *
 * We normalise the incoming value to UPPERCASE and look it up, so callers can
 * pass either the raw backend value or a lowercase variant. Unknown values fall
 * back to a neutral muted pill so the UI never crashes on an unexpected value.
 */
const STATUS_CONFIG = {
  VERIFIED: {
    label: "Verified",
    classes: "bg-success/15 text-success border-success/30",
  },
  PENDING: {
    label: "Pending",
    classes: "bg-warning/15 text-warning border-warning/30",
  },
  REJECTED: {
    label: "Rejected",
    classes: "bg-error/15 text-error border-error/30",
  },
  ACTIVE: {
    label: "Active",
    classes: "bg-primary/15 text-primary border-primary/30",
  },
  INACTIVE: {
    label: "Inactive",
    classes: "bg-border text-text-muted border-border",
  },
  CLAIMED: {
    label: "Claimed",
    classes: "bg-success/15 text-success border-success/30",
  },
};

// Accept lowercase aliases used by some callers.
const ALIASES = {
  SUCCESS: "VERIFIED",
  FAILED: "REJECTED",
  CONFIRMED: "VERIFIED",
};

const NEUTRAL = {
  label: "—",
  classes: "bg-border text-text-muted border-border",
};

const StatusBadge = ({ status, variant, label, className = "" }) => {
  const raw = String(status ?? variant ?? "").toUpperCase();
  const key = ALIASES[raw] || raw;
  const config = STATUS_CONFIG[key] || NEUTRAL;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.classes} ${className}`}
    >
      {label || config.label}
    </span>
  );
};

export default StatusBadge;
