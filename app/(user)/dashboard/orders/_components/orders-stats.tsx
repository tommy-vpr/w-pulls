"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  CheckCircle,
  Clock,
  DollarSign,
  Sparkles,
} from "lucide-react";

interface OrdersStatsProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    totalSpent: number;
    tierStats: Record<string, number>;
  };
}

const tierColors: Record<string, string> = {
  COMMON: "text-slate-400",
  UNCOMMON: "text-green-400",
  RARE: "text-blue-400",
  ULTRA_RARE: "text-purple-400",
  SECRET_RARE: "text-yellow-400",
  BANGER: "text-orange-400",
  GRAIL: "text-pink-400",
};

export function OrdersStats({ stats }: OrdersStatsProps) {
  // Find best pull
  const tierOrder = [
    "GRAIL",
    "BANGER",
    "SECRET_RARE",
    "ULTRA_RARE",
    "RARE",
    "UNCOMMON",
    "COMMON",
  ];
  const bestPull = tierOrder.find((tier) => stats.tierStats[tier] > 0) || null;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
      <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-violet-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Package className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Packs</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revealed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <DollarSign className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">
                ${stats.totalSpent.toFixed(0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-pink-500/10 to-pink-500/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/20">
              <Sparkles className="h-4 w-4 text-pink-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Best Pull</p>
              <p
                className={`text-lg font-bold ${
                  bestPull ? tierColors[bestPull] : "text-muted-foreground"
                }`}
              >
                {bestPull ? bestPull.replace("_", " ") : "None yet"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
