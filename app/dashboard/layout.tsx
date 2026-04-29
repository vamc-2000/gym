"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import { NotificationManager, triggerToast } from "@/components/NotificationManager";
import { tokenManager } from "@/lib/auth";
import { WorkoutProvider } from "@/context/WorkoutContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [userName, setUserName] = useState("Athlete");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = tokenManager.getUser();
      if (user?.name) {
        setUserName(user.name);
        
        // Show welcome back toast if not shown in this session
        if (!sessionStorage.getItem("welcome_toast_shown")) {
          triggerToast("Welcome back!", "Ready to crush your goals today?", "info");
          sessionStorage.setItem("welcome_toast_shown", "true");
        }
      }
    }
  }, []);

  // Global Schedule Timer
  useEffect(() => {
    const fetchAndCheckSchedule = async () => {
      try {
        const { dashboardService } = await import("@/lib/services/dashboardService");
        const res = await dashboardService.getDailySchedule();
        if (res.success && res.data) {
          const nowHours = new Date().getHours().toString().padStart(2, '0');
          const nowMins = new Date().getMinutes().toString().padStart(2, '0');
          const currentHM = `${nowHours}:${nowMins}`;
          
          res.data.forEach((item: any) => {
            if (item.time === currentHM && item.status === "upcoming") {
              // Ensure we don't trigger multiple times for the same minute
              const triggeredKey = `triggered_${item.id}`;
              if (!sessionStorage.getItem(triggeredKey)) {
                triggerToast("Reminder!", `It's time for: ${item.title}`, item.type);
                sessionStorage.setItem(triggeredKey, "true");
              }
            }
          });
        }
      } catch (e) {
        // ignore
      }
    };

    fetchAndCheckSchedule(); // Check immediately
    const timer = setInterval(fetchAndCheckSchedule, 60000); // Check every minute

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
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
      <WorkoutProvider>
        <NotificationManager />
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
      </WorkoutProvider>
    </div>
  );
}
