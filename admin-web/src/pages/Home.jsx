import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  ArrowRight,
  BookOpen,
  Users,
  Banknote,
  BarChart3,
  CheckCircle2,
  CreditCard,
  UtensilsCrossed,
} from "lucide-react";
import { isAuthenticated } from "../lib/auth.js";
import LOGO from "../assets/brand/restau-logo.png";

const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "About", href: "#about" },
];

// Static, illustrative figures for the decorative dashboard preview.
// These are NOT loaded from the API and must never be read as live data.
const SAMPLE_STATS = [
  { icon: Users, label: "Active subscriptions", value: "1,248" },
  { icon: UtensilsCrossed, label: "Meals claimed (today)", value: "312" },
  { icon: Banknote, label: "Revenue (this week)", value: "4,860,000 FCFA" },
  { icon: BookOpen, label: "Active meal plans", value: "6" },
];

const SAMPLE_PLANS = [
  { name: "Standard Week", detail: "12 credits · 7 days", price: "18,000 FCFA" },
  { name: "Premium Month", detail: "40 credits · 30 days", price: "55,000 FCFA" },
  { name: "Weekend Pass", detail: "6 credits · Sat–Sun", price: "9,500 FCFA" },
];

const SAMPLE_PAYMENTS = [
  { student: "Aminata K.", plan: "Standard Week", amount: "18,000 FCFA", status: "Paid" },
  { student: "Kwame O.", plan: "Premium Month", amount: "55,000 FCFA", status: "Paid" },
  { student: "Fatou D.", plan: "Weekend Pass", amount: "9,500 FCFA", status: "Pending" },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Meal Plans",
    text: "Create flexible meal plans with credits, durations and pricing that fit your campus schedule.",
  },
  {
    icon: Users,
    title: "Student Management",
    text: "Keep student records, subscriptions and meal credits organised in one secure place.",
  },
  {
    icon: Banknote,
    title: "Payments",
    text: "Track MTN Mobile Money and Orange Money payments with clear, reconciled summaries.",
  },
  {
    icon: BarChart3,
    title: "Dashboard & Reports",
    text: "Monitor subscriptions, meal claims and revenue with real-time dashboards and reports.",
  },
];

const EYEBROW = "text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700";
const BTN_PRIMARY =
  "inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const BTN_OUTLINE =
  "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

const Wordmark = ({ className = "" }) => (
  <span className={`font-extrabold tracking-tight ${className}`}>
    <span className="text-slate-900">RESTAU</span>
    <span className="text-emerald-600">Admin</span>
  </span>
);

const StatusPill = ({ status }) => {
  const styles =
    status === "Paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles}`}>{status}</span>
  );
};

/** Decorative, fully static preview of the admin dashboard. Makes no API calls. */
const DashboardPreview = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg" aria-hidden="true">
    {/* Window chrome */}
    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      <span className="ml-2 truncate text-xs font-medium text-slate-500">RESTAU Admin — Overview</span>
      <span className="ml-auto rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
        Sample data
      </span>
    </div>

    <div className="space-y-4 p-4">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        {SAMPLE_STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <p className="truncate text-[11px] font-medium text-slate-500">{label}</p>
            </div>
            <p className="mt-2 truncate text-base font-semibold tracking-tight text-slate-900 tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Meal plans */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Meal plans</p>
        <ul className="mt-2 divide-y divide-slate-100">
          {SAMPLE_PLANS.map((plan) => (
            <li key={plan.name} className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900">{plan.name}</p>
                <p className="truncate text-[11px] text-slate-500">{plan.detail}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-emerald-700 tabular-nums">{plan.price}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent payments */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Recent payments</p>
        <ul className="mt-2 divide-y divide-slate-100">
          {SAMPLE_PAYMENTS.map((payment) => (
            <li
              key={payment.student}
              className="flex items-center justify-between gap-2 py-2 text-xs first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{payment.student}</p>
                <p className="truncate text-[11px] text-slate-500">{payment.plan}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-semibold text-slate-900 tabular-nums">{payment.amount}</span>
                <StatusPill status={payment.status} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const authed = isAuthenticated();

  useEffect(() => {
    const previous = document.title;
    document.title = "RESTAU — University Meal Management";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
  <img src={LOGO} alt="RESTAU logo" className="h-14 w-14 object-contain" />
  <div>
    <Wordmark className="text-lg" />
    <p className="text-xs text-slate-500">Your campus meals, made simple</p>
  </div>
</div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to={authed ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              {authed ? "Go to Dashboard" : "Admin Login"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden" aria-label="Mobile">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={EYEBROW}>University Meal Management</p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]">
                Smarter Meal Management.{" "}
                <span className="text-emerald-600">Simpler Campus Dining.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600">
                RESTAU Management System helps university administrators manage meal plans, weekly menus,
                student subscriptions and mobile-money payments, so your cafeteria team spends less time on
                paperwork and more time serving students.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/dashboard" className={BTN_PRIMARY}>
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a href="#features" className={BTN_OUTLINE}>
                  Explore Features
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {["Meal plans & credits", "Weekly menus", "Payments & reports"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <DashboardPreview />
              <p className="mt-3 text-center text-xs text-slate-400">
                Illustrative preview. Sample figures, not live data.
              </p>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────── */}
        <section id="features" className="border-t border-slate-200 bg-white py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className={EYEBROW}>Features</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Everything your cafeteria needs
              </h2>
              <p className="mt-3 text-base text-slate-600">
                A focused toolset for managing campus dining from one console.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── About ────────────────────────────────────────── */}
        <section id="about" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={EYEBROW}>About</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Built for university cafeteria operations
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                RESTAU Management System simplifies university cafeteria operations by bringing meal plans,
                student subscriptions, weekly menus and payments into a single, easy-to-use platform.
                Administrators get a clear overview of daily claims and revenue, while students enjoy a
                faster, fairer dining experience on campus.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "One console for the whole cafeteria",
                  "Mobile-money friendly payments",
                  "Clear daily claims and revenue views",
                  "Student-first meal credits",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
                  <img src={LOGO} alt="" className="h-7 w-7 object-contain" aria-hidden="true" />
                </span>
                <div>
                  <Wordmark className="text-lg" />
                  <p className="text-xs text-slate-500">Your campus meals, made simple</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-slate-600">
                From planning the weekly menu to reconciling payments at the end of the day, RESTAU Management
                System keeps administrators, cafeteria staff and students in sync, with role-based access so
                only authorised administrators can manage sensitive data.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <CreditCard className="h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
                <p className="text-sm font-semibold text-emerald-800">
                  Meal plans, subscriptions and payments, together at last.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
  <img src={LOGO} alt="RESTAU logo" className="h-12 w-12 object-contain" />
  <div>
    <Wordmark className="text-base" />
    <p className="mt-0.5 max-w-sm text-sm text-slate-600">
      University meal management platform for meal plans, student subscriptions, weekly menus and payments.
    </p>
  </div>
</div>
            <nav className="flex items-center gap-5" aria-label="Footer">
              <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                Features
              </a>
              <a href="#about" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                About
              </a>
              <Link to="/login" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Admin Login
              </Link>
            </nav>
          </div>
          <p className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-400">
            © {new Date().getFullYear()} RESTAU MOBILE. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;