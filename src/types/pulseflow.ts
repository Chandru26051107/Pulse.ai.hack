// ============================================================
// PulseFlow AI — Type Definitions
// ============================================================

export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export interface HospitalMetrics {
  timestamp: number;
  hourOfDay: number;
  dayOfWeek: number;
  patientArrivals: number;
  arrivalsLast30Min: number;
  arrivalsLast1Hr: number;
  arrivalsLast3Hr: number;
  currentEDPatients: number;
  availableBeds: number;
  totalEDBeds: number;
  bedOccupancyPercent: number;
  availableStaff: number;
  totalStaff: number;
  staffRatio: number;
  averageWaitingTime: number;
  admissionsLast1Hr: number;
  dischargesLast1Hr: number;
  ambulanceArrivals: number;
  acuityScore: number;
  overcrowdingLabel: number;
}

export interface PredictionResult {
  probability: number;
  riskLevel: RiskLevel;
  leadTimeMinutes: number;
  confidence: number;
  predictedEvent: boolean;
}

export interface ForecastPoint {
  timestamp: number;
  horizonMinutes: number;
  probability: number;
  riskLevel: RiskLevel;
  patients: number;
  availableBeds: number;
  availableStaff: number;
  waitingTime: number;
}

export interface ContributingFactor {
  factor: string;
  value: number;
  direction: "increases" | "decreases";
  importance: number;
  description: string;
}

export interface Explanation {
  topFactors: ContributingFactor[];
  summary: string;
  modelConfidence: number;
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  recommendation: string;
  reason: string;
  relatedFactor: string;
}

export interface WhatIfInput {
  additionalBeds: number;
  additionalStaff: number;
  arrivalChangePercent: number;
  dischargeChangePercent: number;
}

export interface WhatIfResult {
  current: PredictionResult;
  simulated: PredictionResult;
  riskReduction: number;
  details: string;
}

export interface RiskHistoryEntry {
  timestamp: number;
  riskLevel: RiskLevel;
  probability: number;
  patients: number;
  bedOccupancy: number;
  waitingTime: number;
}

export interface Alert {
  id: string;
  timestamp: number;
  riskLevel: RiskLevel;
  probability: number;
  leadTimeMinutes: number;
  topFactor: string;
  dismissed: boolean;
}

export interface ScenarioConfig {
  name: string;
  description: string;
  patientArrivals: number;
  ambulanceArrivals: number;
  currentEDPatients: number;
  availableBeds: number;
  totalEDBeds: number;
  availableStaff: number;
  totalStaff: number;
  averageWaitingTime: number;
  admissionsLast1Hr: number;
  dischargesLast1Hr: number;
  acuityScore: number;
}

export interface SimulationState {
  active: boolean;
  scenario: string;
  currentMetrics: HospitalMetrics;
  history: HospitalMetrics[];
}

export type NavItem = {
  label: string;
  path: string;
  icon: string;
};

export const RISK_THRESHOLDS = {
  LOW: { min: 0, max: 0.25, color: "var(--risk-low)" },
  MODERATE: { min: 0.25, max: 0.5, color: "var(--risk-moderate)" },
  HIGH: { min: 0.5, max: 0.75, color: "var(--risk-high)" },
  CRITICAL: { min: 0.75, max: 1.0, color: "var(--risk-critical)" },
} as const;

export function getRiskLevel(probability: number): RiskLevel {
  if (probability < 0.25) return "LOW";
  if (probability < 0.5) return "MODERATE";
  if (probability < 0.75) return "HIGH";
  return "CRITICAL";
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "LOW": return "var(--risk-low)";
    case "MODERATE": return "var(--risk-moderate)";
    case "HIGH": return "var(--risk-high)";
    case "CRITICAL": return "var(--risk-critical)";
  }
}

export function getRiskBgClass(level: RiskLevel): string {
  switch (level) {
    case "LOW": return "bg-risk-low";
    case "MODERATE": return "bg-risk-moderate";
    case "HIGH": return "bg-risk-high";
    case "CRITICAL": return "bg-risk-critical";
  }
}

export function getRiskTextClass(level: RiskLevel): string {
  switch (level) {
    case "LOW": return "text-risk-low";
    case "MODERATE": return "text-risk-moderate";
    case "HIGH": return "text-risk-high";
    case "CRITICAL": return "text-risk-critical";
  }
}

export function getRiskBorderClass(level: RiskLevel): string {
  switch (level) {
    case "LOW": return "border-risk-low";
    case "MODERATE": return "border-risk-moderate";
    case "HIGH": return "border-risk-high";
    case "CRITICAL": return "border-risk-critical";
  }
}

export function getRiskEmoji(level: RiskLevel): string {
  switch (level) {
    case "LOW": return "🟢";
    case "MODERATE": return "🟡";
    case "HIGH": return "🟠";
    case "CRITICAL": return "🔴";
  }
}
