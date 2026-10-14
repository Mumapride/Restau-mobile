import React, { useEffect, useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";
import { User, CreditCard, Banknote, Receipt, Users, ArrowUpRight } from "lucide-react";
import { getReportsSummary, getDailyReport } from "../api/reports.js";
import EmptyState from "../components/EmptyState.jsx";
import { formatCurrency, formatNumber, formatDateTime } from "../lib/format.js";
import { getErrorMessage } from "../lib/error.js";

const PIE_COLORS = ["#059669", "#047857", "#10B981", "#F59E0B", "#64748B", "#475569"];

// Full class names so Tailwind can detect them
const TONES = {
  primary: "bg-emerald-50 text-emerald-700",
  success: "bg-teal-50 text-teal-700",
  warning: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
};

const Card = ({ className = "", children }) => (
  <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const StatCard = ({ label, value, subtitle, icon: Icon, accent = "primary", to, loading }) => {
  const card = (
    <Card
      className={`group h-full p-4 ${
        to ? "transition-all duration-150 hover:border-slate-300 hover:shadow-md" : ""
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TONES[accent] || TONES.primary}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-1.5 h-6 w-20 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="truncate text-xl font-semibold leading-tight tracking-tight text-slate-900 tabular-nums">{value}</p>
          )}
          {subtitle && <p className="mt-0.5 truncate text-[11px] text-slate-400">{subtitle}</p>}
        </div>
        {to && (
          <ArrowUpRight
            className="h-4 w-4 shrink-0 self-start text-slate-300 transition-colors group-hover:text-emerald-600"
            aria-hidden="true"
          />
        )}
      </div>
    </Card>
  );
  if (!to) return card;
  return (
    <Link
      to={to}
      className="block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
      aria-label={`${label} — view details`}
    >
      {card}
    </Link>
  );
};

const DoughnutChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex h-[200px] items-center gap-8">
        <div className="mx-auto h-40 w-40 animate-pulse rounded-full bg-slate-100" />
        <div className="hidden flex-1 space-y-3 md:block">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-3.5 w-full animate-pulse rounded bg-slate-100" />)}
        </div>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60">
        <EmptyState
          icon="info"
          title="No meal data"
          message="No meal claims have been recorded yet."
        />
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-5 md:flex-row md:gap-10">
      <div className="relative h-[190px] w-[190px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={3}
              cornerRadius={5}
              dataKey="value"
              nameKey="name"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} meals`, ""]}
              contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", boxShadow: "0 8px 24px rgba(15,23,42,0.08)", fontSize: 12 }}
              cursor={{
                stroke: "#E1E8E4",
                strokeDasharray: "3 3",
                strokeWidth: 1,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{formatNumber(total)}</span>
          <span className="text-[11px] font-medium text-slate-500">Meals today</span>
        </div>
      </div>

      <ul className="w-full flex-1 space-y-2.5">
        {data.slice(0, 6).map((d, i) => {
          const pct = total ? Math.round((d.value / total) * 100) : 0;
          return (
            <li key={d.name}>
              <div className="flex items-center justify-between gap-3 text-[13px]">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="truncate font-medium text-slate-700">{d.name}</span>
                </span>
                <span className="shrink-0 text-slate-500 tabular-nums">
                  <span className="font-semibold text-slate-900">{d.value}</span> · {pct}%
                </span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const RecentClaimsTable = ({ claims, loading }) => {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="h-10 w-full animate-pulse bg-slate-100" />
        <div className="space-y-3 p-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </Card>
    );
  }

  if (!claims || claims.length === 0) {
    return (
      <Card className="p-5">
        <EmptyState
          icon="info"
          title="No claims yet"
          message="Meal claims will appear here once students check in."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Student</th>
              <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Meal</th>
              <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Date &amp; time</th>
              <th className="px-4 py-2.5 text-xs font-medium text-slate-500">Semester</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {claims.slice(0, 6).map((claim) => {
              const first = claim.student?.user?.firstName || "Unknown";
              const last = claim.student?.user?.lastName || "User";
              return (
                <tr key={claim.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                        {first.charAt(0)}{last.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{first} {last}</p>
                        <p className="text-[11px] text-slate-400">{claim.student?.matricule || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {claim.menuItem || "Unknown"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 tabular-nums">{formatDateTime(claim.claimDate)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{claim.semester?.name || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const GlanceRow = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 ring-1 ring-inset ring-white/10">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
    </div>
    <div className="min-w-0">
      <p className="truncate text-lg font-semibold leading-tight tracking-tight text-white tabular-nums">{value}</p>
      <p className="text-[11px] font-medium text-emerald-100/80">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [summaryRes, dailyRes] = await Promise.all([
          getReportsSummary(),
          getDailyReport(),
        ]);
        if (!cancelled) {
          setSummary(summaryRes);
          setDaily(dailyRes);
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

  const mealItemData = useMemo(() => {
    if (!daily?.mealsByMenuItem) return [];
    return Object.entries(daily.mealsByMenuItem)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [daily]);

  const stats = [
    {
      label: "Registered students",
      value: summary ? formatNumber(summary.totalStudents) : "-",
      subtitle: "All enrolled students",
      icon: User,
      accent: "primary",
      to: "/students",
    },
    {
      label: "Active subscriptions",
      value: summary ? formatNumber(summary.totalSubscriptions) : "-",
      subtitle: "Currently enrolled",
      icon: CreditCard,
      accent: "success",
      to: "/subscriptions",
    },
    {
      label: "Verified revenue",
      value: summary ? formatCurrency(summary.totalRevenue) : "-",
      subtitle: "Confirmed payments (FCFA)",
      icon: Banknote,
      accent: "warning",
      to: "/payments",
    },
    {
      label: "Meal claims",
      value: summary ? formatNumber(summary.totalMealsClaimed) : "-",
      subtitle: `${summary?.today?.mealsClaimed ?? 0} claimed today`,
      icon: Receipt,
      accent: "error",
      to: "/meal-claims",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Real-time summary of your cafeteria operations.
        </p>
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 sm:self-auto">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          {daily?.date ? formatDateTime(daily.date, "") : "Loading..."}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* KPI cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      {/* Chart + today */}
      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Meals claimed today</h2>
              <p className="mt-0.5 text-xs text-slate-500">Breakdown by menu item</p>
            </div>
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 tabular-nums">
              {daily ? formatNumber(daily.totalMealsClaimed) : "-"} total
            </span>
          </div>
          <div className="mt-5">
            <DoughnutChart data={mealItemData} loading={loading} />
          </div>
        </Card>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-5 shadow-sm">
          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/10" />
          <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/5" />

          <div className="relative">
            <h2 className="text-sm font-semibold text-white">Today at a glance</h2>
            <p className="mt-0.5 text-xs text-emerald-100/70">
              {daily?.date ? formatDateTime(daily.date, "") : "Loading..."}
            </p>

            <div className="mt-5 space-y-2.5">
              <GlanceRow icon={Users} value={daily ? formatNumber(daily.studentsServed) : "-"} label="Students served" />
              <GlanceRow icon={Receipt} value={daily ? formatNumber(daily.totalMealsClaimed) : "-"} label="Meals claimed" />
              {summary && (
                <GlanceRow icon={Banknote} value={formatNumber(summary.totalCreditsPurchased)} label="Credits purchased" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent claims */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recent meal claims</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {summary?.today?.mealsClaimed ?? 0} claims today
            </p>
          </div>
          <Link
            to="/meal-claims"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            View all
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <RecentClaimsTable claims={daily?.claims || []} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;