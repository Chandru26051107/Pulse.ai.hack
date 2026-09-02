import { motion } from "framer-motion";
import type { HospitalMetrics } from "@/types/pulseflow";
import { Users, Bed, Clock, UserCheck, Activity, Ambulance } from "lucide-react";

interface MetricStripProps {
  metrics: HospitalMetrics;
}

const METRICS = (m: HospitalMetrics) => [
  {
    label: "ED Patients",
    value: m.currentEDPatients,
    suffix: "",
    icon: Users,
    max: m.totalEDBeds * 1.5,
    warning: m.currentEDPatients > m.totalEDBeds * 0.85,
  },
  {
    label: "Available Beds",
    value: m.availableBeds,
    suffix: ` / ${m.totalEDBeds}`,
    icon: Bed,
    max: m.totalEDBeds,
    warning: m.availableBeds < 5,
  },
  {
    label: "Bed Occupancy",
    value: m.bedOccupancyPercent,
    suffix: "%",
    icon: Activity,
    max: 100,
    warning: m.bedOccupancyPercent > 85,
  },
  {
    label: "Available Staff",
    value: m.availableStaff,
    suffix: ` / ${m.totalStaff}`,
    icon: UserCheck,
    max: m.totalStaff,
    warning: m.staffRatio < 0.6,
  },
  {
    label: "Avg Wait Time",
    value: m.averageWaitingTime,
    suffix: " min",
    icon: Clock,
    max: 90,
    warning: m.averageWaitingTime > 45,
  },
  {
    label: "Ambulance",
    value: m.ambulanceArrivals,
    suffix: "/hr",
    icon: Ambulance,
    max: 15,
    warning: m.ambulanceArrivals > 5,
  },
];

export function MetricStrip({ metrics }: MetricStripProps) {
  const items = METRICS(metrics);

  return (
    <div className="grid grid-cols-6 gap-3">
      {items.map((item, i) => {
        const Icon = item.icon;
        const barPct = Math.min(100, (item.value / item.max) * 100);

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className={`vintage-card rounded-lg p-3.5 bg-card ${
              item.warning ? "border-risk-high/40" : ""
            }`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.label}
              </span>
            </div>
            <p className="text-2xl font-bold tabular-nums metric-value">
              {item.value}
              <span className="text-xs font-normal text-muted-foreground">
                {item.suffix}
              </span>
            </p>
            <div className="mt-2 h-1 rounded-full bg-border/50 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: item.warning
                    ? "var(--risk-high)"
                    : "var(--accent)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
