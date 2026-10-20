import React, { useEffect, useState } from "react";
import { Search, CreditCard, ChevronLeft } from "lucide-react";
import { getSubscriptions, fetchStudentNameMap } from "../api/subscriptions.js";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Input from "../components/Input.jsx";
import { formatCurrency, formatDate, formatDateTime } from "../lib/format.js";
import { getErrorMessage } from "../lib/error.js";

const BTN_SM =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition h-8 px-3 text-xs border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

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
        const [data, nameMap] = await Promise.all([getSubscriptions(), fetchStudentNameMap()]);
        if (!cancelled) {
          // The subscriptions feed embeds `student` without its `user` relation,
          // so names are merged in here from the claims feed.
          const merged = (data || []).map((sub) => {
            const resolved = sub?.student?.id ? nameMap.get(sub.student.id) : null;
            return resolved ? { ...sub, student: { ...sub.student, ...resolved } } : sub;
          });
          setSubscriptions(merged);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
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
    <div className="mx-auto w-full max-w-7xl space-y-4">
      {/* Header + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Subscriptions</h1>
          {!loading && (
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 tabular-nums sm:self-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {filtered.length} of {subscriptions.length} shown
            </span>
          )}
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-6">
          <EmptyState
            icon="info"
            title="No subscriptions"
            message="No subscriptions found. Students are enrolled once they purchase a meal plan."
          />
        </div>
      ) : selectedId ? (
        <SubscriptionDetail
          subscription={subscriptions.find((s) => s.id === selectedId) || null}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Student</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Meal plan</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Semester</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Credits</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Amount</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => {
                  const student = sub.student || {};
                  const mealPlan = sub.mealPlan || {};
                  const semester = sub.semester || {};
                  const latestPayment =
                    sub.payments && sub.payments.length
                      ? sub.payments.reduce((a, b) =>
                          new Date(String(a.createdAt)) > new Date(String(b.createdAt)) ? a : b
                        )
                      : null;
                  return (
                    <tr
                      key={sub.id}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                      onClick={() => setSelectedId(sub.id)}
                    >
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-slate-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400">{student.matricule || ""}</p>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{mealPlan.name || "—"}</td>
                      <td className="px-4 py-2.5 text-slate-600">{semester.name || "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 tabular-nums">
                          {sub.credits || 0}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 tabular-nums">
                        {formatCurrency((Number(mealPlan.pricePerCredit) || 0) * (Number(sub.credits) || 0), "—")}
                      </td>
                      <td className="px-4 py-2.5">
                        {latestPayment ? (
                          <StatusBadge variant={latestPayment.status} />
                        ) : (
                          <span className="text-xs text-slate-400">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentRow = ({ payment }) => (
  <div className="flex items-center justify-between gap-4 border-t border-slate-100 py-3">
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <CreditCard className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{payment.method || "Unknown"}</p>
        <p className="text-xs text-slate-400">{payment.reference || "No reference"}</p>
      </div>
    </div>
    <div className="shrink-0 text-right">
      <p className="text-sm font-semibold text-slate-900 tabular-nums">{formatCurrency(payment.amount, "—")}</p>
      <p className="text-xs text-slate-400 tabular-nums">{formatDateTime(payment.createdAt)}</p>
    </div>
  </div>
);

const SubscriptionDetail = ({ subscription, onBack }) => {
  if (!subscription) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-6">
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
  const totalAmount = formatCurrency((Number(mealPlan.pricePerCredit) || 0) * totalCredits, "—");

  const tile = "rounded-lg border border-slate-100 bg-slate-50/70 p-3.5";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className={BTN_SM} aria-label="Back to subscriptions">
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back
          </button>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{mealPlan.name || "—"}</h2>
        </div>
        {/* The Subscription model has no status field, so the real payment status is shown instead. */}
        {payments[0]?.status ? (
          <span className="flex items-center gap-2 text-xs text-slate-500">
            Payment
            <StatusBadge variant={payments[0].status} />
          </span>
        ) : (
          <span className="text-xs text-slate-400">No payment record</span>
        )}
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className={tile}>
          <p className="text-xs font-medium text-slate-500">Student</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {student.firstName} {student.lastName}
          </p>
          <p className="text-xs text-slate-400">{student.matricule || "—"}</p>
        </div>
        <div className={tile}>
          <p className="text-xs font-medium text-slate-500">Meal plan</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">{mealPlan.name || "—"}</p>
          <p className="text-xs text-slate-400">{mealPlan.description || "No description"}</p>
        </div>
        <div className={tile}>
          <p className="text-xs font-medium text-slate-500">Semester</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">{semester.name || "—"}</p>
          <p className="text-xs text-slate-400">{formatDate(semester.startDate)}</p>
        </div>
        <div className={tile}>
          <p className="text-xs font-medium text-slate-500">Credits</p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{totalCredits}</p>
          <p className="text-xs text-slate-400 tabular-nums">{totalAmount}</p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Payments</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-500">No payment records on this subscription.</p>
        ) : (
          <div>
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