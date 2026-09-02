import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  useSimulation,
  useCurrentStatus,
  usePrediction,
} from "@/hooks/usePulseFlow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getRiskColor,
  getRiskEmoji,
} from "@/types/pulseflow";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Users,
  Bed,
  Clock,
  Activity,
} from "lucide-react";

const SCENARIOS = [
  {
    key: "normal",
    label: "Normal Operations",
    desc: "Standard day with steady patient flow",
    emoji: "🟢",
  },
  {
    key: "demand_surge",
    label: "Demand Surge",
    desc: "Gradual increase in patient arrivals",
    emoji: "🟡",
  },
  {
    key: "emergency_surge",
    label: "Emergency Surge",
    desc: "Sudden influx from a major incident",
    emoji: "🔴",
  },
  {
    key: "bed_shortage",
    label: "Bed Shortage",
    desc: "Multiple beds temporarily unavailable",
    emoji: "🟠",
  },
  {
    key: "staff_shortage",
    label: "Staff Shortage",
    desc: "Reduced staffing levels",
    emoji: "🟠",
  },
  {
    key: "recovery",
    label: "Recovery",
    desc: "Conditions improving with intervention",
    emoji: "🟢",
  },
];

export default function Demo() {
  const navigate = useNavigate();
  const {
    active,
    scenario,
    start,
    reset,
  } = useSimulation();
  const status = useCurrentStatus();
  const prediction = usePrediction();
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    "Start Normal Operations",
    "Trigger Emergency Surge",
    "Observe Risk Escalation",
    "View Explanation",
    "Test Intervention",
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">
          Live Simulation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Deterministic scenario walkthrough — same sequence every time
        </p>
      </motion.div>

      {/* Demo steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="vintage-card bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
              Walkthrough Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {demoSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                      i <= currentStep
                        ? "bg-primary/10 text-primary font-medium"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                  {i < demoSteps.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Scenario selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            onClick={() => {
              start(s.key);
              setCurrentStep(s.key === "emergency_surge" ? 1 : 0);
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              active && scenario === s.key
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-card/80"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{s.emoji}</span>
              <span className="text-sm font-medium">{s.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
            {active && scenario === s.key && (
              <div className="mt-2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] text-primary font-medium">
                  ACTIVE
                </span>
              </div>
            )}
          </button>
        ))}
      </motion.div>

      {/* Live status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Patients", value: status.data.currentEDPatients, icon: Users },
          { label: "Beds Free", value: status.data.availableBeds, icon: Bed },
          { label: "Wait Time", value: `${status.data.averageWaitingTime}min`, icon: Clock },
          { label: "Risk", value: `${Math.round(prediction.probability * 100)}%`, icon: Activity },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Card className="vintage-card bg-card">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums metric-value">
                    {item.value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Current risk display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="vintage-card rounded-xl p-8 bg-card text-center"
      >
        <span className="text-4xl">{getRiskEmoji(prediction.riskLevel)}</span>
        <p
          className="text-4xl font-bold mt-3 metric-value"
          style={{ color: getRiskColor(prediction.riskLevel) }}
        >
          {prediction.riskLevel}
        </p>
        <p className="text-lg text-muted-foreground mt-1">
          {Math.round(prediction.probability * 100)}% probability
        </p>
        {prediction.predictedEvent && (
          <p className="text-sm text-risk-high mt-3">
            ⚠ Potential overcrowding detected approximately {prediction.leadTimeMinutes} minutes
            ahead
          </p>
        )}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              start("emergency_surge");
              setCurrentStep(1);
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Play className="w-4 h-4 inline mr-1" />
            Start Emergency Surge
          </button>
          <button
            onClick={() => {
              reset();
              setCurrentStep(0);
            }}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 inline mr-1" />
            Reset
          </button>
        </div>
      </motion.div>

      {/* Sign-off */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-4"
      >
        <p className="text-lg font-[family-name:var(--font-playfair)] font-bold text-accent">
          pulseflow.ai — Predict. Explain. Prepare.
        </p>
      </motion.div>
    </div>
  );
}
