import { motion } from "framer-motion";
import type { ContributingFactor } from "@/types/pulseflow";
import { ArrowUp, ArrowDown } from "lucide-react";

interface ContributingFactorsProps {
  factors: ContributingFactor[];
  compact?: boolean;
}

export function ContributingFactors({
  factors,
  compact = false,
}: ContributingFactorsProps) {
  const maxImportance = Math.max(...factors.map((f) => f.importance), 1);

  return (
    <div className="space-y-3">
      {factors.map((factor, i) => {
        const barWidth = (factor.importance / maxImportance) * 100;
        const isIncreasing = factor.direction === "increases";

        return (
          <motion.div
            key={factor.factor}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {isIncreasing ? (
                  <ArrowUp className="w-3.5 h-3.5 text-risk-high" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-risk-low" />
                )}
                <span className="text-sm font-medium">{factor.factor}</span>
              </div>
              {!compact && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {Math.round(factor.importance)}%
                </span>
              )}
            </div>

            {/* Bar */}
            <div className="h-2 rounded-full bg-border/40 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: isIncreasing
                    ? "var(--risk-high)"
                    : "var(--risk-low)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              />
            </div>

            {!compact && (
              <p className="text-[11px] text-muted-foreground mt-1">
                {factor.description}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
