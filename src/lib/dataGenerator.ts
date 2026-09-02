// PulseFlow AI — Synthetic Hospital Data Generator
// Generates internally consistent, realistic ED operational data

import type { HospitalMetrics } from "@/types/pulseflow";

// Deterministic pseudo-random number generator (seeded)
function mulberry32(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function randomBetween(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

// Hourly arrival rate pattern (0-23 hours)
// Higher during day, peaks at 10-12 and 14-16, lower at night
const HOURLY_ARRIVAL_BASE = [
  3, 2, 2, 1, 1, 2, 3, 5, 7, 9, 10, 11, 10, 9, 10, 9, 8, 7, 6, 5, 5, 4, 4, 3,
];

// Day-of-week multiplier (0=Sunday)
const DAY_MULTIPLIER = [0.85, 1.05, 1.0, 1.1, 1.1, 1.15, 0.9, 0.85];

export interface GenerationConfig {
  startDate: string;
  days: number;
  totalBeds: number;
  totalStaff: number;
}

export const DEFAULT_CONFIG: GenerationConfig = {
  startDate: "2026-03-01",
  days: 90,
  totalBeds: 30,
  totalStaff: 24,
};

export function generateHospitalData(
  config: GenerationConfig = DEFAULT_CONFIG
): HospitalMetrics[] {
  const data: HospitalMetrics[] = [];
  const startDate = new Date(config.startDate + "T00:00:00");
  const totalHours = config.days * 24;

  // Running state
  let currentPatients = 15;
  let currentBeds = config.totalBeds;
  let currentStaff = 16;
  let arrivalBuffer: number[] = [];
  let lastAdmissions = 0;
  let lastDischarges = 0;

  // Surge events — predefined timestamps where demand spikes
  const surgeHours = new Set<number>();
  const majorEventHours = new Set<number>();

  // Add a few gradual surges
  for (let i = 0; i < Math.floor(config.days / 10); i++) {
    const surgeStart = randomBetween(100 + i * 200, 200 + i * 200);
    for (let h = 0; h < randomBetween(6, 12); h++) {
      surgeHours.add(surgeStart + h);
    }
  }

  // Add 2-3 major overcrowding events
  for (let i = 0; i < 3; i++) {
    const eventHour = randomBetween(300 + i * 400, 500 + i * 400);
    for (let h = 0; h < 15; h++) {
      majorEventHours.add(eventHour + h);
    }
  }

  for (let hourIdx = 0; hourIdx < totalHours; hourIdx++) {
    const timestamp = new Date(startDate.getTime() + hourIdx * 3600000);
    const hourOfDay = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Base arrivals with daily pattern
    let baseArrivals = HOURLY_ARRIVAL_BASE[hourOfDay];
    baseArrivals = Math.round(baseArrivals * DAY_MULTIPLIER[dayOfWeek]);

    // Add surge effects
    if (majorEventHours.has(hourIdx)) {
      baseArrivals = Math.round(baseArrivals * (1.8 + rand() * 0.7));
    } else if (surgeHours.has(hourIdx)) {
      baseArrivals = Math.round(baseArrivals * (1.3 + rand() * 0.3));
    }

    // Random variation ±20%
    baseArrivals = Math.round(baseArrivals * (0.8 + rand() * 0.4));
    baseArrivals = Math.max(0, baseArrivals);

    // Ambulance arrivals: ~15-25% of total, higher during major events
    const ambulanceRatio = majorEventHours.has(hourIdx) ? 0.3 : 0.18;
    const ambulanceArrivals = Math.min(
      baseArrivals,
      Math.round(baseArrivals * ambulanceRatio * (0.7 + rand() * 0.6))
    );

    // Update arrival buffer for rolling windows
    arrivalBuffer.push(baseArrivals);
    if (arrivalBuffer.length > 3) arrivalBuffer.shift();

    const arrivals30Min = Math.round(baseArrivals * 0.4 * (0.8 + rand() * 0.4));
    const arrivals1Hr = baseArrivals;
    const arrivals3Hr = arrivalBuffer.reduce((a, b) => a + b, 0);

    // Current patients evolve
    const arrivals = baseArrivals;
    const avgStayHours = 4 + rand() * 3;
    const baseDischargeRate = currentPatients / avgStayHours;
    const discharges = Math.round(baseDischargeRate * (0.7 + rand() * 0.6));

    // Admissions correlate with patients and surge
    const admissionBase = currentPatients * 0.08;
    const admissions = Math.round(
      admissionBase * (majorEventHours.has(hourIdx) ? 1.5 : 1.0) * (0.6 + rand() * 0.8)
    );

    lastAdmissions = admissions;
    lastDischarges = discharges;

    // Net patient change
    const netChange = arrivals + admissions - discharges;
    currentPatients = clamp(currentPatients + netChange, 0, config.totalBeds * 2);

    // Bed occupancy
    const occupiedBeds = Math.min(currentPatients, currentBeds);
    const bedOccupancyPercent = Math.round((occupiedBeds / currentBeds) * 100);

    // Available beds
    const availableBeds = Math.max(0, currentBeds - occupiedBeds);

    // Staffing — shifts
    let baseStaff: number;
    if (hourOfDay >= 7 && hourOfDay < 15) {
      baseStaff = Math.round(config.totalStaff * 0.4); // Day shift
    } else if (hourOfDay >= 15 && hourOfDay < 23) {
      baseStaff = Math.round(config.totalStaff * 0.35); // Evening shift
    } else {
      baseStaff = Math.round(config.totalStaff * 0.25); // Night shift
    }

    // Staff shortage events
    if (rand() < 0.05) {
      baseStaff = Math.round(baseStaff * 0.7);
    }

    currentStaff = clamp(baseStaff, 4, config.totalStaff);
    const staffRatio = parseFloat((currentStaff / Math.max(currentPatients, 1)).toFixed(2));

    // Waiting time — rises with demand, falls with staff
    const demandPressure = currentPatients / currentBeds;
    const staffPressure = Math.max(0.5, 1 - currentStaff / config.totalStaff);
    let waitTime = Math.round(
      8 +
        demandPressure * 25 +
        staffPressure * 15 +
        (bedOccupancyPercent > 80 ? 12 : 0) +
        (majorEventHours.has(hourIdx) ? 15 : 0) +
        (rand() * 8 - 4)
    );
    waitTime = clamp(waitTime, 2, 120);

    // Acuity score (average severity, 1-5 scale)
    const acuityScore = parseFloat((2.5 + (majorEventHours.has(hourIdx) ? 0.5 : 0) + (rand() * 1 - 0.5)).toFixed(1));

    // Overcrowding label: 1 if patients > 85% of beds and wait > 30min
    const overcrowdingLabel =
      currentPatients > currentBeds * 0.85 && waitTime > 30 ? 1 : 0;

    data.push({
      timestamp: timestamp.getTime(),
      hourOfDay,
      dayOfWeek,
      patientArrivals: baseArrivals,
      arrivalsLast30Min: arrivals30Min,
      arrivalsLast1Hr: arrivals1Hr,
      arrivalsLast3Hr: arrivals3Hr,
      currentEDPatients: currentPatients,
      availableBeds,
      totalEDBeds: currentBeds,
      bedOccupancyPercent,
      availableStaff: currentStaff,
      totalStaff: config.totalStaff,
      staffRatio,
      averageWaitingTime: waitTime,
      admissionsLast1Hr: admissions,
      dischargesLast1Hr: discharges,
      ambulanceArrivals,
      acuityScore,
      overcrowdingLabel,
    });
  }

  return data;
}

// Generate a smaller "current state" snapshot for the live dashboard
export function generateCurrentState(): HospitalMetrics {
  const now = new Date();
  const hourOfDay = now.getHours();

  // Use realistic mid-range values
  const arrivals = HOURLY_ARRIVAL_BASE[hourOfDay] || 5;
  const currentPatients = clamp(Math.round(arrivals * 3.5 + randomBetween(-5, 5)), 10, 28);
  const totalBeds = 30;
  const occupiedBeds = Math.min(currentPatients, totalBeds);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const bedOccupancyPercent = Math.round((occupiedBeds / totalBeds) * 100);

  let currentStaff: number;
  if (hourOfDay >= 7 && hourOfDay < 15) currentStaff = 16;
  else if (hourOfDay >= 15 && hourOfDay < 23) currentStaff = 14;
  else currentStaff = 8;

  const staffRatio = parseFloat((currentStaff / Math.max(currentPatients, 1)).toFixed(2));
  const waitTime = clamp(Math.round(12 + (bedOccupancyPercent > 80 ? 20 : 0) + (rand() * 10 - 5)), 3, 90);

  return {
    timestamp: now.getTime(),
    hourOfDay,
    dayOfWeek: now.getDay(),
    patientArrivals: arrivals,
    arrivalsLast30Min: Math.round(arrivals * 0.4),
    arrivalsLast1Hr: arrivals,
    arrivalsLast3Hr: arrivals * 3 + randomBetween(-3, 3),
    currentEDPatients: currentPatients,
    availableBeds,
    totalEDBeds: totalBeds,
    bedOccupancyPercent,
    availableStaff: currentStaff,
    totalStaff: 24,
    staffRatio,
    averageWaitingTime: waitTime,
    admissionsLast1Hr: Math.round(currentPatients * 0.08),
    dischargesLast1Hr: Math.round(currentPatients / 5),
    ambulanceArrivals: Math.round(arrivals * 0.18),
    acuityScore: parseFloat((2.5 + rand() * 0.8).toFixed(1)),
    overcrowdingLabel: currentPatients > totalBeds * 0.85 && waitTime > 30 ? 1 : 0,
  };
}

// Predefined scenarios for demo mode
export const SCENARIOS: Record<string, (base: HospitalMetrics) => HospitalMetrics> = {
  normal: (base) => ({ ...base }),
  demand_surge: (base) => ({
    ...base,
    patientArrivals: base.patientArrivals + 8,
    arrivalsLast1Hr: base.arrivalsLast1Hr + 12,
    arrivalsLast3Hr: base.arrivalsLast3Hr + 30,
    currentEDPatients: Math.min(base.currentEDPatients + 10, base.totalEDBeds * 2),
    bedOccupancyPercent: Math.min(100, base.bedOccupancyPercent + 20),
    availableBeds: Math.max(0, base.availableBeds - 6),
    averageWaitingTime: base.averageWaitingTime + 25,
    ambulanceArrivals: base.ambulanceArrivals + 5,
    overcrowdingLabel: 1,
  }),
  bed_shortage: (base) => ({
    ...base,
    availableBeds: Math.max(0, base.availableBeds - 8),
    bedOccupancyPercent: Math.min(100, base.bedOccupancyPercent + 25),
    currentEDPatients: base.currentEDPatients + 4,
    averageWaitingTime: base.averageWaitingTime + 18,
    overcrowdingLabel: 1,
  }),
  staff_shortage: (base) => ({
    ...base,
    availableStaff: Math.max(4, base.availableStaff - 6),
    staffRatio: parseFloat(((Math.max(4, base.availableStaff - 6)) / Math.max(base.currentEDPatients, 1)).toFixed(2)),
    averageWaitingTime: base.averageWaitingTime + 20,
  }),
  recovery: (base) => ({
    ...base,
    currentEDPatients: Math.max(8, base.currentEDPatients - 8),
    bedOccupancyPercent: Math.max(30, base.bedOccupancyPercent - 25),
    availableBeds: Math.min(base.totalEDBeds, base.availableBeds + 6),
    averageWaitingTime: Math.max(5, base.averageWaitingTime - 15),
    availableStaff: Math.min(base.totalStaff, base.availableStaff + 4),
    staffRatio: parseFloat(((Math.min(base.totalStaff, base.availableStaff + 4)) / Math.max(base.currentEDPatients - 8, 1)).toFixed(2)),
    overcrowdingLabel: 0,
  }),
  emergency_surge: (base) => ({
    ...base,
    patientArrivals: base.patientArrivals + 15,
    arrivalsLast1Hr: base.arrivalsLast1Hr + 20,
    arrivalsLast3Hr: base.arrivalsLast3Hr + 50,
    currentEDPatients: Math.min(base.currentEDPatients + 18, base.totalEDBeds * 2),
    bedOccupancyPercent: Math.min(100, base.bedOccupancyPercent + 35),
    availableBeds: Math.max(0, base.availableBeds - 12),
    averageWaitingTime: Math.min(120, base.averageWaitingTime + 45),
    ambulanceArrivals: base.ambulanceArrivals + 10,
    admissionsLast1Hr: base.admissionsLast1Hr + 5,
    overcrowdingLabel: 1,
  }),
};
