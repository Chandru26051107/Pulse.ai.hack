import { motion } from "framer-motion";
import type { PredictionResult } from "@/types/pulseflow";
import { getRiskColor, getRiskEmoji, getRiskTextClass } from "@/types/pulseflow";

interface RiskCardProps {
  prediction: PredictionResult;
}

export function RiskCard({ prediction }: RiskCardProps) {
  const { probability, riskLevel, leadTimeMinutes, confidence } = prediction;
  const color = getRiskColor(riskLevel);
  const circumference = 2 * Math.PI * 70;
  const dashOffset = circumference * (1 - probability);

  return (
    <div className="vintage-card rounded-xl p-6 bg-card">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-base font-semibold font-[family-name:var(--font-playfair)] text-foreground">
          Overcrowding Risk
        </h2>
        <span className="text-xs text-muted-foreground">AI Prediction</span>
      </div>

      <div className="flex items-center gap-8">
        {/* Gauge */}
        <div className="relative shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="var(--border)"
              strokeWidth="8"
              opacity="0.5"
            />
            {/* Risk arc */}
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              transform="rotate(-90 80 80)"
              opacity="0.9"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums" style={{ color }}>
              {Math.round(probability * 100)}
            </span>
            <span className="text-xs text-muted-foreground -mt-0.5">
              percent
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getRiskEmoji(riskLevel)}</span>
              <span
                className={`text-xl font-bold ${getRiskTextClass(riskLevel)}`}
              >
                {riskLevel}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {riskLevel === "CRITICAL"
                ? "Immediate attention required"
                : riskLevel === "HIGH"
                ? "Elevated risk — monitor closely"
                : riskLevel === "MODERATE"
                ? "Moderate risk — watch for changes"
                : "Conditions within normal range"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-background/50">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Lead Time
              </p>
              <p className="text-lg font-bold tabular-nums mt-0.5">
                {leadTimeMinutes}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  min
                </span>
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-background/50">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Confidence
              </p>
              <p className="text-lg font-bold tabular-nums mt-0.5">
                {Math.round(confidence * 100)}
                <span className="text-xs font-normal text-muted-foreground">
                  %
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
