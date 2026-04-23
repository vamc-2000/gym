"use client";

import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  loading?: boolean;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  loading = false,
}: ChartCardProps) {
  if (loading) {
    return (
      <div className="bg-dash-card rounded-2xl p-6 border border-white/5">
        <div className="skeleton h-5 w-32 mb-2" />
        <div className="skeleton h-3 w-24 mb-6" />
        <div className="skeleton h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-dash-card rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-white/30 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
