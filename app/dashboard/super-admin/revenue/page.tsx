"use client";

import { motion } from "framer-motion";

export default function SuperAdminRevenuePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">💰 Revenue & Subscriptions</h1>
        <p className="text-white/40 text-sm">Financial performance and growth analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Revenue", value: "$124,500", trend: "+12.5%", color: "text-green-400" },
          { label: "Active Subs", value: "1,245", trend: "+5.2%", color: "text-blue-400" },
          { label: "Churn Rate", value: "2.1%", trend: "-0.8%", color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-6 rounded-2xl border border-white/5">
            <p className="text-white/40 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
            <span className={`text-xs font-bold ${stat.color}`}>{stat.trend} this month</span>
          </div>
        ))}
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-white/5 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-white/40 font-medium">Subscription Growth Chart Integration Pending</p>
          <p className="text-white/20 text-sm mt-1">Connect Stripe/PayPal API to visualize real-time data</p>
        </div>
      </div>
    </div>
  );
}
