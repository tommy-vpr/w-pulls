"use client";

import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Completed",
      value: stats.completedOrders.toLocaleString(),
      icon: CheckCircle,
      description: `${(
        (stats.completedOrders / stats.totalOrders) * 100 || 0
      ).toFixed(1)}% success rate`,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Pending",
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      description: "Awaiting payment",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      description: `$${stats.todayRevenue.toFixed(2)} today`,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
