import React, { useEffect, useState } from "react";
import { Search, CreditCard, ChevronRight } from "lucide-react";
import { getSubscriptions, fetchStudentNameMap } from "../api/subscriptions.js";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { formatCurrency, formatDate, formatDateTime } from "../lib/format.js";
import { getErrorMessage } from "../lib/error.js";

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [data, nameMap] = await Promise.all([
          getSubscriptions(),
          fetchStudentNameMap(),
        ]);
        if (!cancelled) {
          // The subscriptions feed embeds `student` without its `user`
          // relation, so names are merged in here from the claims feed.
          const merged = (data || []).map((sub) => {
            const resolved = sub?.student?.id ? nameMap.get(sub.student.id) : null;
            return resolved
              ? { ...sub, student: { ...sub.student, ...resolved } }
              : sub;
          });
          setSubscriptions(merged);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = subscriptions.filter((sub) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    const student = sub.student || {};
    const mealPlan = sub.mealPlan || {};
    const semester = sub.semester || {};
    return (
      student.firstName?.toLowerCase().includes(q) ||
      student.lastName?.toLowerCase().includes(q) ||
      student.matricule?.toLowerCase().includes(q) ||
      mealPlan.name?.toLowerCase().includes(q) ||
      semester.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-text">Subscriptions</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search by name, matricule, plan or semester…"
            aria-label="Search subscriptions by name, matricule, plan or semester"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading subscriptions…" />
      ) : error ? (
        <div className="mt-4">
          <p className="text-xs font-semibold text-error">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="info"
          title="No subscriptions"
          message="No subscriptions found. Students are enrolled once they purchase a meal plan."
        />
      ) : selectedId ? (
        <SubscriptionDetail
          subscription={subscriptions.find((s) => s.id === selectedId) || null}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surfaceAlt">
              <tr>
                <th className="px-4 py-3 font-semibold text-text">Student</th>
                <th className="px-4 py-3 font-semibold text-text">Meal plan</th>
                <th className="px-4 py-3 font-semibold text-text">Semester</th>
                <th className="px-4 py-3 font-semibold text-text">Credits</th>
                <th className="px-4 py-3 font-semibold text-text">Amount</th>
                <th className="px-4 py-3 font-semibold text-text">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => {
                const student = sub.student || {};
                const mealPlan = sub.mealPlan || {};
                const semester = sub.semester || {};
                const latestPayment = sub.payments && sub.payments.length
                  ? sub.payments.reduce((a, b) =>
                      new Date(String(a.createdAt)) > new Date(String(b.createdAt)) ? a : b
                    )
                  : null;
                return (
                  <tr
                    key={sub.id}
                    className="border-t border-border transition-colors hover:bg-border/50"
                    onClick={() => setSelectedId(sub.id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-text-muted">{student.matricule || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{mealPlan.name || "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{semester.name || "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{sub.credits || 0}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {formatCurrency(
                        (Number(mealPlan.pricePerCredit) || 0) * (Number(sub.credits) || 0),
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {latestPayment ? (
                        <StatusBadge variant={latestPayment.status} />
                      ) : (
                        <span className="text-xs text-text-muted">None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const PaymentRow = ({ payment }) => (
  <div className="flex items-center justify-between gap-4 py-3 border-t border-border">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surfaceAlt text-text-secondary">
        <CreditCard className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text">{payment.method || "Unknown"}</p>
        <p className="text-xs text-text-muted">{payment.reference || "No reference"}</p>
      </div>
    </div>
    <div className="text-right shrink-0">
      <p className="text-sm font-bold text-text">{formatCurrency(payment.amount, "—")}</p>
      <p className="text-xs text-text-muted">{formatDateTime(payment.createdAt)}</p>
    </div>
  </div>
);

const SubscriptionDetail = ({ subscription, onBack }) => {
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!subscription) return;
    setDetailLoading(true);
    const t = setTimeout(() => setDetailLoading(false), 250);
    return () => clearTimeout(t);
  }, [subscription?.id]);

  if (!subscription) {
    return (
      <div className="mt-4">
        <EmptyState
          icon="info"
          title="No subscription selected"
          message="Select a subscription to view its details."
        />
      </div>
    );
  }

  const student = subscription.student || {};
  const mealPlan = subscription.mealPlan || {};
  const semester = subscription.semester || {};
  const payments = subscription.payments || [];
  const totalCredits = Number(subscription.credits || 0);
  const totalAmount = formatCurrency(
    (Number(mealPlan.pricePerCredit) || 0) * totalCredits,
    "—"
  );

  return (
    <div className="mt-4 rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onBack} className="!p-0">
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
          <h2 className="text-lg font-bold text-text">{mealPlan.name || "—"}</h2>
        </div>
        {/* The Subscription model has NO status field, so we show the real
            payment status (PENDING/VERIFIED/REJECTED) instead of inventing one. */}
        {payments[0]?.status ? (
          <span className="flex items-center gap-2 text-xs text-text-secondary">
            Payment
            <StatusBadge variant={payments[0].status} />
          </span>
        ) : (
          <span className="text-xs text-text-muted">No payment record</span>
        )}
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-surfaceAlt p-3">
          <p className="text-xs font-semibold text-text-muted">Student</p>
          <p className="text-sm font-semibold text-text">{student.firstName} {student.lastName}</p>
          <p className="text-xs text-text-muted">{student.matricule || "—"}</p>
        </div>
        <div className="rounded-lg border border-border bg-surfaceAlt p-3">
          <p className="text-xs font-semibold text-text-muted">Meal plan</p>
          <p className="text-sm font-semibold text-text">{mealPlan.name || "—"}</p>
          <p className="text-xs text-text-muted">{mealPlan.description || "No description"}</p>
        </div>
        <div className="rounded-lg border border-border bg-surfaceAlt p-3">
          <p className="text-xs font-semibold text-text-muted">Semester</p>
          <p className="text-sm font-semibold text-text">{semester.name || "—"}</p>
          <p className="text-xs text-text-muted">{formatDate(semester.startDate)}</p>
        </div>
        <div className="rounded-lg border border-border bg-surfaceAlt p-3">
          <p className="text-xs font-semibold text-text-muted">Credits</p>
          <p className="text-2xl font-bold text-text">{totalCredits}</p>
          <p className="text-xs text-text-muted">{totalAmount}</p>
        </div>
      </div>

      <div className="px-4 py-3">
        <h3 className="text-sm font-extrabold text-text mb-3">Payments</h3>
        {detailLoading ? (
          <div className="space-y-2">
            <div className="h-10 w-full animate-pulse rounded bg-border" />
          </div>
        ) : payments.length === 0 ? (
          <p className="text-sm text-text-muted">No payment records on this subscription.</p>
        ) : (
          <div className="space-y-0">
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;

