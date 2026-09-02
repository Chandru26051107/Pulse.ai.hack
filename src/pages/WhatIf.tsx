import { useState } from "react";
import { motion } from "framer-motion";
import { useWhatIf, usePrediction } from "@/hooks/usePulseFlow";
import { WHAT_IF_PRESETS } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRiskColor, getRiskEmoji, type WhatIfInput } from "@/types/pulseflow";
import {
  GitBranch,
  Play,
  RotateCcw,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";

export default function WhatIf() {
  const prediction = usePrediction();
  const { result, loading, simulate } = useWhatIf();
  const [input, setInput] = useState<WhatIfInput>({
    additionalBeds: 0,
    additionalStaff: 0,
    arrivalChangePercent: 0,
    dischargeChangePercent: 0,
  });

  const applyPreset = (key: string) => {
    const preset = WHAT_IF_PRESETS[key];
    if (preset) {
      setInput(preset.input);
      simulate(preset.input);
    }
  };

  const updateInput = (field: keyof WhatIfInput, value: number) => {
    const newInput = { ...input, [field]: value };
    setInput(newInput);
  };

  const runSimulation = () => {
    simulate(input);
  };

  const resetInput = () => {
    const defaultInput: WhatIfInput = {
      additionalBeds: 0,
      additionalStaff: 0,
      arrivalChangePercent: 0,
      dischargeChangePercent: 0,
    };
    setInput(defaultInput);
    simulate(defaultInput);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">
          Scenario Simulator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Model the impact of operational changes on predicted overcrowding risk
        </p>
      </motion.div>

      {/* Scenario presets */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {Object.entries(WHAT_IF_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card hover:bg-accent/10 hover:border-accent/30 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="vintage-card bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-accent" />
                <CardTitle className="text-sm font-[family-name:var(--font-playfair)]">
                  Intervention Controls
                </CardTitle>
              </div>                <p className="text-xs text-muted-foreground">
                  Modify variables and run the model to estimate impact
                </p>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Additional Beds */}
              <SliderControl
                label="Additional Beds"
                value={input.additionalBeds}
                min={-2000}
                max={2000}
                onChange={(v) => updateInput("additionalBeds", v)}
                unit=" beds"
              />

              {/* Additional Staff */}
              <SliderControl
                label="Additional Staff"
                value={input.additionalStaff}
                min={-1500}
                max={1500}
                onChange={(v) => updateInput("additionalStaff", v)}
                unit=" staff"
              />

              {/* Arrival Change */}
              <SliderControl
                label="Arrival Change"
                value={input.arrivalChangePercent}
                min={-30}
                max={50}
                onChange={(v) => updateInput("arrivalChangePercent", v)}
                unit="%"
                showSign
              />

              {/* Discharge Change */}
              <SliderControl
                label="Discharge Change"
                value={input.dischargeChangePercent}
                min={-30}
                max={50}
                onChange={(v) => updateInput("dischargeChangePercent", v)}
                unit="%"
                showSign
              />

              {/* Action buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={runSimulation}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  {loading ? "Simulating..." : "Run Simulation"}
                </button>
                <button
                  onClick={resetInput}
                  className="px-3 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {result ? (
            <>
              {/* Before / After comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="vintage-card bg-card">
                  <CardContent className="pt-5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      Current
                    </p>
                    <p className="text-3xl font-bold tabular-nums metric-value" style={{ color: getRiskColor(result.current.riskLevel) }}>
                      {Math.round(result.current.probability * 100)}%
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span>{getRiskEmoji(result.current.riskLevel)}</span>
                      <span className="text-sm font-semibold" style={{ color: getRiskColor(result.current.riskLevel) }}>
                        {result.current.riskLevel}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="vintage-card bg-card border-accent/30">
                  <CardContent className="pt-5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      Simulated
                    </p>
                    <p className="text-3xl font-bold tabular-nums metric-value" style={{ color: getRiskColor(result.simulated.riskLevel) }}>
                      {Math.round(result.simulated.probability * 100)}%
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span>{getRiskEmoji(result.simulated.riskLevel)}</span>
                      <span className="text-sm font-semibold" style={{ color: getRiskColor(result.simulated.riskLevel) }}>
                        {result.simulated.riskLevel}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk reduction summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`vintage-card rounded-xl p-5 bg-card text-center ${
                  result.riskReduction > 0
                    ? "border-risk-low/40"
                    : result.riskReduction < 0
                    ? "border-risk-high/40"
                    : ""
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{
                      color:
                        result.riskReduction > 0
                          ? "var(--risk-low)"
                          : result.riskReduction < 0
                          ? "var(--risk-high)"
                          : "var(--muted-foreground)",
                    }}
                  >
                    {result.riskReduction > 0 ? "↓" : result.riskReduction < 0 ? "↑" : "—"}{" "}
                    {Math.abs(result.riskReduction)} percentage points
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {result.riskReduction > 0
                    ? "Risk reduced by simulated intervention"
                    : result.riskReduction < 0
                    ? "Risk increased under these conditions"
                    : "No change in predicted risk"}
                </p>
              </motion.div>

              {/* Details */}
              <Card className="vintage-card bg-card">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">{result.details}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    Simulation — model estimate. Results reflect projected conditions based on current data patterns.
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="vintage-card bg-card h-full">
              <CardContent className="pt-5 flex flex-col items-center justify-center text-center h-64">
                <GitBranch className="w-8 h-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Configure the controls or select a scenario preset to run a simulation
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  Results will appear here as a before-and-after comparison
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Slider control component
function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
  unit,
  showSign = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  unit: string;
  showSign?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange(Math.max(min, value - 1))}
            className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-accent/10 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-16 text-center text-sm font-bold tabular-nums">
            {showSign && value > 0 ? "+" : ""}
            {value}
            {unit}
          </span>
          <button
            onClick={() => onChange(Math.min(max, value + 1))}
            className="w-6 h-6 rounded border border-border flex items-center justify-center text-muted-foreground hover:bg-accent/10 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="h-1.5 rounded-full bg-border/40" />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-0 left-0 h-1.5 rounded-full bg-accent pointer-events-none"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-[-3px] w-3 h-3 rounded-full bg-accent border-2 border-card shadow-sm pointer-events-none"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
    </div>
  );
}
