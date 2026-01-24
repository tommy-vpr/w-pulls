"use client";

import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { OrderStats } from "@/lib/repositories/order.repository";

interface OrdersStatsProps {
  stats: OrderStats;
}

export function OrdersStats({ stats }: OrdersStatsProps) {
  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: Package,
      description: `${stats.todayOrders} today`,
      color: "text-blue-400",
      bgColor: "bg-blue-900/30",
      borderColor: "border-blue-700/50",
      accentColor: "#3b82f6",
    },
    {
      title: "Completed",
      value: stats.completedOrders.toLocaleString(),
      icon: CheckCircle,
      description: `${(
        (stats.completedOrders / stats.totalOrders) * 100 || 0
      ).toFixed(1)}% success rate`,
      color: "text-emerald-400",
      bgColor: "bg-emerald-900/30",
      borderColor: "border-emerald-700/50",
      accentColor: "#10b981",
    },
    {
      title: "Pending",
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      description: "Awaiting payment",
      color: "text-amber-400",
      bgColor: "bg-amber-900/30",
      borderColor: "border-amber-700/50",
      accentColor: "#f59e0b",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      description: `$${stats.todayRevenue.toFixed(2)} today`,
      color: "text-emerald-400",
      bgColor: "bg-emerald-900/30",
      borderColor: "border-emerald-700/50",
      accentColor: "#10b981",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <div
          key={stat.title}
          className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          {/* Corner glow accent */}
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
            style={{ background: stat.accentColor }}
          />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-400">
                {stat.title}
              </span>
              <div
                className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}
              >
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl text-zinc-100">{stat.value}</div>
            <p className="text-xs text-zinc-500 mt-1">{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
