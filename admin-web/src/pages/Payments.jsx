import React, { useEffect, useState } from "react";
import { Search, Filter, Info } from "lucide-react";
import { getPayments, searchPayments } from "../api/payments.js";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Input from "../components/Input.jsx";
import { formatCurrency, formatDateTime, formatNumber } from "../lib/format.js";
import { getErrorMessage } from "../lib/error.js";

const PAYMENT_STATUSES = ["VERIFIED", "PENDING", "REJECTED"];

// Readable labels for the backend's PayMethod enum.
const METHOD_LABELS = {
  MTN_MOMO: "MTN MoMo",
  ORANGE_MONEY: "Orange Money",
};

const SELECT =
  "w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-900 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 sm:w-auto";

const Payments = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getPayments();
        if (!cancelled) {
          setRows(data.rows || []);
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

  const searched = searchPayments(rows, query);
  const filtered = statusFilter ? searched.filter((p) => p.status === statusFilter) : searched;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Payments</h1>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 tabular-nums sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {loading ? "Loading…" : `${formatNumber(filtered.length)} of ${formatNumber(rows.length)} records`}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search name, matricule, method…"
              aria-label="Search payments by name, matricule or method"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by payment status"
              className={SELECT}
            >
              <option value="">All statuses</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Info className="h-3.5 w-3.5" strokeWidth={2.25} />
        </div>
        <p className="text-xs leading-relaxed text-slate-600">
          The backend exposes no dedicated <code className="rounded bg-white px-1 font-mono">/api/payments</code> endpoint.
          Payments are recorded automatically by the subscription workflow and are derived here from the subscriptions
          payload. Status is shown exactly as stored (VERIFIED / PENDING / REJECTED). A VERIFIED status set by the
          backend&apos;s simulated payment flow is <strong className="font-semibold text-slate-800">not</strong> proof of a
          real financial transaction.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading payments…" />
      ) : error ? (
        <ErrorState title="Unable to load payments" message={error} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-6">
          <EmptyState
            icon="info"
            title={rows.length === 0 ? "No payments" : "No matching payments"}
            message={
              rows.length === 0
                ? "Payments appear here once subscriptions are created."
                : "No payments match the current search or status filter."
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Student</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Amount</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Method</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Status</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Reference</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const fullName = `${p.student?.firstName || ""} ${p.student?.lastName || ""}`.trim();
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-slate-900">
                          {fullName || <span className="text-slate-400">—</span>}
                        </p>
                        <p className="text-[11px] text-slate-400">{p.student?.matricule || ""}</p>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(p.amount, "—")}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{METHOD_LABELS[p.method] || p.method || "—"}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge variant={p.status} />
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                          {p.reference || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 tabular-nums">{formatDateTime(p.createdAt)}</td>
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

export default Payments;