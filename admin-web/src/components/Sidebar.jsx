import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  CreditCard,
  Clock,
  Banknote,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logout } from "../lib/auth.js";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/meal-plans", label: "Meal Plans", icon: BookOpen },
  { path: "/semesters", label: "Semesters", icon: Calendar },
  { path: "/students", label: "Students", icon: Users },
  { path: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { path: "/payments", label: "Payments", icon: Banknote },
  { path: "/meal-claims", label: "Meal Claims", icon: Clock },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

const Sidebar = ({ open, setOpen, onLogout }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile/tablet overlay (below the lg breakpoint, where the sidebar is off-canvas) */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto ${
         open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <img
              src="/restau-logo.png"
              alt="RESTAU"
              className="h-8 w-8"
            />
            <span className="text-lg font-semibold tracking-tight text-text">
              RESTAU<span className="text-primary">Admin</span>
            </span>
          </div>
          <button
            className="rounded-md p-1 text-text-secondary hover:bg-border lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-border hover:text-text"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / logout */}
        <div className="border-t border-border p-3">
          <button
            className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-error hover:bg-error/10 transition-colors"
            onClick={() => {
              logout(onLogout);
              setOpen(false);
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
