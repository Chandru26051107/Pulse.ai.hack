import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useRiskHistory, useCurrentStatus } from "@/hooks/usePulseFlow";
import { getHistoryStats } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRiskColor, getRiskEmoji, type RiskLevel } from "@/types/pulseflow";
import {
  Clock,
  TrendingUp,
  Activity,
  Users,
  Bed,
  AlertTriangle,
  Filter,
} from "lucide-react";

export default function History() {
  const { data: riskHistory } = useRiskHistory();
  const status = useCurrentStatus();
  const stats = useMemo(() => getHistoryStats(), []);
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Filter history
  const filteredHistory = useMemo(() => {
    if (riskFilter === "all") return riskHistory;
    return riskHistory.filter((r) => r.riskLevel === riskFilter.toUpperCase());
  }, [riskHistory, riskFilter]);

  // Format timestamps for chart
  const trendData = filteredHistory.map((h) => ({
    name: new Date(h.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
    }),
    probability: Math.round(h.probability * 100),
    riskLevel: h.riskLevel,
    patients: h.patients,
    bedOccupancy: h.bedOccupancy,
    waitingTime: h.waitingTime,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className="tabular-nums">
          Risk: <span className="font-bold">{data.probability}%</span>
        </p>
        <p className="tabular-nums text-muted-foreground">
          Patients: {data.patients}
        </p>
        <p className="tabular-nums text-muted-foreground">
          Occupancy: {data.bedOccupancy}%
        </p>
        <p className="tabular-nums text-muted-foreground">
          Wait: {data.waitingTime}min
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">
          History & Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historical risk trends and operational performance metrics
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Peak Occupancy",
            value: `${stats.peakOccupancy}%`,
            icon: Bed,
            color: stats.peakOccupancy > 85 ? "var(--risk-high)" : "var(--accent)",
          },
          {
            label: "Peak Wait Time",
            value: `${stats.peakWaitTime}min`,
            icon: Clock,
            color: stats.peakWaitTime > 45 ? "var(--risk-high)" : "var(--accent)",
          },
          {
            label: "Highest Risk",
            value: `${Math.round(stats.highestRisk * 100)}%`,
            icon: AlertTriangle,
            color: getRiskColor(
              stats.highestRisk >= 0.75
                ? "CRITICAL"
                : stats.highestRisk >= 0.5
                ? "HIGH"
                : stats.highestRisk >= 0.25
                ? "MODERATE"
                : "LOW"
            ),
          },
          {
            label: "High Risk Periods",
            value: stats.highRiskCount.toString(),
            icon: TrendingUp,
            color: stats.highRiskCount > 10 ? "var(--risk-high)" : "var(--accent)",
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="vintage-card bg-card">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {card.label}
                    </span>
                  </div>
                  <p
                    className="text-2xl font-bold tabular-nums metric-value"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2"
      >
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground mr-1">Filter:</span>
        {["all", "low", "moderate", "high", "critical"].map((level) => (
          <button
            key={level}
            onClick={() => setRiskFilter(level)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              riskFilter === level
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-accent/10"
            }`}
          >
            {level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Risk trend chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="vintage-card bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                Risk Trend
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Historical overcrowding probability over time
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  interval={Math.max(0, Math.floor(trendData.length / 8))}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Secondary charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Wait time by hour */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="vintage-card bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                Avg Wait Time by Hour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={stats.avgWaitByHour}
                  margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                    interval={3}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                          <p>
                            Hour {payload[0].payload.hour}:{" "}
                            <span className="font-bold">
                              {payload[0].value}min
                            </span>
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="avgWait" radius={[2, 2, 0, 0]} barSize={12}>
                    {stats.avgWaitByHour.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.avgWait > 45
                            ? "var(--risk-high)"
                            : entry.avgWait > 30
                            ? "var(--risk-moderate)"
                            : "var(--accent)"
                        }
                        opacity={0.75}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Daily occupancy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="vintage-card bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                Avg Bed Occupancy by Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={stats.dailyOccupancy}
                  margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="bg-card border border-border rounded-lg p-2 shadow-lg text-xs">
                          <p>
                            {payload[0].payload.day}:{" "}
                            <span className="font-bold">
                              {payload[0].value}%
                            </span>
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="avgOccupancy" radius={[2, 2, 0, 0]} barSize={24}>
                    {stats.dailyOccupancy.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.avgOccupancy > 85
                            ? "var(--risk-high)"
                            : entry.avgOccupancy > 70
                            ? "var(--risk-moderate)"
                            : "var(--accent)"
                        }
                        opacity={0.75}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
