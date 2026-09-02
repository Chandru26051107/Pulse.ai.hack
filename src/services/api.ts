// PulseFlow AI — API Service Layer
// Combines synthetic data, ML predictions, and recommendations

import type {
  HospitalMetrics,
  PredictionResult,
  ForecastPoint,
  Explanation,
  Recommendation,
  WhatIfInput,
  WhatIfResult,
  RiskHistoryEntry,
  ScenarioConfig,
} from "@/types/pulseflow";
import { getRiskLevel } from "@/types/pulseflow";
import {
  generateHospitalData,
  generateCurrentState,
  SCENARIOS,
  DEFAULT_CONFIG,
} from "@/lib/dataGenerator";
import {
  predictOvercrowding,
  generateForecast,
  explainPrediction,
} from "@/lib/mlEngine";
import { generateRecommendations } from "@/lib/recommendations";

// ============================================================
// State management — in-memory store for demo mode
// ============================================================
let cachedData: HospitalMetrics[] | null = null;
let currentMetrics: HospitalMetrics = generateCurrentState();
let simulationActive = false;
let simulationScenario = "normal";
let simulationHistory: HospitalMetrics[] = [];
let riskHistory: RiskHistoryEntry[] = [];

// ============================================================
// Data access
// ============================================================
export function getHospitalData(): HospitalMetrics[] {
  if (!cachedData) {
    cachedData = generateHospitalData(DEFAULT_CONFIG);
  }
  return cachedData;
}

export function getCurrentStatus(): HospitalMetrics {
  return { ...currentMetrics };
}

export function setCurrentMetrics(metrics: HospitalMetrics) {
  currentMetrics = { ...metrics };
}

export function getPrediction(): PredictionResult {
  return predictOvercrowding(currentMetrics);
}

export function getForecast(): ForecastPoint[] {
  return generateForecast(currentMetrics);
}

export function getExplanation(): Explanation {
  return explainPrediction(currentMetrics);
}

export function getRecommendations(): Recommendation[] {
  const prediction = predictOvercrowding(currentMetrics);
  return generateRecommendations(currentMetrics, prediction);
}

export function getRiskHistory(): RiskHistoryEntry[] {
  // Combine historical data with current simulation data
  if (riskHistory.length === 0) {
    const data = getHospitalData();
    riskHistory = data
      .filter((_, i) => i % 6 === 0)
      .map((m) => {
        const pred = predictOvercrowding(m);
        return {
          timestamp: m.timestamp,
          riskLevel: pred.riskLevel,
          probability: pred.probability,
          patients: m.currentEDPatients,
          bedOccupancy: m.bedOccupancyPercent,
          waitingTime: m.averageWaitingTime,
        };
      });
  }
  return [...riskHistory];
}

// ============================================================
// What-if simulation
// ============================================================
export function processWhatIf(input: WhatIfInput): WhatIfResult {
  const current = predictOvercrowding(currentMetrics);

  const modified: HospitalMetrics = {
    ...currentMetrics,
    totalEDBeds: currentMetrics.totalEDBeds + input.additionalBeds,
    availableBeds:
      currentMetrics.availableBeds + input.additionalBeds,
    bedOccupancyPercent: Math.round(
      (currentMetrics.currentEDPatients /
        (currentMetrics.totalEDBeds + input.additionalBeds)) *
        100
    ),
    availableStaff: currentMetrics.availableStaff + input.additionalStaff,
    staffRatio: parseFloat(
      (
        (currentMetrics.availableStaff + input.additionalStaff) /
        Math.max(currentMetrics.currentEDPatients, 1)
      ).toFixed(2)
    ),
    patientArrivals: Math.round(
      currentMetrics.patientArrivals * (1 + input.arrivalChangePercent / 100)
    ),
    arrivalsLast1Hr: Math.round(
      currentMetrics.arrivalsLast1Hr * (1 + input.arrivalChangePercent / 100)
    ),
    dischargesLast1Hr: Math.round(
      currentMetrics.dischargesLast1Hr * (1 + input.dischargeChangePercent / 100)
    ),
  };

  const simulated = predictOvercrowding(modified);
  const riskReduction = parseFloat(
    ((current.probability - simulated.probability) * 100).toFixed(1)
  );

  return {
    current,
    simulated,
    riskReduction,
    details: `Simulated changes: +${input.additionalBeds} beds, +${input.additionalStaff} staff, ${input.arrivalChangePercent > 0 ? "+" : ""}${input.arrivalChangePercent}% arrivals, ${input.dischargeChangePercent > 0 ? "+" : ""}${input.dischargeChangePercent}% discharges.`,
  };
}

// ============================================================
// Scenario presets for the what-if simulator
// ============================================================
export const WHAT_IF_PRESETS: Record<
  string,
  { label: string; input: WhatIfInput; description: string }
> = {
  normal: {
    label: "Normal Operations",
    description: "Standard operating conditions",
    input: { additionalBeds: 0, additionalStaff: 0, arrivalChangePercent: 0, dischargeChangePercent: 0 },
  },
  demand_surge: {
    label: "Demand Surge",
    description: "40% increase in patient arrivals",
    input: { additionalBeds: 0, additionalStaff: 0, arrivalChangePercent: 40, dischargeChangePercent: 0 },
  },
  bed_shortage: {
    label: "Bed Shortage",
    description: "8 beds temporarily unavailable",
    input: { additionalBeds: -8, additionalStaff: 0, arrivalChangePercent: 0, dischargeChangePercent: 0 },
  },
  staff_shortage: {
    label: "Staff Shortage",
    description: "5 staff members unavailable",
    input: { additionalBeds: 0, additionalStaff: -5, arrivalChangePercent: 0, dischargeChangePercent: 0 },
  },
  recovery: {
    label: "Recovery",
    description: "Adding beds and staff to reduce pressure",
    input: { additionalBeds: 500, additionalStaff: 400, arrivalChangePercent: -15, dischargeChangePercent: 20 },
  },
};

// ============================================================
// Live simulation
// ============================================================
export function startSimulation(scenario: string): SimulationState {
  simulationActive = true;
  simulationScenario = scenario;
  currentMetrics = generateCurrentState();

  // Apply initial scenario
  const scenarioFn = SCENARIOS[scenario];
  if (scenarioFn) {
    currentMetrics = scenarioFn(currentMetrics);
  }

  simulationHistory = [{ ...currentMetrics }];

  return getSimulationStatus();
}

export function advanceSimulation(): SimulationState {
  if (!simulationActive) return getSimulationStatus();

  // Evolve metrics based on scenario
  const scenarioFn = SCENARIOS[simulationScenario];
  if (scenarioFn) {
    // Gradually shift current state
    const base = { ...currentMetrics };
    currentMetrics = scenarioFn(base);

    // Small random variation
    currentMetrics.currentEDPatients = Math.max(
      0,
      currentMetrics.currentEDPatients + Math.round((Math.random() - 0.4) * 3)
    );
    currentMetrics.averageWaitingTime = Math.max(
      2,
      currentMetrics.averageWaitingTime + Math.round((Math.random() - 0.3) * 4)
    );

    // Derived values
    currentMetrics.bedOccupancyPercent = Math.round(
      (currentMetrics.currentEDPatients / currentMetrics.totalEDBeds) * 100
    );
    currentMetrics.availableBeds = Math.max(
      0,
      currentMetrics.totalEDBeds - currentMetrics.currentEDPatients
    );

    simulationHistory.push({ ...currentMetrics });
  }

  return getSimulationStatus();
}

export function resetSimulation(): SimulationState {
  simulationActive = false;
  simulationScenario = "normal";
  currentMetrics = generateCurrentState();
  simulationHistory = [];
  return getSimulationStatus();
}

export function getSimulationStatus() {
  return {
    active: simulationActive,
    scenario: simulationScenario,
    currentMetrics: { ...currentMetrics },
    history: [...simulationHistory],
  };
}

// ============================================================
// Analytics / history stats
// ============================================================
export function getHistoryStats() {
  const data = getHospitalData().slice(-168); // Last 7 days
  const predictions = data.map((m) => predictOvercrowding(m));

  const peakOccupancy = Math.max(...data.map((m) => m.bedOccupancyPercent));
  const peakWaitTime = Math.max(...data.map((m) => m.averageWaitingTime));
  const highestRisk = Math.max(...predictions.map((p) => p.probability));
  const highRiskCount = predictions.filter(
    (p) => p.riskLevel === "HIGH" || p.riskLevel === "CRITICAL"
  ).length;

  // Average waiting time trend (hourly buckets)
  const avgWaitByHour = Array(24)
    .fill(0)
    .map((_, hour) => {
      const hourData = data.filter((m) => m.hourOfDay === hour);
      return hourData.length > 0
        ? Math.round(
            hourData.reduce((sum, m) => sum + m.averageWaitingTime, 0) /
              hourData.length
          )
        : 0;
    });

  // Occupancy trend (daily)
  const dailyOccupancy = Array(7)
    .fill(0)
    .map((_, day) => {
      const dayData = data.filter((m) => m.dayOfWeek === day);
      return dayData.length > 0
        ? Math.round(
            dayData.reduce((sum, m) => sum + m.bedOccupancyPercent, 0) /
              dayData.length
          )
        : 0;
    });

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return {
    peakOccupancy,
    peakWaitTime,
    highestRisk: parseFloat(highestRisk.toFixed(3)),
    highRiskCount,
    avgWaitByHour: avgWaitByHour.map((w, i) => ({ hour: i, avgWait: w })),
    dailyOccupancy: dailyOccupancy.map((o, i) => ({ day: dayNames[i], avgOccupancy: o })),
    totalRecords: data.length,
  };
}

// ============================================================
// Type for simulation state used internally
// ============================================================
interface SimulationState {
  active: boolean;
  scenario: string;
  currentMetrics: HospitalMetrics;
  history: HospitalMetrics[];
}
