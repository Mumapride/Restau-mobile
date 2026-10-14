import React, { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { getPayments, searchPayments } from "../api/payments.js";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Input from "../components/Input.jsx";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "../lib/format.js";
import { getErrorMessage } from "../lib/error.js";

const PAYMENT_STATUSES = ["VERIFIED", "PENDING", "REJECTED"];

// Readable labels for the backend's PayMethod enum.
const METHOD_LABELS = {
  MTN_MOMO: "MTN MoMo",
  ORANGE_MONEY: "Orange Money",
};

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

  const searched = searchPayments(rows, query);
  const filtered = statusFilter
    ? searched.filter((p) => p.status === statusFilter)
    : searched;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="text-xl font-semibold text-text">Payments</h1>
          <span className="text-xs text-text-secondary">
            {loading
              ? "Loading…"
              : `${filtered.length} of ${formatNumber(rows.length)} records`}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search name, matricule, method…"
              aria-label="Search payments by name, matricule or method"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by payment status"
              className="w-full appearance-none rounded-lg border border-border bg-white py-2 pl-9 pr-8 text-sm text-text focus:border-primary focus:ring-2 focus:ring-primary/20 transition sm:w-auto"
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

      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <p className="text-xs text-text-secondary">
          The backend exposes no dedicated <code>/api/payments</code> endpoint
          (the payments module is empty and unmounted). Payments are recorded
          automatically by the subscription workflow and are derived here from
          the subscriptions payload. Status is shown exactly as stored
          (VERIFIED / PENDING / REJECTED) — a VERIFIED status set by the
          backend&apos;s simulated payment flow is <strong>not</strong> proof of a
          real financial transaction.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading payments…" />
      ) : error ? (
        <ErrorState title="Unable to load payments" message={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="info"
          title={rows.length === 0 ? "No payments" : "No matching payments"}
          message={
            rows.length === 0
              ? "Payments appear here once subscriptions are created."
              : "No payments match the current search or status filter."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surfaceAlt">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary">Student</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary">Amount</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary">Method</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary">Reference</th>
                <th className="px-4 py-3 text-xs font-medium text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border transition-colors hover:bg-border/50"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-text">
                      {p.student?.firstName || p.student?.lastName
                        ? `${p.student?.firstName || ""} ${
                            p.student?.lastName || ""
                          }`.trim()
                        : <span className="text-text-muted">—</span>}
                    </p>
                    <p className="text-xs text-text-muted">
                      {p.student?.matricule || ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {formatCurrency(p.amount, "—")}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {METHOD_LABELS[p.method] || p.method || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={p.status} />
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{p.reference || "—"}</td>
                  <td className="px-4 py-3 text-text-secondary">{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
