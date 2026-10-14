import React from "react";
import { Bell, LayoutDashboard, X, Menu } from "lucide-react";

const AdminHeader = ({
  title,
  breadcrumb,
  onMenuClick,
  user,
  onProfileClick,
  showNotifications = true,
}) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md p-2 text-text-secondary hover:bg-border lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center text-xs font-medium text-text-muted">
              {breadcrumb.map((seg, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="mx-2">/</span>}
                  <span className="truncate">{seg}</span>
                </React.Fragment>
              ))}
            </nav>
          )}
          <h1 className="mt-0.5 text-base font-semibold text-text">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showNotifications && (
          <button
            className="relative rounded-lg p-2 text-text-secondary hover:bg-border transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-sm font-extrabold text-white">
            {user?.firstName?.[0] || user?.id?.toString()[0] || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-text">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-text-secondary">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
