"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import { tokenManager } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = tokenManager.getUser();
    if (user?.name) setUserName(user.name);
    // Default to collapsed on mobile, expanded on desktop
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-dash-bg text-white">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <TopNavbar
          onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          userName={userName}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
