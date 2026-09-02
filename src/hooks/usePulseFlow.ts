// PulseFlow AI — Custom data hooks
import { useState, useEffect, useCallback, useRef } from "react";
import type {
  HospitalMetrics,
  PredictionResult,
  ForecastPoint,
  Explanation,
  Recommendation,
  WhatIfInput,
  WhatIfResult,
  RiskHistoryEntry,
} from "@/types/pulseflow";
import * as api from "@/services/api";

const POLL_INTERVAL = 8000;

export function useCurrentStatus() {
  const [data, setData] = useState<HospitalMetrics>(api.getCurrentStatus());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    setData(api.getCurrentStatus());
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

  return { data, loading, refresh };
}

export function usePrediction() {
  const [data, setData] = useState<PredictionResult>(api.getPrediction());

  useEffect(() => {
    const timer = setInterval(() => setData(api.getPrediction()), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return data;
}

export function useForecast() {
  const [data, setData] = useState<ForecastPoint[]>(api.getForecast());

  useEffect(() => {
    const timer = setInterval(() => setData(api.getForecast()), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return data;
}

export function useExplanation() {
  const [data, setData] = useState<Explanation>(api.getExplanation());

  useEffect(() => {
    const timer = setInterval(() => setData(api.getExplanation()), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return data;
}

export function useRecommendations() {
  const [data, setData] = useState<Recommendation[]>(api.getRecommendations());

  useEffect(() => {
    const timer = setInterval(
      () => setData(api.getRecommendations()),
      POLL_INTERVAL
    );
    return () => clearInterval(timer);
  }, []);

  return data;
}

export function useRiskHistory() {
  const [data, setData] = useState<RiskHistoryEntry[]>(api.getRiskHistory());
  return { data, refresh: () => setData(api.getRiskHistory()) };
}

export function useWhatIf() {
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);

  const simulate = useCallback((input: WhatIfInput) => {
    setLoading(true);
    // Small delay for UX
    setTimeout(() => {
      setResult(api.processWhatIf(input));
      setLoading(false);
    }, 300);
  }, []);

  return { result, loading, simulate };
}

export function useSimulation() {
  const [state, setState] = useState(api.getSimulationStatus());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((scenario: string) => {
    setState(api.startSimulation(scenario));
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setState(api.advanceSimulation());
    }, 6000);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(api.resetSimulation());
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { ...state, start, reset };
}
