"use client";


interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  glowColor?: "blue" | "yellow" | "green" | "purple";
  loading?: boolean;
}

export default function StatsCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  glowColor = "blue",
  loading = false,
}: StatsCardProps) {
  const glowClasses = {
    blue: "hover:glow-blue hover:border-neon-blue/20",
    yellow: "hover:glow-yellow hover:border-neon-yellow/20",
    green: "hover:glow-green hover:border-neon-green/20",
    purple: "hover:glow-purple hover:border-neon-purple/20",
  };

  const accentColors = {
    blue: "text-neon-blue",
    yellow: "text-neon-yellow",
    green: "text-neon-green",
    purple: "text-neon-purple",
  };

  if (loading) {
    return (
      <div className="bg-dash-card rounded-2xl p-5 border border-white/5">
        <div className="skeleton h-10 w-10 rounded-xl mb-4" />
        <div className="skeleton h-4 w-20 mb-2" />
        <div className="skeleton h-8 w-16" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white/2 backdrop-blur-3xl rounded-[2rem] p-7 border border-white/5 transition-all duration-300 cursor-default group hover:bg-white/5 hover:-translate-y-1 ${glowClasses[glowColor]}`}
    >
      <div className="flex items-start justify-between mb-8">
        <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span className="text-2xl opacity-80">{icon}</span>
        </div>
        {trend && (
          <span
            className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border ${
              trendUp
                ? "bg-neon-green/10 text-neon-green border-neon-green/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {trendUp ? "▲" : "▼"} {trend}
          </span>
        )}
      </div>
      <p className="text-dash-text-dim text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-50">{label}</p>
      <p className={`text-4xl font-black tracking-tighter uppercase ${accentColors[glowColor]}`}>{value}</p>
    </div>
  );
}

