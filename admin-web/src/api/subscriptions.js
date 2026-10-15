import api from "../lib/axios.js";

/**
 * Fetch a studentId -> { firstName, lastName } map for enriching records that
 * embed `student` WITHOUT the `user` relation (e.g. the subscriptions feed).
 *
 * `GET /api/subscriptions` uses `include: { student: true }`, so the embedded
 * student has NO name fields (names live on the related `User` model). The
 * names are recovered from `GET /api/meal-claims`, which DOES embed
 * `student.user`. Best-effort: if that call fails, an empty map is returned and
 * callers fall back to displaying "—" instead of fabricating a name.
 */
export const fetchStudentNameMap = async () => {
  const map = new Map();
  try {
    const { data } = await api.get("/meal-claims");
    (data || []).forEach((claim) => {
      const student = claim?.student;
      if (!student?.id || map.has(student.id)) return;
      const firstName = student.user?.firstName ?? null;
      const lastName = student.user?.lastName ?? null;
      if (firstName || lastName) map.set(student.id, { firstName, lastName });
    });
  } catch {
    /* best-effort enrichment only */
  }
  return map;
};

/** List subscriptions with embedded student / mealPlan / semester / payments */
export const getSubscriptions = async () => {
  const { data } = await api.get("/subscriptions");
  return data;
};
