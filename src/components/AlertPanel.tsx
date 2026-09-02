import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Clock } from "lucide-react";
import { usePrediction, useCurrentStatus } from "@/hooks/usePulseFlow";
import { getRiskColor, getRiskEmoji, type RiskLevel } from "@/types/pulseflow";

interface AlertItem {
  id: string;
  timestamp: number;
  riskLevel: RiskLevel;
  probability: number;
  leadTimeMinutes: number;
  message: string;
  dismissed: boolean;
}

export function AlertPanel() {
  const prediction = usePrediction();
  const status = useCurrentStatus();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [lastRisk, setLastRisk] = useState<RiskLevel>(prediction.riskLevel);

  // Generate alerts when risk crosses thresholds
  if (prediction.riskLevel !== lastRisk) {
    if (
      prediction.riskLevel === "HIGH" ||
      prediction.riskLevel === "CRITICAL"
    ) {
      const existing = alerts.find(
        (a) =>
          a.riskLevel === prediction.riskLevel &&
          !a.dismissed &&
          Date.now() - a.timestamp < 60000
      );
      if (!existing) {
        setAlerts((prev) => [
          {
            id: `alert-${Date.now()}`,
            timestamp: Date.now(),
            riskLevel: prediction.riskLevel,
            probability: prediction.probability,
            leadTimeMinutes: prediction.leadTimeMinutes,
            message: `Overcrowding risk crossed to ${prediction.riskLevel} — ${Math.round(prediction.probability * 100)}% probability. Potential overcrowding detected approximately ${prediction.leadTimeMinutes} minutes ahead.`,
            dismissed: false,
          },
          ...prev,
        ]);
      }
    }
    setLastRisk(prediction.riskLevel);
  }

  const dismiss = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a))
    );
  }, []);

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  if (activeAlerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {activeAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="vintage-card rounded-lg p-4 bg-card flex items-start gap-3"
            style={{
              borderLeftWidth: "3px",
              borderLeftColor: getRiskColor(alert.riskLevel),
            }}
          >
            <AlertTriangle
              className="w-4 h-4 mt-0.5 shrink-0"
              style={{ color: getRiskColor(alert.riskLevel) }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{getRiskEmoji(alert.riskLevel)}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: getRiskColor(alert.riskLevel) }}
                >
                  {alert.riskLevel} ALERT
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(alert.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
            </div>
            <button
              onClick={() => dismiss(alert.id)}
              className="p-1 rounded hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
