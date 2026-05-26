import type { Analytics, Prediction, TravelResponse } from "./api";

export type StoredTrip = {
  result?: string;
  analytics?: Analytics;
  prediction?: Prediction;
  thread_id?: string;
  query?: string;
  updatedAt?: string;
};

const KEY = "aegis26.latestTrip";

export function saveTrip(data: TravelResponse & { query?: string }) {
  if (typeof window === "undefined") return;

  const payload: StoredTrip = {
    result: data.result,
    analytics: data.analytics || {},
    prediction: data.prediction || {},
    thread_id: data.thread_id,
    query: data.query,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("aegis26:trip-updated", { detail: payload }));
}

export function loadTrip(): StoredTrip {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as StoredTrip;
  } catch {
    return {};
  }
}

export function createThreadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `thread-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
