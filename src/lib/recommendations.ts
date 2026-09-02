// PulseFlow AI — Recommendation Engine
// Rule-based operational suggestions (non-clinical)

import type { HospitalMetrics, Recommendation, PredictionResult } from "@/types/pulseflow";

let recId = 0;
function nextId(): string {
  return `rec-${++recId}`;
}

export function generateRecommendations(
  metrics: HospitalMetrics,
  prediction: PredictionResult
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Bed pressure
  if (metrics.bedOccupancyPercent > 85) {
    recs.push({
      id: nextId(),
      priority: "high",
      recommendation: "Prepare additional bed capacity or expedite discharges",
      reason: `Bed occupancy is at ${metrics.bedOccupancyPercent}% — above the 85% threshold for safe operations.`,
      relatedFactor: "Bed Occupancy",
    });
  } else if (metrics.bedOccupancyPercent > 70) {
    recs.push({
      id: nextId(),
      priority: "medium",
      recommendation: "Monitor bed utilization closely",
      reason: `Bed occupancy is at ${metrics.bedOccupancyPercent}% and trending upward.`,
      relatedFactor: "Bed Occupancy",
    });
  }

  // Staff ratio
  if (metrics.staffRatio < 0.6) {
    recs.push({
      id: nextId(),
      priority: "high",
      recommendation: "Call in additional nursing and support staff",
      reason: `Staff-to-patient ratio is critically low at ${metrics.staffRatio}. Current staff: ${metrics.availableStaff}.`,
      relatedFactor: "Staff Availability",
    });
  } else if (metrics.staffRatio < 0.8) {
    recs.push({
      id: nextId(),
      priority: "medium",
      recommendation: "Review staffing levels for the current shift",
      reason: `Staff ratio at ${metrics.staffRatio} is below optimal levels.`,
      relatedFactor: "Staff Availability",
    });
  }

  // Rising arrivals
  if (metrics.arrivalsLast1Hr > 10) {
    recs.push({
      id: nextId(),
      priority: "high",
      recommendation: "Prepare for increased incoming patient volume",
      reason: `${metrics.arrivalsLast1Hr} arrivals in the last hour — above normal capacity.`,
      relatedFactor: "Patient Arrival Rate",
    });
  }

  // Waiting time
  if (metrics.averageWaitingTime > 45) {
    recs.push({
      id: nextId(),
      priority: "high",
      recommendation: "Activate overflow protocols and expedite triage",
      reason: `Average wait time of ${metrics.averageWaitingTime} minutes exceeds the 45-minute threshold.`,
      relatedFactor: "Waiting Time",
    });
  } else if (metrics.averageWaitingTime > 30) {
    recs.push({
      id: nextId(),
      priority: "medium",
      recommendation: "Review patient flow bottlenecks",
      reason: `Wait time of ${metrics.averageWaitingTime} minutes is approaching concerning levels.`,
      relatedFactor: "Waiting Time",
    });
  }

  // Discharge rate
  if (metrics.dischargesLast1Hr < 2 && metrics.currentEDPatients > 15) {
    recs.push({
      id: nextId(),
      priority: "medium",
      recommendation: "Review pending discharge workflow",
      reason: `Only ${metrics.dischargesLast1Hr} discharges with ${metrics.currentEDPatients} patients — low throughput.`,
      relatedFactor: "Discharge Rate",
    });
  }

  // Ambulance arrivals
  if (metrics.ambulanceArrivals > 4) {
    recs.push({
      id: nextId(),
      priority: "medium",
      recommendation: "Alert receiving units for incoming emergency transfers",
      reason: `${metrics.ambulanceArrivals} ambulance arrivals — higher than typical volume.`,
      relatedFactor: "Ambulance Arrivals",
    });
  }

  // Predictive
  if (prediction.predictedEvent) {
    recs.push({
      id: nextId(),
      priority: "high",
      recommendation: `Overcrowding predicted within ${prediction.leadTimeMinutes} minutes — activate early warning protocols`,
      reason: `AI model predicts ${Math.round(prediction.probability * 100)}% probability of overcrowding.`,
      relatedFactor: "Predictive Model",
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs.length > 0
    ? recs
    : [
        {
          id: nextId(),
          priority: "low" as const,
          recommendation: "No immediate action required — conditions are within normal parameters",
          reason: "All monitored metrics are within acceptable ranges.",
          relatedFactor: "Overall Status",
        },
      ];
}
