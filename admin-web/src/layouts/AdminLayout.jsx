import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import AdminHeader from "../components/AdminHeader.jsx";
import { getAuthUser } from "../lib/auth.js";

const AdminLayout = ({
  title = "Overview",
  breadcrumb = [],
  showNotifications = true,
  onProfileClick,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getAuthUser();

  return (
    <div className="flex min-h-screen bg-background text-text">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} onLogout={onProfileClick} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={title}
          breadcrumb={breadcrumb}
          user={user}
          onProfileClick={onProfileClick}
          showNotifications={showNotifications}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
