import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  List,
  Mail,
  Users,
  CreditCard,
  Clock,
  Banknote,
  BarChart3,
  LogOut,
  X,
} from "lucide-react";
import { logout } from "../lib/auth.js";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/meal-plans", label: "Meal Plans", icon: BookOpen },
  { path: "/weekly-menu", label: "Weekly Menu", icon: List },
  { path: "/announcements", label: "Announcements", icon: Mail },
  { path: "/semesters", label: "Semesters", icon: Calendar },
  { path: "/students", label: "Students", icon: Users },
  { path: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { path: "/payments", label: "Payments", icon: Banknote },
  { path: "/meal-claims", label: "Meal Claims", icon: Clock },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

const Sidebar = ({ open, setOpen, onLogout }) => {
  return (
    <>
      {/* Mobile/tablet overlay (below the lg breakpoint, where the sidebar is off-canvas) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
              <img src="/restau-logo.png" alt="RESTAU logo" className="h-7 w-7 object-contain" />
            </div>
            <div className="leading-tight">
              <span className="block text-base font-semibold tracking-tight text-slate-900">
                RESTAU<span className="text-emerald-600">Admin</span>
              </span>
              <span className="block text-[11px] font-medium text-slate-400">Cafeteria management</span>
            </div>
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-600" />
                      )}
                      <item.icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer / logout */}
        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            onClick={() => {
              logout(onLogout);
              setOpen(false);
            }}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;