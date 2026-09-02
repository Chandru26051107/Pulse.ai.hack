import { useMemo, useState } from "react";
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
  Legend,
} from "recharts";
import { getHospitalData } from "@/services/api";
import { predictOvercrowding, generateForecast } from "@/lib/mlEngine";
import { useCurrentStatus } from "@/hooks/usePulseFlow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getRiskColor,
  getRiskEmoji,
  getRiskLevel,
  type RiskLevel,
} from "@/types/pulseflow";
import {
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Prediction7Day() {
  const status = useCurrentStatus();
  const [selectedDay, setSelectedDay] = useState(0); // 0 = today, -1 = yesterday, etc.

  // Generate past 7 days data
  const pastData = useMemo(() => {
    const allData = getHospitalData();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    return allData
      .filter((m) => m.timestamp >= sevenDaysAgo && m.timestamp <= now)
      .map((m) => {
        const pred = predictOvercrowding(m);
        const date = new Date(m.timestamp);
        return {
          timestamp: m.timestamp,
          hour: date.getHours(),
          day: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          dateLabel: `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.getHours()}:00`,
          risk: Math.round(pred.probability * 100),
          riskLevel: pred.riskLevel,
          patients: m.currentEDPatients,
          beds: m.availableBeds,
          bedOccupancy: m.bedOccupancyPercent,
          staff: m.availableStaff,
          waitTime: m.averageWaitingTime,
          arrivals: m.patientArrivals,
          type: "past" as const,
        };
      });
  }, []);

  // Generate next 7 days predictions (hourly)
  const futureData = useMemo(() => {
    const now = Date.now();
    const points: Array<{
      timestamp: number;
      hour: number;
      day: string;
      dateLabel: string;
      risk: number;
      riskLevel: RiskLevel;
      patients: number;
      beds: number;
      bedOccupancy: number;
      staff: number;
      waitTime: number;
      arrivals: number;
      type: "future";
    }> = [];

    const currentMetrics = status.data;

    for (let h = 1; h <= 168; h++) {
      const futureTime = now + h * 60 * 60 * 1000;
      const date = new Date(futureTime);
      const hourOfDay = date.getHours();

      // Simulate realistic patterns for future hours
      const baseArrivals = [3, 2, 2, 1, 1, 2, 3, 5, 7, 9, 10, 11, 10, 9, 10, 9, 8, 7, 6, 5, 5, 4, 4, 3][hourOfDay] || 5;
      const scale = currentMetrics.totalEDBeds / 30;
      const arrivals = Math.round(baseArrivals * scale * (0.85 + Math.sin(h * 0.1) * 0.15));

      const projectedPatients = Math.min(
        currentMetrics.totalEDBeds,
        Math.max(
          Math.round(currentMetrics.totalEDBeds * 0.5),
          currentMetrics.currentEDPatients + Math.round((arrivals - currentMetrics.dischargesLast1Hr) * (h / 24) * 0.3)
        )
      );

      const projectedBeds = Math.max(0, currentMetrics.totalEDBeds - projectedPatients);
      const bedOcc = Math.round((projectedPatients / currentMetrics.totalEDBeds) * 100);

      let staffRatio = currentMetrics.staffRatio;
      if (hourOfDay >= 7 && hourOfDay < 15) staffRatio = 0.65;
      else if (hourOfDay >= 15 && hourOfDay < 23) staffRatio = 0.55;
      else staffRatio = 0.35;

      const projectedStaff = Math.round(currentMetrics.totalStaff * staffRatio);
      const waitTime = Math.round(
        8 + (bedOcc / 100) * 30 + (1 - staffRatio) * 15 + Math.sin(h * 0.2) * 5
      );

      const futureMetrics = {
        ...currentMetrics,
        timestamp: futureTime,
        hourOfDay,
        dayOfWeek: date.getDay(),
        currentEDPatients: projectedPatients,
        availableBeds: projectedBeds,
        bedOccupancyPercent: bedOcc,
        availableStaff: projectedStaff,
        staffRatio: parseFloat(staffRatio.toFixed(2)),
        averageWaitingTime: Math.max(2, waitTime),
        patientArrivals: arrivals,
        arrivalsLast1Hr: arrivals,
        arrivalsLast30Min: Math.round(arrivals * 0.4),
        arrivalsLast3Hr: arrivals * 3,
        ambulanceArrivals: Math.round(arrivals * 0.18),
        admissionsLast1Hr: Math.round(projectedPatients * 0.08),
        dischargesLast1Hr: Math.round(projectedPatients / 5),
      };

      const pred = predictOvercrowding(futureMetrics);

      points.push({
        timestamp: futureTime,
        hour: hourOfDay,
        day: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        dateLabel: `${date.toLocaleDateString("en-US", { weekday: "short" })} ${hourOfDay}:00`,
        risk: Math.round(pred.probability * 100),
        riskLevel: pred.riskLevel,
        patients: projectedPatients,
        beds: projectedBeds,
        bedOccupancy: bedOcc,
        staff: projectedStaff,
        waitTime: Math.max(2, waitTime),
        arrivals,
        type: "future" as const,
      });
    }
    return points;
  }, [status.data]);

  // Combine for full chart
  const allData = useMemo(() => [...pastData, ...futureData], [pastData, futureData]);

  // Daily summaries for past 7 days
  const pastDaySummaries = useMemo(() => {
    const grouped: Record<string, typeof pastData> = {};
    pastData.forEach((d) => {
      if (!grouped[d.day]) grouped[d.day] = [];
      grouped[d.day].push(d);
    });
    return Object.entries(grouped).map(([day, points]) => ({
      day,
      avgRisk: Math.round(points.reduce((s, p) => s + p.risk, 0) / points.length),
      maxRisk: Math.max(...points.map((p) => p.risk)),
      avgPatients: Math.round(points.reduce((s, p) => s + p.patients, 0) / points.length),
      avgWait: Math.round(points.reduce((s, p) => s + p.waitTime, 0) / points.length),
      peakHour: points.reduce((max, p) => (p.risk > max.risk ? p : max), points[0]).hour,
      riskLevel: getRiskLevel(Math.round(points.reduce((s, p) => s + p.risk, 0) / points.length) / 100),
    }));
  }, [pastData]);

  // Daily summaries for next 7 days
  const futureDaySummaries = useMemo(() => {
    const grouped: Record<string, typeof futureData> = {};
    futureData.forEach((d) => {
      if (!grouped[d.day]) grouped[d.day] = [];
      grouped[d.day].push(d);
    });
    return Object.entries(grouped).map(([day, points]) => ({
      day,
      avgRisk: Math.round(points.reduce((s, p) => s + p.risk, 0) / points.length),
      maxRisk: Math.max(...points.map((p) => p.risk)),
      avgPatients: Math.round(points.reduce((s, p) => s + p.patients, 0) / points.length),
      avgWait: Math.round(points.reduce((s, p) => s + p.waitTime, 0) / points.length),
      peakHour: points.reduce((max, p) => (p.risk > max.risk ? p : max), points[0]).hour,
      riskLevel: getRiskLevel(Math.round(points.reduce((s, p) => s + p.risk, 0) / points.length) / 100),
    }));
  }, [futureData]);

  // Find high-risk crossings in future
  const highRiskCrossings = useMemo(() => {
    return futureData.filter((d) => d.risk >= 50).slice(0, 5);
  }, [futureData]);

  // Chart data — downsample for readability (every 6 hours)
  const chartData = useMemo(() => {
    return allData
      .filter((_, i) => i % 6 === 0)
      .map((d) => ({
        name: d.dateLabel,
        risk: d.risk,
        patients: d.patients,
        beds: d.beds,
        wait: d.waitTime,
        type: d.type,
      }));
  }, [allData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className="tabular-nums">
          Risk: <span className="font-bold">{data?.risk}%</span>
        </p>
        <p className="tabular-nums text-muted-foreground">
          Patients: {data?.patients}
        </p>
        <p className="tabular-nums text-muted-foreground">
          Beds free: {data?.beds}
        </p>
        <p className="tabular-nums text-muted-foreground">
          Wait: {data?.wait}min
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {data?.type === "past" ? "Historical data" : "Projected forecast"}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">
          7-Day Outlook
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historical trends from the past 7 days and hourly predictions for the next 7 days
        </p>
      </motion.div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Past 7 Days Avg Risk",
            value: pastDaySummaries.length > 0
              ? `${Math.round(pastDaySummaries.reduce((s, d) => s + d.avgRisk, 0) / pastDaySummaries.length)}%`
              : "—",
            icon: TrendingUp,
            color: "var(--accent)",
          },
          {
            label: "Next 7 Days Avg Risk",
            value: futureDaySummaries.length > 0
              ? `${Math.round(futureDaySummaries.reduce((s, d) => s + d.avgRisk, 0) / futureDaySummaries.length)}%`
              : "—",
            icon: Calendar,
            color: "var(--accent)",
          },
          {
            label: "Peak Risk (Next 7d)",
            value: futureDaySummaries.length > 0
              ? `${Math.max(...futureDaySummaries.map((d) => d.maxRisk))}%`
              : "—",
            icon: AlertTriangle,
            color: "var(--risk-high)",
          },
          {
            label: "High-Risk Periods",
            value: `${highRiskCrossings.length}`,
            icon: Clock,
            color: highRiskCrossings.length > 0 ? "var(--risk-high)" : "var(--risk-low)",
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

      {/* Main 7-day chart */}
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
                14-Day Risk Timeline
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Past 7 days (historical) and next 7 days (projected) at 6-hour resolution
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id="pastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="futureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--risk-moderate)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--risk-moderate)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  interval={Math.max(0, Math.floor(chartData.length / 14) - 1)}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={25} stroke="var(--risk-low)" strokeDasharray="5 5" opacity={0.3} />
                <ReferenceLine y={50} stroke="var(--risk-moderate)" strokeDasharray="5 5" opacity={0.3} />
                <ReferenceLine y={75} stroke="var(--risk-high)" strokeDasharray="5 5" opacity={0.3} />
                {/* Divider between past and future */}
                <ReferenceLine
                  x={chartData.findIndex((d) => d.type === "future")}
                  stroke="var(--foreground)"
                  strokeDasharray="8 4"
                  opacity={0.3}
                  label={{ value: "Today", position: "top", fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="risk"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#pastGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-accent" />
                <span>Risk %</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-px" style={{ borderTop: "2px dashed var(--foreground)", opacity: 0.3 }} />
                <span>Today (Past / Future)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Past 7 days detail */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="vintage-card bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                Past 7 Days — What Happened
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Daily summaries of historical risk, patient volume, and wait times
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Day</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Avg Risk</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Peak Risk</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Avg Patients</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Avg Wait</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Peak Hour</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pastDaySummaries.map((d, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2.5 font-medium">{d.day}</td>
                      <td className="py-2.5 text-right tabular-nums">{d.avgRisk}%</td>
                      <td className="py-2.5 text-right tabular-nums" style={{ color: d.maxRisk > 50 ? "var(--risk-high)" : "var(--foreground)" }}>
                        {d.maxRisk}%
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{d.avgPatients.toLocaleString()}</td>
                      <td className="py-2.5 text-right tabular-nums">{d.avgWait}min</td>
                      <td className="py-2.5 text-right tabular-nums">{d.peakHour}:00</td>
                      <td className="py-2.5 text-right">
                        <span className="text-sm">{getRiskEmoji(d.riskLevel)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next 7 days prediction */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="vintage-card bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                Next 7 Days — What to Expect
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Hourly predictions projected from current conditions and historical patterns
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Day</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Avg Risk</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Peak Risk</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Avg Patients</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Avg Wait</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Peak Hour</th>
                    <th className="pb-2 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {futureDaySummaries.map((d, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2.5 font-medium">{d.day}</td>
                      <td className="py-2.5 text-right tabular-nums" style={{ color: getRiskColor(d.riskLevel) }}>
                        {d.avgRisk}%
                      </td>
                      <td className="py-2.5 text-right tabular-nums" style={{ color: d.maxRisk > 50 ? "var(--risk-high)" : "var(--foreground)" }}>
                        {d.maxRisk}%
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{d.avgPatients.toLocaleString()}</td>
                      <td className="py-2.5 text-right tabular-nums">{d.avgWait}min</td>
                      <td className="py-2.5 text-right tabular-nums">{d.peakHour}:00</td>
                      <td className="py-2.5 text-right">
                        <span className="text-sm">{getRiskEmoji(d.riskLevel)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* High-risk alerts for next 7 days */}
      {highRiskCrossings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="vintage-card bg-card border-risk-high/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-risk-high" />
                <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                  High-Risk Periods Ahead
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Time windows where risk is projected to exceed 50%
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {highRiskCrossings.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-risk-high/5 border border-risk-high/10"
                  >
                    <div className="flex items-center gap-3">
                      <span>{getRiskEmoji(d.riskLevel)}</span>
                      <div>
                        <p className="text-sm font-medium">{d.dateLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.patients.toLocaleString()} patients · {d.waitTime}min wait
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-lg font-bold tabular-nums"
                      style={{ color: getRiskColor(d.riskLevel) }}
                    >
                      {d.risk}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-2"
      >
        <p className="text-[10px] text-muted-foreground/60">
          Predictions are model-derived estimates based on current conditions and historical patterns.
          Actual outcomes may vary. Verify with clinical and administrative staff.
        </p>
      </motion.div>
    </div>
  );
}
