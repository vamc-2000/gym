"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import RightSidebar from "@/components/community/RightSidebar";
import { tokenManager } from "@/lib/auth";
import { ThemeProvider } from "@/context/ThemeContext";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("Home");
  const [particles, setParticles] = useState<{ top: string, left: string, duration: string, delay: string }[]>([]);

  useEffect(() => {
    // Check authentication
    const user = tokenManager.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Map pathnames to sidebar highlights
    if (pathname.includes("/profile/")) {
      setActiveTab("Profile");
    } else if (pathname.includes("/edit-profile")) {
      setActiveTab("Settings");
    } else if (pathname.includes("/saved")) {
      setActiveTab("Settings");
    } else {
      setActiveTab("Home");
    }

    // Initialize decorative background floaty particles
    setParticles([...Array(20)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      duration: `${8 + Math.random() * 8}s`,
      delay: `${Math.random() * 4}s`
    })));
  }, [pathname, router]);

  const handleTabChange = (tab: string) => {
    if (tab === "Home") {
      router.push("/dashboard/community");
    } else if (tab === "Explore" || tab === "Reels" || tab === "Challenges" || tab === "Messages" || tab === "Friends") {
      router.push(`/dashboard/community?tab=${tab}`);
    }
  };

  return (
    <ThemeProvider>
      <div className="fixed inset-0 z-50 bg-[#040406] text-white selection:bg-neon-blue selection:text-dash-bg flex overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px]" />
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-10"
              style={{
                top: p.top,
                left: p.left,
                animation: `float-particle ${p.duration} infinite linear`,
                animationDelay: p.delay
              }}
            />
          ))}
        </div>

        {/* Main Grid Layout */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_360px] w-full h-screen overflow-hidden">
          {/* Left Sidebar */}
          <aside className="hidden lg:flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-3xl h-full overflow-hidden">
            <CommunitySidebar activeTab={activeTab} onTabChange={handleTabChange} />
          </aside>

          {/* Center Feed Area */}
          <main className="flex flex-col h-full overflow-hidden relative">
            {/* Custom Header */}
            <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                  Streak <span className="text-neon-blue">Profile</span>
                </h1>
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar pt-8 pb-32">
              <div className="max-w-4xl mx-auto px-6">
                {children}
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:flex flex-col border-l border-white/5 bg-black/20 backdrop-blur-3xl h-full overflow-y-auto no-scrollbar">
            <RightSidebar />
          </aside>
        </div>

        {/* Mobile Back Button */}
        <button
          onClick={() => router.back()}
          className="lg:hidden fixed bottom-6 left-6 z-50 w-12 h-12 bg-neon-blue text-dash-bg rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </ThemeProvider>
  );
}
