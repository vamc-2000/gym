"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenManager } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const user = tokenManager.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Redirect based on role
    if (user.role === "SUPER_ADMIN") {
      router.push("/dashboard/super-admin");
    } else if (user.role === "ADMIN") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard/user");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
      <div className="text-white/40 text-sm font-medium animate-pulse">
        Initializing your dashboard...
      </div>
    </div>
  );
}