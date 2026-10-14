import React, { useEffect, useState } from "react";
import { Search, User, BookOpen, CreditCard, Info } from "lucide-react";
import { getStudents, searchStudents } from "../api/students.js";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Input from "../components/Input.jsx";
import { getErrorMessage } from "../lib/error.js";

const Students = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [registeredTotal, setRegisteredTotal] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getStudents();
        if (!cancelled) {
          setRows(data.rows || []);
          setRegisteredTotal(
            typeof data.registeredTotal === "number" ? data.registeredTotal : null
          );
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

  const filtered = searchStudents(rows, query);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      {/* Header + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Students</h1>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 tabular-nums sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {loading
              ? "Loading…"
              : `${filtered.length}${
                  registeredTotal !== null ? ` of ${registeredTotal}` : ""
                } shown`}
          </span>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, matricule or email…"
            aria-label="Search students by name, matricule or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Info className="h-3.5 w-3.5" strokeWidth={2.25} />
        </div>
        <p className="text-xs leading-relaxed text-slate-600">
          The backend exposes no dedicated student-listing endpoint. Records are
          assembled from the subscriptions feed, with names resolved from the
          meal-claims feed. Students with neither a subscription nor a claim
          cannot be surfaced by the API, so this list may be a subset of all
          registered students.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading students…" />
      ) : error ? (
        <ErrorState title="Unable to load students" message={error} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-6">
          <EmptyState
            icon="info"
            title="No students found"
            message={query ? "Try a different search term." : "No students are enrolled yet."}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Student</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Matricule</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Email</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Meal plan</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Subscriptions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const hasName = Boolean(s.firstName || s.lastName);
                  const initials = hasName
                    ? `${(s.firstName || "").charAt(0)}${(s.lastName || "").charAt(0)}`.toUpperCase()
                    : "";
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                            {initials || <User className="h-4 w-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {hasName
                                ? `${s.firstName || ""} ${s.lastName || ""}`.trim()
                                : <span className="text-slate-400">—</span>}
                            </p>
                            <p className="truncate text-[11px] text-slate-400">
                              {s.matricule || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        {s.matricule ? (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 tabular-nums">
                            {s.matricule}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600">{s.email || "—"}</td>
                      <td className="px-4 py-2.5">
                        {s.latestPlanName ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                            <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                            {s.latestPlanName}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        {s.latestSemesterName && (
                          <p className="mt-0.5 text-[11px] text-slate-400">{s.latestSemesterName}</p>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 tabular-nums">
                          <CreditCard className="h-3.5 w-3.5 text-slate-500" />
                          {s.subscriptionCount}
                        </span>
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

export default Students;