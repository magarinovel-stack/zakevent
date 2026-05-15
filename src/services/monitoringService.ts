/**
 * Monitoring Service
 * Production: no console output, stores in memory for structured retrieval
 * Development: logs to console for debugging
 */
const IS_PRODUCTION = import.meta.env.PROD;
const LOG_LEVEL = (import.meta.env.VITE_LOG_LEVEL || "info") as string;
const LEVELS = ["debug", "info", "warn", "error"] as const;

const errors: { error: unknown; context?: Record<string, unknown>; timestamp: number }[] = [];
const metrics: { metric: string; value: number; timestamp: number }[] = [];

function shouldLog(level: typeof LEVELS[number]): boolean {
  if (IS_PRODUCTION) return false;
  return LEVELS.indexOf(level) >= LEVELS.indexOf(LOG_LEVEL as typeof LEVELS[number]);
}

export const monitoringService = {
  init() {
    if (shouldLog("info")) {
      // Development only
      void 0; // no-op in production
    }
  },

  captureError(error: unknown, context?: Record<string, unknown>) {
    errors.push({ error, context, timestamp: Date.now() });
    if (errors.length > 100) errors.shift();
  },

  logPerformance(metric: string, value: number) {
    metrics.push({ metric, value, timestamp: Date.now() });
    if (metrics.length > 500) metrics.shift();
  },

  trackUserPresence(_userId: string) {
    // No-op: telemetry collected server-side
  },

  getErrors() {
    return errors;
  },

  getMetrics() {
    return metrics;
  },
};
