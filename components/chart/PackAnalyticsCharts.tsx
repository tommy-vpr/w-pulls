"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  PieChart,
  Pie,
  ComposedChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TierChartData {
  name: string;
  count: number;
  avgPrice: number;
  fill: string;
}

interface PackComparisonData {
  name: string;
  price: number;
  ev: number;
  margin: number;
}

interface OddsData {
  name: string;
  [key: string]: string | number;
}

interface MarginData {
  name: string;
  margin: number;
}

interface PackAnalyticsChartsProps {
  tierChartData: TierChartData[];
  packComparisonData: PackComparisonData[];
  oddsData: OddsData[];
  marginData: MarginData[];
  tierColors: Record<string, string>;
  tierOrder: string[];
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {typeof entry.value === "number" &&
            entry.name.toLowerCase().includes("price")
              ? `$${entry.value.toFixed(2)}`
              : typeof entry.value === "number" &&
                entry.name.toLowerCase().includes("margin")
              ? `${entry.value}%`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PackAnalyticsCharts({
  tierChartData,
  packComparisonData,
  oddsData,
  marginData,
  tierColors,
  tierOrder,
}: PackAnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      {/* Top Row - Inventory and Price Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tier Inventory Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tierChartData} margin={{ bottom: 60 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = tierChartData.find((d) => d.name === label);
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-foreground mb-1">
                            {label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Count:{" "}
                            <span className="text-foreground font-medium">
                              {data?.count}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Avg Price:{" "}
                            <span className="text-foreground font-medium">
                              ${data?.avgPrice.toFixed(2)}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tierChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tier Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tierChartData.filter((d) => d.count > 0)}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                >
                  {tierChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TierChartData;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-foreground mb-1">
                            {data.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Count:{" "}
                            <span className="text-foreground font-medium">
                              {data.count}
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Price vs Expected Value */}
      <Card>
        <CardHeader>
          <CardTitle>Pack Price vs Expected Value</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={packComparisonData} margin={{ bottom: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium text-foreground mb-2">
                          {label}
                        </p>
                        {payload.map((entry, index) => (
                          <p
                            key={index}
                            className="text-sm"
                            style={{ color: entry.color }}
                          >
                            {entry.name}: ${Number(entry.value).toFixed(2)}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="price"
                fill="#3b82f6"
                name="Pack Price"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
              <Bar
                dataKey="ev"
                fill="#22c55e"
                name="Expected Value"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
              <Line
                type="monotone"
                dataKey="margin"
                stroke="#f97316"
                name="Profit/Pack"
                strokeWidth={2}
                dot={{ fill: "#f97316", strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom Row - Odds and Margins */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tier Odds by Pack */}
        <Card>
          <CardHeader>
            <CardTitle>Tier Odds by Pack</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={oddsData} layout="vertical" margin={{ left: 20 }}>
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-foreground mb-2">
                            {label}
                          </p>
                          {payload
                            .filter((entry) => Number(entry.value) > 0)
                            .map((entry, index) => (
                              <p
                                key={index}
                                className="text-sm"
                                style={{ color: entry.color }}
                              >
                                {String(entry.name).replace(/_/g, " ")}:{" "}
                                {entry.value}%
                              </p>
                            ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">
                      {String(value).replace(/_/g, " ")}
                    </span>
                  )}
                />
                {tierOrder.map((tier) => (
                  <Bar
                    key={tier}
                    dataKey={tier}
                    stackId="odds"
                    fill={tierColors[tier]}
                    name={tier}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Margins */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Margins by Pack</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={marginData} margin={{ bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = Number(payload[0].value);
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-foreground mb-1">
                            {label}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              value > 20
                                ? "text-green-500"
                                : value > 0
                                ? "text-yellow-500"
                                : "text-red-500"
                            }`}
                          >
                            Margin: {value.toFixed(1)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={20}
                  stroke="#22c55e"
                  strokeDasharray="3 3"
                  label={{
                    value: "20% Target",
                    position: "right",
                    fill: "#22c55e",
                    fontSize: 11,
                  }}
                />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                  {marginData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.margin > 20
                          ? "#22c55e"
                          : entry.margin > 0
                          ? "#eab308"
                          : "#ef4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Average Price by Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Average Price by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tierChartData} margin={{ bottom: 60 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium text-foreground mb-1">
                          {label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg Price:{" "}
                          <span className="text-foreground font-medium">
                            ${Number(payload[0].value).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="avgPrice" radius={[4, 4, 0, 0]}>
                {tierChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
