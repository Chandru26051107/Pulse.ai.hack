import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { useForecast, usePrediction, useCurrentStatus } from "@/hooks/usePulseFlow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRiskColor, getRiskEmoji } from "@/types/pulseflow";
import { TrendingUp, AlertTriangle, Clock } from "lucide-react";

export default function Forecast() {
  const forecast = useForecast();
  const prediction = usePrediction();
  const status = useCurrentStatus();

  // Find first high-risk crossing
  const firstHighCrossing = forecast.find((f) => f.probability >= 0.5);

  const chartData = forecast.map((f) => ({
    name: `+${f.horizonMinutes}min`,
    risk: Math.round(f.probability * 100),
    patients: f.patients,
    beds: f.availableBeds,
    staff: f.availableStaff,
    wait: f.waitingTime,
    horizon: f.horizonMinutes,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className="tabular-nums">Risk: <span className="font-bold">{data.risk}%</span></p>
        <p className="tabular-nums text-muted-foreground">Patients: {data.patients}</p>
        <p className="tabular-nums text-muted-foreground">Beds free: {data.beds}</p>
        <p className="tabular-nums text-muted-foreground">Staff: {data.staff}</p>
        <p className="tabular-nums text-muted-foreground">Wait: {data.wait}min</p>
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
          Forecast
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overcrowding probability across upcoming time horizons
        </p>
      </motion.div>

      {/* Current prediction banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="vintage-card rounded-xl p-5 bg-card flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${getRiskColor(prediction.riskLevel)}15` }}>
            <span className="text-2xl">{getRiskEmoji(prediction.riskLevel)}</span>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: getRiskColor(prediction.riskLevel) }}>
              {prediction.riskLevel} — {Math.round(prediction.probability * 100)}%
            </p>
            <p className="text-sm text-muted-foreground">
              Active risk level — {prediction.leadTimeMinutes}-minute lead time
            </p>
          </div>
        </div>
        {firstHighCrossing && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-risk-high/10 border border-risk-high/20">
            <AlertTriangle className="w-4 h-4 text-risk-high" />
            <span className="text-sm text-risk-high font-medium">
              Early warning: approximately {firstHighCrossing.horizonMinutes} minutes
            </span>
          </div>
        )}
      </motion.div>

      {/* Risk forecast chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="vintage-card bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                Overcrowding Risk Curve
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Projected risk at 30, 60, 90, 120, and 180-minute horizons
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Risk threshold lines */}
                <ReferenceLine y={25} stroke="var(--risk-low)" strokeDasharray="5 5" opacity={0.3} />
                <ReferenceLine y={50} stroke="var(--risk-moderate)" strokeDasharray="5 5" opacity={0.3} />
                <ReferenceLine y={75} stroke="var(--risk-high)" strokeDasharray="5 5" opacity={0.3} />
                {/* Risk zones */}
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="url(#riskGradient)"
                  dot={{ r: 5, fill: "var(--accent)", strokeWidth: 2, stroke: "var(--card)" }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-px bg-risk-low" style={{ borderTop: "2px dashed var(--risk-low)" }} />
                <span>Low (0–25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-px" style={{ borderTop: "2px dashed var(--risk-moderate)" }} />
                <span>Moderate (25–50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-px" style={{ borderTop: "2px dashed var(--risk-high)" }} />
                <span>High (50–75%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-px" style={{ borderTop: "2px dashed var(--risk-critical)" }} />
                <span>Critical (75%+)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Capacity projection */}
      <div className="grid grid-cols-3 gap-4">
        {forecast.map((f, i) => (
          <motion.div
            key={f.horizonMinutes}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <Card className={`vintage-card bg-card ${f.riskLevel === "HIGH" || f.riskLevel === "CRITICAL" ? "border-risk-high/40" : ""}`}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">+{f.horizonMinutes} min</span>
                  </div>
                  <span className="text-sm">{getRiskEmoji(f.riskLevel)}</span>
                </div>
                <p className="text-2xl font-bold tabular-nums metric-value" style={{ color: getRiskColor(f.riskLevel) }}>
                  {Math.round(f.probability * 100)}%
                </p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Patients</span>
                    <span className="tabular-nums">{f.patients}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Beds free</span>
                    <span className="tabular-nums">{f.availableBeds}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. wait</span>
                    <span className="tabular-nums">{f.waitingTime}min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
