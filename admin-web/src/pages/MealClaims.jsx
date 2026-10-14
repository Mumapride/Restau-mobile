import React, { useEffect, useState } from "react";
import { Search, Filter, Utensils, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { getMealClaims, getTodaysMealClaims } from "../api/mealClaims.js";
import LoadingState from "../components/LoadingState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import { formatDateTime, formatNumber, maskToken, toDateInputValue } from "../lib/format.js";
import { getErrorMessage } from "../lib/error.js";

const studentName = (claim) => {
  const user = claim?.student?.user || {};
  const first = user.firstName || "";
  const last = user.lastName || "";
  const full = `${first} ${last}`.trim();
  return full || "Unknown student";
};

const studentInitials = (claim) => {
  const user = claim?.student?.user || {};
  const initials = `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase();
  return initials || "?";
};

const MealClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [onlyToday, setOnlyToday] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = onlyToday
          ? await getTodaysMealClaims()
          : await getMealClaims();
        if (!cancelled) {
          setClaims(Array.isArray(data) ? data : []);
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
  }, [onlyToday, reloadKey]);

  const retry = () => {
    if (loading) return;
    setReloadKey((k) => k + 1);
  };

  const filtered = claims.filter((claim) => {
    const q = query.trim().toLowerCase();
    if (q) {
      const name = studentName(claim).toLowerCase();
      const matricule = String(claim?.student?.matricule || "").toLowerCase();
      const menu = String(claim?.menuItem || "").toLowerCase();
      if (
        !name.includes(q) &&
        !matricule.includes(q) &&
        !menu.includes(q)
      ) {
        return false;
      }
    }
    if (dateFrom) {
      const claimDateKey = toDateInputValue(claim.claimDate);
      if (!claimDateKey) return false;
      if (claimDateKey < dateFrom) return false;
    }
    if (dateTo) {
      const claimDateKey = toDateInputValue(claim.claimDate);
      if (!claimDateKey) return false;
      if (claimDateKey > dateTo) return false;
    }
    return true;
  });
  // Client-side pagination over the already-loaded list. The API returns the
  // full claim list; this only changes how many rows are visible per page and
  // does not reduce the number of records downloaded from the API.
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4">
      {/* Header + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Meal Claims</h1>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 tabular-nums sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {loading ? "Loading…" : `${formatNumber(filtered.length)} of ${formatNumber(claims.length)} shown`}
          </span>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search student, matricule or meal..."
            aria-label="Search meal claims by student, matricule or meal"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filters</span>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={onlyToday}
            onChange={(e) => {
              const checked = e.target.checked;
              setOnlyToday(checked);
              setPage(1);
              // When Today is active the backend already returns today's
              // claims, so clear any manual date range. Cleared values are
              // intentionally not restored when Today is switched off.
              if (checked) {
                setDateFrom("");
                setDateTo("");
              }
            }}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
          />
          Today only
        </label>
        <div className="flex items-center gap-2">
          <label htmlFor="meal-claims-date-from" className="text-xs font-medium text-slate-500">From</label>
          <Input
            id="meal-claims-date-from"
            type="date"
            value={dateFrom}
            max={toDateInputValue(new Date())}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="w-40"
            disabled={onlyToday}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="meal-claims-date-to" className="text-xs font-medium text-slate-500">To</label>
          <Input
            id="meal-claims-date-to"
            type="date"
            value={dateTo}
            max={toDateInputValue(new Date())}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="w-40"
            disabled={onlyToday}
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading meal claims..." />
      ) : error ? (
        <ErrorState
          title="Unable to load meal claims"
          message={error}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={retry}
              loading={loading}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-6">
          <EmptyState
            icon="info"
            title="No meal claims"
            message={
              query || dateFrom || dateTo || onlyToday
                ? "No claims match your filters."
                : "Meal claims will appear here as students claim meals."
            }
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Student</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Matricule</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Meal</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Semester</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Claimed at</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-slate-500">QR token</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((claim) => (
                  <tr key={claim.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                          {studentInitials(claim)}
                        </div>
                        <span className="truncate font-medium text-slate-900">
                          {studentName(claim)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {claim?.student?.matricule ? (
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 tabular-nums">
                          {claim.student.matricule}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                        <Utensils className="h-3.5 w-3.5 text-emerald-600" />
                        {claim?.menuItem || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {claim?.semester?.name || "-"}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 tabular-nums">
                      {formatDateTime(claim.claimDate)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                        {maskToken(claim?.qrToken?.token, 4)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <label htmlFor="meal-claims-page-size" className="font-medium">Rows per page</label>
              <select
                id="meal-claims-page-size"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white py-1.5 pl-2.5 pr-7 text-sm text-slate-900 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealClaims;