import { motion } from "framer-motion";
import {
  useCurrentStatus,
  usePrediction,
  useExplanation,
  useRecommendations,
} from "@/hooks/usePulseFlow";
import { RiskCard } from "@/components/RiskCard";
import { MetricStrip } from "@/components/MetricStrip";
import { ContributingFactors } from "@/components/ContributingFactors";
import { AlertPanel } from "@/components/AlertPanel";
import { RecommendationPanel } from "@/components/RecommendationPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Lightbulb, Zap } from "lucide-react";

export default function Overview() {
  const status = useCurrentStatus();
  const prediction = usePrediction();
  const explanation = useExplanation();
  const recommendations = useRecommendations();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">
            ED Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time capacity monitoring and overcrowding early warning
          </p>
        </div>
      </motion.div>

      {/* Alerts */}
      <AlertPanel />

      {/* Metric strip */}
      <MetricStrip metrics={status.data} />

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Risk card — spans 2 cols */}
        <div className="col-span-2">
          <RiskCard prediction={prediction} />
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="vintage-card bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <CardTitle className="text-sm">Early Warning</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {prediction.predictedEvent
                    ? `Potential overcrowding detected approximately ${prediction.leadTimeMinutes} minutes ahead. Review forecast and prepare interventions.`
                    : "No overcrowding predicted in the near-term forecast. Conditions are within normal operating range."}
                </p>
                <div className="mt-3 p-2 rounded bg-background/50 text-xs text-muted-foreground">
                  {Math.round(prediction.probability * 100)}% probability
                  within {prediction.leadTimeMinutes} minutes
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="vintage-card bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <CardTitle className="text-sm">Capacity Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bed Usage</span>
                    <span className="font-medium tabular-nums">
                      {status.data.bedOccupancyPercent}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${status.data.bedOccupancyPercent}%`,
                        backgroundColor:
                          status.data.bedOccupancyPercent > 85
                            ? "var(--risk-high)"
                            : status.data.bedOccupancyPercent > 70
                            ? "var(--risk-moderate)"
                            : "var(--accent)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Staff Ratio</span>
                    <span className="font-medium tabular-nums">
                      {status.data.staffRatio}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          status.data.staffRatio * 100
                        )}%`,
                        backgroundColor:
                          status.data.staffRatio < 0.6
                            ? "var(--risk-high)"
                            : status.data.staffRatio < 0.8
                            ? "var(--risk-moderate)"
                            : "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Contributing factors + Recommendations */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="vintage-card bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                  Contributing Factors
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Model-derived factors influencing current risk assessment
              </p>
            </CardHeader>
            <CardContent>
              <ContributingFactors factors={explanation.topFactors} compact />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="vintage-card bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                  Recommended Actions
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Operational suggestions based on current conditions
              </p>
            </CardHeader>
            <CardContent>
              <RecommendationPanel recommendations={recommendations.slice(0, 4)} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="vintage-card bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground italic">
              "{explanation.summary}"
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-2">
              Model confidence: {Math.round(explanation.modelConfidence * 100)}%
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
