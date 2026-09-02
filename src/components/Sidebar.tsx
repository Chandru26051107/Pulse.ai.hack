import { NavLink, useLocation } from "react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Lightbulb,
  GitBranch,
  Clock,
  Shield,
  Activity,
} from "lucide-react";
import {
  getRiskLevel,
  getRiskColor,
  getRiskEmoji,
} from "@/types/pulseflow";
import { usePrediction } from "@/hooks/usePulseFlow";

const NAV_ITEMS = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Forecast", path: "/dashboard/forecast", icon: TrendingUp },
  { label: "Why Risk?", path: "/dashboard/explain", icon: Lightbulb },
  { label: "What-if", path: "/dashboard/whatif", icon: GitBranch },
  { label: "History", path: "/dashboard/history", icon: Clock },
];

export function Sidebar() {
  const location = useLocation();
  const prediction = usePrediction();

  return (
    <aside className="w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      {/* Logo / Brand */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">
              pulseflow.ai
            </h1>
            <p className="text-[10px] text-sidebar-foreground/50 tracking-widest uppercase">
              Capacity Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Live Risk Badge */}
      <div className="mx-4 mt-4 p-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50">
        <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 mb-1">
          Current Risk
        </p>
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {getRiskEmoji(prediction.riskLevel)}
          </span>
          <div>
            <span
              className="text-sm font-bold"
              style={{ color: getRiskColor(prediction.riskLevel) }}
            >
              {prediction.riskLevel}
            </span>
            <span className="text-xs text-sidebar-foreground/60 ml-2">
              {Math.round(prediction.probability * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="block no-underline"
            >
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground/90 hover:bg-sidebar-accent/30"
                }`}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary"
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Disclaimer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-[9px] leading-relaxed text-sidebar-foreground/35">
          Operational decisions should be verified with clinical and
          administrative staff. Predictions are model-derived estimates,
          not definitive guidance.
        </p>
        <div className="flex items-center gap-1.5 mt-3">
          <Shield className="w-3 h-3 text-sidebar-foreground/30" />
          <span className="text-[9px] text-sidebar-foreground/30">
            No real patient data
          </span>
        </div>
      </div>
    </aside>
  );
}
