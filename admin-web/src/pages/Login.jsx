import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Sparkle, Shield, Clock } from "lucide-react";
import { loginAdmin } from "../api/auth.js";
import { isAdminUser } from "../lib/auth.js";
import { getErrorMessage } from "../lib/error.js";

// Logos (copy from mobile/assets/brand/ into src/assets/brand/)
import LOGO from "../assets/brand/restau-logo.png";            // colored, for the light form side
import LOGO_WHITE from "../assets/brand/restau-logo-white.png"; // white, for the dark brand panel

// Food-line animation frames (copy the PNG frames into src/assets/brand/food-lines/)
const FOOD_LINE_FRAMES = Object.entries(
  import.meta.glob("../assets/brand/food-lines/*.png", {
    eager: true,
    query: "?url",
    import: "default",
  })
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);
const FOOD_LINES_FPS = 12;

const DARK_GREEN = "#0B6B4B"; // dark green from the logo
const LIME_GREEN = "#5CC11E"; // bright green from the logo

const FEATURES = [
  {
    icon: Shield,
    title: "Role-based access",
    text: "Only authorized administrators can sign in.",
  },
  {
    icon: Clock,
    title: "Live revenue & claims",
    text: "Follow payments and meal claims as they happen.",
  },
  {
    icon: Sparkle,
    title: "Clean admin console",
    text: "Students, plans, subscriptions and billing in one place.",
  },
];

// "RESTAU" + "Admin" joined on one line. `tone="light"` is for the dark brand panel.
const Wordmark = ({ tone = "dark", className = "" }) => (
  <span className={`inline-flex items-baseline font-extrabold tracking-tight ${className}`}>
    <span style={{ color: tone === "light" ? "#FFFFFF" : DARK_GREEN }}>RESTAU</span>
    <span style={{ color: LIME_GREEN }}>Admin</span>
  </span>
);

// Small animated food-lines loop, shown beside the logo and wordmark.
const FoodLinesLoop = ({ className = "" }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (FOOD_LINE_FRAMES.length < 2) return undefined;

    // Preload every frame so the browser never shows a blank frame.
    const preloaded = FOOD_LINE_FRAMES.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % FOOD_LINE_FRAMES.length);
    }, 1000 / FOOD_LINES_FPS);

    return () => {
      clearInterval(timer);
      preloaded.length = 0;
    };
  }, []);

  if (FOOD_LINE_FRAMES.length === 0) return null;

  return (
    <img
      src={FOOD_LINE_FRAMES[index]}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`pointer-events-none select-none object-contain ${className}`}
    />
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const validate = () => {
    if (!email.trim()) {
      setFieldError("Email address is required");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setFieldError("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    setFieldError("");
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setFieldError("");
    setPasswordError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const { token, user } = await loginAdmin(email.trim(), password);
      localStorage.setItem("restau_admin_web_token", token);
      localStorage.setItem("restau_admin_web_user", JSON.stringify(user));

      if (!isAdminUser()) {
        localStorage.removeItem("restau_admin_web_token");
        localStorage.removeItem("restau_admin_web_user");
        setApiError(
          "This account does not have administrator access. Contact your RESTAU administrator."
        );
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      const message =
        getErrorMessage(error);
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-white py-3 pl-11 text-sm text-slate-900 placeholder-slate-400 transition focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400";
  const inputOk =
    "border-border focus:border-primary focus:ring-primary/15";

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* Animations: drifting shapes, floating icons, glow. Disabled for reduced motion. */}
      <style>{`
        @keyframes restauDriftA { 0%,100% { transform: translate(0,0) scale(.98); } 50% { transform: translate(-14px,12px) scale(1.03); } }
        @keyframes restauDriftB { 0%,100% { transform: translate(0,0) scale(1.02); } 50% { transform: translate(12px,-12px) scale(.97); } }
        @keyframes restauFloat { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-4px) scale(1.06); } }
        @keyframes restauGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(92,193,30,0.0); } 50% { box-shadow: 0 0 0 6px rgba(92,193,30,0.18); } }
        .restau-drift-a { animation: restauDriftA 11s ease-in-out infinite; }
        .restau-drift-b { animation: restauDriftB 13s ease-in-out infinite; }
        .restau-float { animation: restauFloat 3.2s ease-in-out infinite; }
        .restau-glow { animation: restauGlow 3.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .restau-drift-a, .restau-drift-b, .restau-float, .restau-glow { animation: none; }
        }
      `}</style>

      {/* Brand panel (desktop): same dark green gradient as the dashboard "Today at a glance" card */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* Decorative drifting shapes */}
        <div className="restau-drift-a pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-400/10" />
        <div className="restau-drift-b pointer-events-none absolute -bottom-32 -right-20 h-[26rem] w-[26rem] rounded-full bg-emerald-400/10" />
        <div className="restau-drift-a pointer-events-none absolute right-16 top-32 h-24 w-24 rotate-12 rounded-3xl bg-white/5" />
        <div className="restau-drift-b pointer-events-none absolute left-10 top-1/2 h-40 w-40 rounded-full border border-white/10" />

        {/* Top row: logo, joined wordmark, and the small food-lines animation on the same line */}
        <div className="relative flex items-center gap-4">
          <img src={LOGO_WHITE} alt="RESTAU logo" className="h-16 w-16 object-contain" />
          <Wordmark tone="light" className="text-2xl xl:text-3xl" />
          <FoodLinesLoop className="h-14 w-14 xl:h-16 xl:w-16" />
        </div>

        {/* Center: headline and features */}
        <div className="relative max-w-lg">
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight xl:text-[2.6rem]">
            Manage your cafeteria operations from one place.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-emerald-50/80">
            Meal-credit tracking, QR checks, subscriptions and billing, all in one
            dashboard for your admin team.
          </p>

          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex items-start gap-4">
                <div
                  className="restau-glow restau-float flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/10"
                  style={{ animationDelay: `${i * 0.5}s` }}
                >
                  <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-sm text-emerald-50/70">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-emerald-100/60">
          &copy; {new Date().getFullYear()} RESTAU. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <main className="relative flex items-center justify-center overflow-hidden bg-white px-6 py-12 sm:px-12">
        {/* Soft pale-green shapes */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="restau-drift-a absolute -right-24 -top-20 h-72 w-72 rounded-full bg-[#E8F8EE]" />
          <div className="restau-drift-b absolute -left-28 top-1/3 h-64 w-64 rounded-full bg-[#E8F8EE]/80" />
          <div className="restau-drift-a absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[#E8F8EE]/90" />
        </div>

        <div className="relative w-full max-w-[400px]">
          {/* Logo + wordmark (mobile / tablet only) */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <img src={LOGO} alt="RESTAU logo" className="h-28 w-28 object-contain" />
            <div className="mt-2">
              <Wordmark className="text-2xl" />
            </div>
            <p className="mt-1.5 text-sm text-slate-500">Your Campus Meals, Made Simple</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Administrator sign-in
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your administrator credentials to continue.
            </p>

            {apiError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <p className="text-sm font-medium text-red-700">{apiError}</p>
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-[18px] w-[18px] text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={fieldError ? "true" : "false"}
                    aria-describedby={fieldError ? "email-error" : undefined}
                    className={`${inputBase} pr-3 ${
                      fieldError
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : inputOk
                    }`}
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
                {fieldError && (
                  <p id="email-error" className="text-xs font-medium text-red-600">
                    {fieldError}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-[18px] w-[18px] text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={passwordError ? "true" : "false"}
                    aria-describedby={passwordError ? "password-error" : undefined}
                    className={`${inputBase} pr-11 ${
                      passwordError
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : inputOk
                    }`}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-xl pr-4 text-slate-400 transition-colors hover:text-slate-700"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
                {passwordError && (
                  <p id="password-error" className="text-xs font-medium text-red-600">
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-primary text-[15px] font-semibold text-white shadow-sm transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-dark disabled:cursor-not-allowed disabled:opacity-80"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
                )}
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
            Administrator accounts are issued by the RESTAU system owner.
            <br className="hidden sm:block" /> Contact your administrator for access.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;