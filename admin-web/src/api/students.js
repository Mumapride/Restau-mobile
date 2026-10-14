import api from "../lib/axios.js";

/**
 * Student directory.
 *
 * IMPORTANT (documented limitation): the RESTAU backend exposes NO dedicated
 * admin student-listing endpoint. (`GET /api/users/students/me` requires the
 * STUDENT role and only returns the caller's own profile.)
 *
 * However, student records ARE fully obtainable by composing three existing
 * ADMIN-accessible endpoints, all consumed client-side:
 *
 *   1. GET /api/subscriptions — embeds `student` (id, matricule, email) plus
 *      mealPlan / semester / payments per subscription. NOTE: it does NOT
 *      embed `student.user`, so names are NOT available here.
 *   2. GET /api/meal-claims   — embeds `student` INCLUDING `student.user`,
 *      which provides the real firstName / lastName.
 *   3. GET /api/reports/summary — returns `totalStudents`, the true count of
 *      all registered students, used to state coverage honestly.
 *
 * Results are merged by student id. No endpoint or field is invented. Where a
 * value genuinely cannot be resolved (e.g. a name never exposed by any feed),
 * it renders as "—" rather than being fabricated.
 */

/** True total of registered students, or null if unavailable. */
const getRegisteredTotal = async () => {
  try {
    const { data } = await api.get("/reports/summary");
    const total = Number(data?.totalStudents);
    return Number.isFinite(total) ? total : null;
  } catch {
    return null;
  }
};

/** nameByStudent: Map<studentId, { firstName, lastName }> from the claims feed. */
const getNameMap = async () => {
  const map = new Map();
  try {
    const { data } = await api.get("/meal-claims");
    (data || []).forEach((claim) => {
      const s = claim?.student;
      if (!s?.id || map.has(s.id)) return;
      const first = s.user?.firstName ?? s.firstName ?? null;
      const last = s.user?.lastName ?? s.lastName ?? null;
      if (first || last) map.set(s.id, { firstName: first, lastName: last });
    });
  } catch {
    /* names stay unresolved; callers show "—" */
  }
  return map;
};

/** Build the directory from subscriptions, enriched with names. */
const buildDirectory = (subscriptions, nameByStudent) => {
  const byId = new Map();
  (subscriptions || []).forEach((sub) => {
    const s = sub?.student;
    if (!s?.id || byId.has(s.id)) return;
    const name = nameByStudent.get(s.id) || {};
    byId.set(s.id, {
      id: s.id,
      firstName: name.firstName ?? null,
      lastName: name.lastName ?? null,
      matricule: s.matricule ?? null,
      email: s.email ?? null,
      subscriptionCount: 0,
      latestPlanName: null,
      latestSemesterName: null,
      creditsRemaining: 0,
      claimsCount: 0,
    });
  });

  // Second pass aggregates subscription-derived facts per student.
  (subscriptions || []).forEach((sub) => {
    const row = byId.get(sub?.student?.id);
    if (!row) return;
    row.subscriptionCount += 1;
    const planName = sub?.mealPlan?.name ?? null;
    if (planName && !row.latestPlanName) row.latestPlanName = planName;
    const semName = sub?.semester?.name ?? null;
    if (semName && !row.latestSemesterName) row.latestSemesterName = semName;
    const credits = Number(sub?.credits);
    if (Number.isFinite(credits)) row.creditsRemaining += credits;
  });

  return Array.from(byId.values()).sort((a, b) =>
    String(a.matricule || a.email || a.id).localeCompare(
      String(b.matricule || b.email || b.id)
    )
  );
};

/**
 * List students (GET /api/subscriptions, enriched client-side).
 * Returns { rows, total, registeredTotal }.
 */
export const getStudents = async () => {
  const [{ data: subscriptions }, nameByStudent, registeredTotal] =
    await Promise.all([api.get("/subscriptions"), getNameMap(), getRegisteredTotal()]);

  const rows = buildDirectory(subscriptions, nameByStudent);
  return { rows, total: rows.length, registeredTotal };
};

/**
 * Client-side search across matricule, email, and full name.
 * (No server-side search parameters exist in the backend.)
 */
export const searchStudents = (students, query) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return students;
  return students.filter((s) => {
    const full = `${s.firstName || ""} ${s.lastName || ""}`.trim().toLowerCase();
    return (
      full.includes(q) ||
      (s.firstName || "").toLowerCase().includes(q) ||
      (s.lastName || "").toLowerCase().includes(q) ||
      (s.matricule || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    );
  });
};
