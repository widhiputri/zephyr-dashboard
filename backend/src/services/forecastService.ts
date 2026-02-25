import { ExecutionTrendPoint, ForecastPoint, QAForecast } from "../types/metrics.js";

const ALPHA = 0.3; // level smoothing
const BETA = 0.1;  // trend smoothing
const HORIZON = 3;
const Z_90 = 1.645; // z-score for ~90% CI

/** Advance a "YYYY-MM" string by n months */
function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  const date = new Date(y, m - 1 + n, 1);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, "0");
  return `${ny}-${nm}`;
}

/** Run Holt's Double Exponential Smoothing on a series */
function holtDES(series: number[]): { fitted: number[]; level: number; trend: number; rmse: number } {
  const n = series.length;
  let l = series[0];
  let b = series[1] - series[0];

  const fitted: number[] = [series[0]];

  for (let t = 1; t < n; t++) {
    const lPrev = l;
    l = ALPHA * series[t] + (1 - ALPHA) * (l + b);
    b = BETA * (l - lPrev) + (1 - BETA) * b;
    fitted.push(l + b);
  }

  const sse = series.reduce((acc, y, i) => acc + (y - fitted[i]) ** 2, 0);
  const rmse = Math.sqrt(sse / n);

  return { fitted, level: l, trend: b, rmse };
}

export function forecastPassRate(
  trend: ExecutionTrendPoint[],
  horizonMonths: number = HORIZON
): QAForecast {
  // Derive monthly pass rates from trend, skip months with zero total executions
  const ratePoints = trend
    .map((t) => {
      const total = t.pass + t.fail + t.blocked;
      if (total === 0) return null;
      return { month: t.month, rate: (t.pass / total) * 100 };
    })
    .filter((p): p is { month: string; rate: number } => p !== null)
    .sort((a, b) => a.month.localeCompare(b.month));

  if (ratePoints.length < 3) {
    return {
      passRate: [],
      horizonMonths,
      modelType: "holt-des",
      dataPointsUsed: ratePoints.length,
      insufficient: true,
    };
  }

  const series = ratePoints.map((p) => p.rate);
  const { level, trend: trendSlope, rmse } = holtDES(series);

  // Build historical points
  const passRate: ForecastPoint[] = ratePoints.map((p) => ({
    month: p.month,
    value: Math.round(p.rate * 10) / 10,
    lower: Math.round(p.rate * 10) / 10,
    upper: Math.round(p.rate * 10) / 10,
    isForecast: false,
  }));

  // Build forecast points
  const lastMonth = ratePoints[ratePoints.length - 1].month;
  for (let h = 1; h <= horizonMonths; h++) {
    const predicted = level + h * trendSlope;
    const ci = Z_90 * rmse * Math.sqrt(h);
    passRate.push({
      month: addMonths(lastMonth, h),
      value: Math.min(100, Math.max(0, Math.round(predicted * 10) / 10)),
      lower: Math.min(100, Math.max(0, Math.round((predicted - ci) * 10) / 10)),
      upper: Math.min(100, Math.max(0, Math.round((predicted + ci) * 10) / 10)),
      isForecast: true,
    });
  }

  return {
    passRate,
    horizonMonths,
    modelType: "holt-des",
    dataPointsUsed: ratePoints.length,
    insufficient: false,
  };
}
