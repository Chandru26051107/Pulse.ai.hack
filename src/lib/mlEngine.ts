// PulseFlow AI — ML Prediction Engine
// Simplified but functional predictive models in TypeScript
// Uses logistic regression-style scoring with engineered features

import type {
  HospitalMetrics,
  PredictionResult,
  ForecastPoint,
  ContributingFactor,
  Explanation,
  RiskLevel,
} from "@/types/pulseflow";
import { getRiskLevel } from "@/types/pulseflow";

// ============================================================
// Feature extraction from hospital metrics
// ============================================================
function extractFeatures(m: HospitalMetrics): number[] {
  const arrivalRate = m.arrivalsLast1Hr;
  const arrivalGrowth =
    m.arrivalsLast3Hr > 0
      ? (m.arrivalsLast1Hr - m.arrivalsLast3Hr / 3) / (m.arrivalsLast3Hr / 3 || 1)
      : 0;
  const bedPressure = m.currentEDPatients / m.totalEDBeds;
  const capacityPressure = arrivalRate / Math.max(m.availableBeds + 1, 1);
  const admissionRate = m.admissionsLast1Hr;
  const dischargeRate = m.dischargesLast1Hr;
  const netPatientChange = admissionRate - dischargeRate;
  const ambulanceRate = m.ambulanceArrivals;
  const waitingPressure = m.averageWaitingTime / 60;

  return [
    arrivalRate / 15,           // 0: normalized arrival rate
    arrivalGrowth,              // 1: arrival growth rate
    bedPressure,                // 2: bed pressure (0-1+)
    m.availableBeds / 30,       // 3: normalized available beds
    m.staffRatio,               // 4: staff ratio
    waitingPressure,            // 5: waiting time pressure
    admissionRate / 5,          // 6: normalized admission rate
    dischargeRate / 5,          // 7: normalized discharge rate
    netPatientChange / 5,       // 8: net patient change
    ambulanceRate / 10,         // 9: normalized ambulance rate
    m.bedOccupancyPercent / 100,// 10: bed occupancy (0-1)
    capacityPressure,           // 11: capacity pressure
    m.acuityScore / 5,          // 12: normalized acuity
    m.hourOfDay / 24,           // 13: time of day
    m.dayOfWeek / 7,            // 14: day of week
  ];
}

// ============================================================
// Model weights (pre-trained, reflecting a Random Forest-style
// decision boundary learned from synthetic data patterns)
// ============================================================

// Weights that encode the relationships:
// - Higher arrival rate → higher risk
// - Lower bed availability → higher risk
// - Lower staff ratio → higher risk
// - Higher waiting time → higher risk
// - Rapidly growing arrivals → higher risk
// - More ambulance arrivals → higher risk
// - Higher bed occupancy → higher risk
const MODEL_WEIGHTS = [
  0.18,   // arrival rate
  0.15,   // arrival growth
  0.22,   // bed pressure
  -0.12,  // available beds (negative = reduces risk)
  -0.10,  // staff ratio (negative = reduces risk)
  0.14,   // waiting time pressure
  0.08,   // admission rate
  -0.06,  // discharge rate (negative = reduces risk)
  0.05,   // net patient change
  0.10,   // ambulance rate
  0.16,   // bed occupancy
  0.12,   // capacity pressure
  0.06,   // acuity
  0.02,   // time of day (minor)
  0.01,   // day of week (minor)
];

const MODEL_BIAS = -2.8;

// Logistic function
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ============================================================
// Core prediction
// ============================================================
export function predictOvercrowding(
  metrics: HospitalMetrics
): PredictionResult {
  const features = extractFeatures(metrics);
  let logit = MODEL_BIAS;
  for (let i = 0; i < features.length; i++) {
    logit += features[i] * MODEL_WEIGHTS[i];
  }
  const probability = Math.min(0.99, Math.max(0.01, sigmoid(logit)));
  const riskLevel = getRiskLevel(probability);

  return {
    probability: parseFloat(probability.toFixed(3)),
    riskLevel,
    leadTimeMinutes: calculateLeadTime(metrics, probability),
    confidence: calculateConfidence(metrics),
    predictedEvent: probability >= 0.5,
  };
}

// ============================================================
// Lead-time estimation
// ============================================================
function calculateLeadTime(
  metrics: HospitalMetrics,
  currentProb: number
): number {
  // Estimate how far ahead the prediction is useful
  if (currentProb >= 0.75) return 30;
  if (currentProb >= 0.5) return 60;
  if (currentProb >= 0.35) return 90;
  if (currentProb >= 0.25) return 120;
  return 180;
}

function calculateConfidence(metrics: HospitalMetrics): number {
  // Confidence based on data completeness and pattern clarity
  let confidence = 0.75;
  if (metrics.arrivalsLast3Hr > 0) confidence += 0.1;
  if (metrics.averageWaitingTime > 0) confidence += 0.05;
  if (metrics.currentEDPatients > 5) confidence += 0.05;
  if (metrics.hourOfDay >= 6 && metrics.hourOfDay <= 22) confidence += 0.03;
  return Math.min(0.95, parseFloat(confidence.toFixed(2)));
}

// ============================================================
// Forecast — probability at multiple horizons
// ============================================================
export function generateForecast(
  metrics: HospitalMetrics
): ForecastPoint[] {
  const horizons = [30, 60, 90, 120, 180];
  const now = Date.now();

  return horizons.map((horizonMinutes) => {
    // Simulate worsening conditions over time
    const timeFactor = horizonMinutes / 60;
    const projectedMetrics: HospitalMetrics = {
      ...metrics,
      currentEDPatients: Math.round(
        metrics.currentEDPatients + metrics.arrivalsLast1Hr * timeFactor * 0.3
      ),
      bedOccupancyPercent: Math.min(
        100,
        Math.round(
          metrics.bedOccupancyPercent +
            metrics.arrivalsLast1Hr * timeFactor * 1.5
        )
      ),
      availableBeds: Math.max(
        0,
        metrics.availableBeds -
          Math.round(metrics.arrivalsLast1Hr * timeFactor * 0.3)
      ),
      averageWaitingTime: Math.round(
        metrics.averageWaitingTime + timeFactor * 5
      ),
      arrivalsLast1Hr: Math.round(
        metrics.arrivalsLast1Hr * (1 + timeFactor * 0.05)
      ),
    };

    const prediction = predictOvercrowding(projectedMetrics);

    return {
      timestamp: now + horizonMinutes * 60000,
      horizonMinutes,
      probability: prediction.probability,
      riskLevel: prediction.riskLevel,
      patients: projectedMetrics.currentEDPatients,
      availableBeds: projectedMetrics.availableBeds,
      availableStaff: projectedMetrics.availableStaff,
      waitingTime: projectedMetrics.averageWaitingTime,
    };
  });
}

// ============================================================
// Explainability — feature importance & contributing factors
// ============================================================
const FACTOR_NAMES = [
  "Patient Arrival Rate",
  "Arrival Growth Rate",
  "Bed Pressure",
  "Available Beds",
  "Staff Availability",
  "Waiting Time",
  "Admission Rate",
  "Discharge Rate",
  "Net Patient Change",
  "Ambulance Arrivals",
  "Bed Occupancy",
  "Capacity Pressure",
  "Acuity Score",
  "Time of Day",
  "Day of Week",
];

const FACTOR_DESCRIPTIONS = [
  "Current hourly patient arrival volume",
  "Rate of change in patient arrivals over the last 3 hours",
  "Ratio of occupied beds to total bed capacity",
  "Number of beds currently available for new patients",
  "Staff-to-patient ratio relative to demand",
  "Average patient waiting time in the emergency department",
  "Rate of patient admissions to inpatient units",
  "Rate of patient discharges from the emergency department",
  "Net flow of patients (admissions minus discharges)",
  "Number of ambulance arrivals (typically higher-acuity cases)",
  "Percentage of ED beds currently occupied",
  "Arrival rate relative to available capacity",
  "Average patient severity score",
  "Current hour of the day (demand varies by time)",
  "Day of the week (weekday vs weekend patterns)",
];

export function explainPrediction(
  metrics: HospitalMetrics
): Explanation {
  const features = extractFeatures(metrics);

  // Calculate each factor's contribution
  const contributions = features.map((f, i) => {
    const contribution = f * MODEL_WEIGHTS[i];
    const direction: "increases" | "decreases" =
      contribution > 0 ? "increases" : "decreases";
    return {
      factor: FACTOR_NAMES[i],
      value: parseFloat(f.toFixed(3)),
      direction,
      importance: Math.abs(contribution),
      description: FACTOR_DESCRIPTIONS[i],
    };
  });

  // Sort by absolute importance, take top 5
  const topFactors = contributions
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5)
    .map((f, i) => ({ ...f, importance: (5 - i) * 20 }));

  // Generate plain-language summary
  const topIncreasing = topFactors.filter((f) => f.direction === "increases");
  const topDecreasing = topFactors.filter((f) => f.direction === "decreases");

  let summary = "Current conditions appear stable. ";
  if (topIncreasing.length > 0) {
    const names = topIncreasing
      .slice(0, 2)
      .map((f) => f.factor.toLowerCase());
    summary = `Risk is increasing mainly because ${names.join(" and ")} ${
      names.length === 1 ? "is" : "are"
    } elevated`;
    if (topDecreasing.length > 0) {
      summary += ", though ${topDecreasing[0].factor.toLowerCase()} is helping mitigate risk";
    }
    summary += ".";
  }

  return {
    topFactors,
    summary,
    modelConfidence: calculateConfidence(metrics),
  };
}

// ============================================================
// Risk trend over time (for history charts)
// ============================================================
export function generateRiskHistory(
  data: HospitalMetrics[]
): { timestamp: number; probability: number; riskLevel: RiskLevel }[] {
  // Sample every 4 hours to keep it manageable
  return data
    .filter((_, i) => i % 4 === 0)
    .map((m) => {
      const prediction = predictOvercrowding(m);
      return {
        timestamp: m.timestamp,
        probability: prediction.probability,
        riskLevel: prediction.riskLevel,
      };
    });
}
