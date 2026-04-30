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
      <div className="bg-dash-card rounded-2xl p-6 border border-dash-border-subtle">
        <div className="skeleton h-5 w-32 mb-2" />
        <div className="skeleton h-3 w-24 mb-6" />
        <div className="skeleton h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-dash-card rounded-2xl p-6 border border-dash-border-subtle hover:border-dash-text/10 transition-all duration-300">
      <div className="mb-4">
        <h3 className="text-dash-text font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-dash-text-dim text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
