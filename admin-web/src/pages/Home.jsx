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

const Wordmark = ({ className = "" }) => (
  <span className={`font-extrabold tracking-tight ${className}`}>
    <span className="text-text">RESTAU</span>
    <span className="text-primary">Admin</span>
  </span>
);

const StatusPill = ({ status }) => {
  const styles =
    status === "Paid"
      ? "bg-primary-light text-primary-dark"
      : "bg-amber-50 text-amber-700";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${styles}`}>
      {status}
    </span>
  );
};


/** Decorative, fully static preview of the admin dashboard. Makes no API calls. */
const DashboardPreview = () => (
  <div className="rounded-2xl border border-border bg-white shadow-lg" aria-hidden="true">
    {/* Preview window chrome */}
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      <span className="ml-2 truncate text-xs font-medium text-text-muted">
        RESTAU Admin — Overview
      </span>
      <span className="ml-auto rounded-full bg-surfaceAlt px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
        Sample data
      </span>
    </div>

    <div className="space-y-4 p-4">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        {SAMPLE_STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <p className="truncate text-[11px] font-medium text-text-muted">{label}</p>
            </div>
            <p className="mt-2 truncate text-base font-bold tracking-tight text-text tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Meal plans */}
      <div className="rounded-xl border border-border bg-surface p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Meal plans
        </p>
        <ul className="mt-2 space-y-2">
          {SAMPLE_PLANS.map((plan) => (
            <li key={plan.name} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-text">{plan.name}</p>
                <p className="truncate text-[11px] text-text-muted">{plan.detail}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-primary-dark tabular-nums">
                {plan.price}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Payment summaries */}
      <div className="rounded-xl border border-border bg-surface p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          Recent payments
        </p>
        <ul className="mt-2 space-y-2">
          {SAMPLE_PAYMENTS.map((payment) => (
            <li
              key={payment.student}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-text">{payment.student}</p>
                <p className="truncate text-[11px] text-text-muted">{payment.plan}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-semibold text-text tabular-nums">{payment.amount}</span>
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
    <div id="top" className="min-h-screen bg-background text-text">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <img src={LOGO} alt="RESTAU logo" className="h-8 w-8 object-contain" />
            <Wordmark className="text-lg" />
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surfaceAlt hover:text-text"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {authed ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Admin Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <button
              type="button"
              className="rounded-lg p-2 text-text-secondary hover:bg-surfaceAlt md:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav
            className="border-t border-border bg-white px-4 py-3 md:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surfaceAlt hover:text-text"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main>
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 md:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                University Meal Management
              </p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-4xl lg:text-[2.75rem]">
                Smarter Meal Management. Simpler Campus Dining.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary">
                RESTAU Management System helps university administrators manage meal plans, weekly
                menus, student subscriptions and mobile-money payments — so your cafeteria
                team spends less time on paperwork and more time serving students.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark"
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-3 text-sm font-semibold text-text transition-colors hover:bg-surfaceAlt"
                >
                  Explore Features
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {["Meal plans & credits", "Weekly menus", "Payments & reports"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className="lg:pl-4">
              <DashboardPreview />
              <p className="mt-3 text-center text-xs text-text-muted">
                Illustrative preview — sample figures, not live data.
              </p>
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section id="features" className="border-t border-border bg-white py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Features
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
                Everything your cafeteria needs
              </h2>
              <p className="mt-3 text-base text-text-secondary">
                A focused toolset for managing campus dining from one console.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-text">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ── About ────────────────────────────────────────────── */}
        <section id="about" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                About
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-text sm:text-3xl">
                Built for university cafeteria operations
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">
                RESTAU Management System simplifies university cafeteria operations by bringing meal
                plans, student subscriptions, weekly menus and payments into a single,
                easy-to-use platform. Administrators get a clear overview of daily claims
                and revenue, while students enjoy a faster, fairer dining experience on
                campus.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "One console for the whole cafeteria",
                  "Mobile-money friendly payments",
                  "Clear daily claims and revenue views",
                  "Student-first meal credits",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 text-sm text-text-secondary"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <img
                  src={LOGO}
                  alt=""
                  className="h-10 w-10 object-contain"
                  aria-hidden="true"
                />
                <div>
                  <Wordmark className="text-lg" />
                  <p className="text-xs text-text-muted">Your Campus Meals, Made Simple</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-text-secondary">
                From planning the weekly menu to reconciling payments at the end of the
                day, RESTAU Management System keeps administrators, cafeteria staff and students in
                sync — with role-based access so only authorised administrators can manage
                sensitive data.
              </p>
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-primary-light px-4 py-3">
                <CreditCard className="h-5 w-5 shrink-0 text-primary-dark" />
                <p className="text-sm font-semibold text-primary-dark">
                  Meal plans, subscriptions and payments — together at last.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <img
                src={LOGO}
                alt="RESTAU MOBILE logo"
                className="h-9 w-9 object-contain"
              />
              <div>
                <Wordmark className="text-base" />
                <p className="mt-0.5 max-w-sm text-sm text-text-secondary">
                  University meal management platform for meal plans, student
                  subscriptions, weekly menus and payments.
                </p>
              </div>
            </div>
            <nav className="flex items-center gap-4" aria-label="Footer">
              <a
                href="#features"
                className="text-sm font-semibold text-text-secondary hover:text-text"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-sm font-semibold text-text-secondary hover:text-text"
              >
                About
              </a>
              <Link
                to="/login"
                className="text-sm font-semibold text-primary hover:text-primary-dark"
              >
                Admin Login
              </Link>
            </nav>
          </div>
          <p className="mt-8 border-t border-border pt-6 text-xs text-text-muted">
            © {new Date().getFullYear()} RESTAU MOBILE. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;


