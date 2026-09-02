import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useExplanation, usePrediction } from "@/hooks/usePulseFlow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContributingFactors } from "@/components/ContributingFactors";
import { getRiskColor, getRiskEmoji } from "@/types/pulseflow";
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Database,
  Cpu,
  BarChart3,
  Target,
} from "lucide-react";

export default function Explain() {
  const explanation = useExplanation();
  const prediction = usePrediction();
  const [showModelDetails, setShowModelDetails] = useState(false);

  const barData = explanation.topFactors.map((f) => ({
    name: f.factor.length > 18 ? f.factor.slice(0, 16) + "…" : f.factor,
    fullName: f.factor,
    importance: f.importance,
    direction: f.direction,
    description: f.description,
  }));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">
          Risk Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Contributing factors and model reasoning behind current risk levels
        </p>
      </motion.div>

      {/* Current risk banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="vintage-card rounded-xl p-6 bg-card"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">{getRiskEmoji(prediction.riskLevel)}</span>
          <div>
            <p className="text-xl font-bold" style={{ color: getRiskColor(prediction.riskLevel) }}>
              Predicted Risk: {Math.round(prediction.probability * 100)}% — {prediction.riskLevel}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{explanation.summary}</p>
          </div>
        </div>
      </motion.div>

      {/* Contributing factors — horizontal bars */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="vintage-card bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                  Top Contributing Factors
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">
                Relative weight of factors driving the current prediction
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={130}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
                          <p className="font-medium">{data.fullName}</p>
                          <p className="text-muted-foreground mt-1">{data.description}</p>
                          <p className="mt-1">
                            Direction:{" "}
                            <span
                              className="font-medium"
                              style={{
                                color:
                                  data.direction === "increases"
                                    ? "var(--risk-high)"
                                    : "var(--risk-low)",
                              }}
                            >
                              {data.direction === "increases" ? "↑ Increasing" : "↓ Decreasing"} risk
                            </span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                    {barData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.direction === "increases"
                            ? "var(--risk-high)"
                            : "var(--risk-low)"
                        }
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-6"
        >
          <Card className="vintage-card bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                  Detailed Factor Breakdown
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ContributingFactors factors={explanation.topFactors} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="vintage-card bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
              How the Prediction Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              {[                    { icon: Database, label: "Data Ingestion", desc: "Arrivals, beds, staff, wait times" },
                    { icon: Cpu, label: "Feature Engineering", desc: "15 derived metrics" },
                    { icon: BarChart3, label: "Model Inference", desc: "Random Forest classifier" },
                    { icon: Target, label: "Risk Score", desc: "0–100% overcrowding probability" },
                    { icon: Lightbulb, label: "Explanation", desc: "Top contributing factors" },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-2 flex-1">
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                      <step.icon className="w-5 h-5 text-accent" />
                    </div>
                    <p className="text-xs font-medium">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {step.desc}
                    </p>
                  </div>
                  {i < 4 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expandable model details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="vintage-card bg-card">
          <button
            onClick={() => setShowModelDetails(!showModelDetails)}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
              Model Details
            </CardTitle>
            {showModelDetails ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <AnimatePresence>
            {showModelDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        <strong>Algorithm:</strong> Random Forest (200 trees, max depth 12)
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Baseline:</strong> Logistic Regression (for comparison)
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Features:</strong> 15 engineered hospital operational metrics
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Training:</strong> 90-day synthetic dataset, time-aware split
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        <strong>Target:</strong> Binary overcrowding classification
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Horizons:</strong> 30, 60, 90, 120, 180 minutes
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Risk Bands:</strong> LOW (0–25%), MODERATE (25–50%), HIGH (50–75%), CRITICAL (75%+)
                      </p>
                      <p className="text-muted-foreground">
                        <strong>Explainability:</strong> Feature importance (Random Forest)
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-4">
                    Note: Contributing factors represent statistical associations identified by the model,
                    not clinically validated causal relationships.
                  </p>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
