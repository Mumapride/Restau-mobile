import api from "../lib/axios.js";
import { fetchStudentNameMap } from "./subscriptions.js";

/**
 * Payments data source.
 *
 * IMPORTANT (documented limitation): the RESTAU backend has an EMPTY payments
 * module (payments.{routes,controller,service}.js are all 0 bytes and are NOT
 * mounted in app.js), so there is NO dedicated `/api/payments` endpoint. A call
 * to it would 404.
 *
 * Payments are recorded automatically by the subscription workflow (the backend
 * creates a Payment row on subscription creation and hardcodes its status to
 * VERIFIED — a simulated payment). They are only reachable via the
 * subscriptions payload (`subscription.payments`), so we derive the payment
 * list safely from `GET /api/subscriptions`.
 *
 * Two honest caveats surfaced in the UI, never fabricated here:
 *  - `subscription.student` is embedded WITHOUT its `user` relation, so the
 *    student has no firstName/lastName. We recover real names from
 *    `GET /api/meal-claims` (best-effort) via fetchStudentNameMap().
 *  - A VERIFIED status written by the simulated backend is NOT proof of a real
 *    financial transaction. Status is always rendered exactly as stored.
 */

/** Flatten every payment from every subscription into one list. */
const flattenPayments = (subscriptions, nameMap) => {
  const rows = [];
  (subscriptions || []).forEach((subscription) => {
    const raw = subscription?.student;
    const resolved = raw?.id ? nameMap?.get(raw.id) : null;
    const student = resolved ? { ...raw, ...resolved } : raw;
    (subscription?.payments || []).forEach((payment) => {
      rows.push({
        id: payment?.id,
        subscriptionId: subscription?.id,
        studentId: subscription?.studentId,
        amount:
          typeof payment?.amount === "string"
            ? Number(payment.amount)
            : payment?.amount,
        method: payment?.method,
        status: payment?.status,
        reference: payment?.reference,
        createdAt: payment?.createdAt,
        student,
      });
    });
  });
  return rows.sort((a, b) =>
    String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
  );
};

/** List payment records derived from subscriptions (GET /api/subscriptions). */
export const getPayments = async () => {
  const [subsRes, nameMap] = await Promise.all([
    api.get("/subscriptions"),
    fetchStudentNameMap(),
  ]);
  const rows = flattenPayments(subsRes.data, nameMap);
  return { rows, total: rows.length };
};

/** Client-side search by student name, matricule, method, or reference. */
export const searchPayments = (payments, query) => {
  const q = (query || "").trim().toLowerCase();
  if (!q) return payments;
  return payments.filter(
    (p) =>
      p.student?.firstName?.toLowerCase().includes(q) ||
      p.student?.lastName?.toLowerCase().includes(q) ||
      String(p.student?.matricule || "").toLowerCase().includes(q) ||
      String(p.method || "").toLowerCase().includes(q) ||
      String(p.reference || "").toLowerCase().includes(q)
  );
};
