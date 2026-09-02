import { motion } from "framer-motion";
import type { Recommendation } from "@/types/pulseflow";
import { AlertCircle, Info, CheckCircle } from "lucide-react";

interface RecommendationPanelProps {
  recommendations: Recommendation[];
}

export function RecommendationPanel({ recommendations }: RecommendationPanelProps) {
  const priorityConfig = {
    high: { icon: AlertCircle, color: "var(--risk-high)", bg: "bg-risk-high/8" },
    medium: { icon: Info, color: "var(--risk-moderate)", bg: "bg-risk-moderate/8" },
    low: { icon: CheckCircle, color: "var(--risk-low)", bg: "bg-risk-low/8" },
  };

  return (
    <div className="space-y-2">
      {recommendations.map((rec, i) => {
        const config = priorityConfig[rec.priority];
        const Icon = config.icon;

        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className={`flex items-start gap-3 p-3 rounded-lg ${config.bg} border border-border/50`}
          >
            <Icon
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: config.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-snug">
                {rec.recommendation}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
              <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-border/50 text-muted-foreground">
                {rec.relatedFactor}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
