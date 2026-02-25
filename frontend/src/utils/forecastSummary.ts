import { QAForecast } from "../api/dashboardApi";

export type ForecastStatus = "healthy" | "warning" | "critical";

export interface ForecastInsight {
  status: ForecastStatus;
  statusLabel: string;
  analysis: string[];    // 2–3 analytical sentences
  suggestions: string[]; // 1–3 actionable suggestions
}

function fmtMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function stdDev(values: number[]): number {
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
}

export function buildForecastInsight(forecast: QAForecast): ForecastInsight | null {
  if (forecast.insufficient || forecast.passRate.length === 0) return null;

  const historical = forecast.passRate.filter((p) => !p.isForecast);
  const predicted = forecast.passRate.filter((p) => p.isForecast);
  if (historical.length === 0 || predicted.length === 0) return null;

  const latest = historical[historical.length - 1];
  const forecastEnd = predicted[predicted.length - 1];
  const historicalValues = historical.map((p) => p.value);

  // Trend: slope over last 3 historical points (percentage points per month)
  const recent = historical.slice(-3);
  const trendSlope =
    recent.length >= 2
      ? (recent[recent.length - 1].value - recent[0].value) / (recent.length - 1)
      : 0;

  // Overall forecast direction
  const forecastSlope = predicted.length >= 2
    ? (predicted[predicted.length - 1].value - predicted[0].value) / (predicted.length - 1)
    : 0;

  // Volatility
  const volatility = stdDev(historicalValues);
  const isHighVolatility = volatility > 12;
  const isModerateVolatility = volatility > 6;

  // Lowest historical point
  const lowestPoint = historical.reduce((min, p) => (p.value < min.value ? p : min), historical[0]);

  // Biggest single-month drop
  let biggestDrop = 0;
  let biggestDropMonth = "";
  for (let i = 1; i < historical.length; i++) {
    const drop = historical[i - 1].value - historical[i].value;
    if (drop > biggestDrop) {
      biggestDrop = drop;
      biggestDropMonth = historical[i].month;
    }
  }

  // CI width of last forecast point
  const ciWidth = forecastEnd.upper - forecastEnd.lower;
  const isHighUncertainty = ciWidth > 30;
  const isModerateUncertainty = ciWidth > 15;

  // --- Status ---
  let status: ForecastStatus;
  let statusLabel: string;

  if (forecastEnd.value >= 85 && forecastSlope >= -3) {
    status = "healthy";
    statusLabel = forecastSlope > 3 ? "Improving" : "Stable";
  } else if (forecastEnd.value >= 70) {
    status = "warning";
    statusLabel = forecastSlope < -3 ? "Declining" : "At Risk";
  } else {
    status = "critical";
    statusLabel = "Critical";
  }

  // --- Analysis paragraphs ---
  const analysis: string[] = [];

  // P1: current state + recent trend
  let p1 = `The latest recorded pass rate is ${latest.value.toFixed(1)}% (${fmtMonth(latest.month)}). `;
  if (trendSlope > 5) {
    p1 += `The trend over recent months is clearly improving, gaining roughly ${trendSlope.toFixed(1)} percentage points per month.`;
  } else if (trendSlope < -5) {
    p1 += `The trend has been declining over recent months, losing approximately ${Math.abs(trendSlope).toFixed(1)} percentage points per month — a pattern that warrants attention before it worsens.`;
  } else if (trendSlope > 2) {
    p1 += `The pass rate has been gently climbing in recent months, showing a modest upward trend.`;
  } else if (trendSlope < -2) {
    p1 += `There is a mild downward drift in recent months, though not yet at a critical level.`;
  } else {
    p1 += `The pass rate has been broadly stable in recent months with no strong directional trend.`;
  }
  analysis.push(p1);

  // P2: notable events / volatility
  if (isHighVolatility) {
    let p2 = `Historical volatility is high (σ = ${volatility.toFixed(1)}%), meaning monthly results swing significantly. `;
    if (lowestPoint.value < 65) {
      p2 += `The lowest recorded pass rate was ${lowestPoint.value.toFixed(1)}% in ${fmtMonth(lowestPoint.month)}, which represents a significant quality dip and may indicate an incident, large feature release, or environment instability during that period.`;
    } else {
      p2 += `This irregular pattern suggests inconsistent test execution cadence or recurring short-term quality dips.`;
    }
    analysis.push(p2);
  } else if (biggestDrop > 15 && biggestDropMonth) {
    analysis.push(
      `A notable drop of ${biggestDrop.toFixed(1)} percentage points was observed in ${fmtMonth(biggestDropMonth)}. ` +
        `The project has since recovered, but the event is worth investigating to understand the underlying cause.`
    );
  } else if (!isModerateVolatility) {
    analysis.push(
      `The historical data shows low volatility (σ = ${volatility.toFixed(1)}%), suggesting a consistent and controlled testing process over time.`
    );
  }

  // P3: forecast outlook + confidence
  const directionWord =
    forecastSlope > 3 ? "continue improving" :
    forecastSlope < -3 ? "decline" :
    "remain broadly stable";

  let p3 = `The model forecasts the pass rate to ${directionWord}, reaching ${forecastEnd.value.toFixed(1)}% by ${fmtMonth(forecastEnd.month)}. `;
  if (isHighUncertainty) {
    p3 += `However, the confidence interval is wide (±${(ciWidth / 2).toFixed(0)} pp), reflecting the high variability in historical data. The actual outcome could differ substantially — treat this projection as a directional signal rather than a precise target.`;
  } else if (isModerateUncertainty) {
    p3 += `The confidence interval is moderate (±${(ciWidth / 2).toFixed(0)} pp), offering reasonable certainty about the direction while acknowledging some uncertainty in the exact value.`;
  } else {
    p3 += `The narrow confidence interval (±${(ciWidth / 2).toFixed(0)} pp) indicates that the model has high confidence in this projection, reflecting a consistent and predictable historical trend.`;
  }
  analysis.push(p3);

  // --- Suggestions ---
  const suggestions: string[] = [];

  if (status === "critical") {
    suggestions.push(
      "The forecast indicates a critically low pass rate ahead. Immediate investigation of test failures and blockers is strongly recommended."
    );
    suggestions.push(
      "Consider halting new feature work to prioritise defect resolution and test suite stabilisation before the next release."
    );
  } else if (status === "warning") {
    suggestions.push(
      "Schedule a quality review to identify the factors behind the below-target pass rate and define a remediation plan."
    );
    suggestions.push(
      "Allocate additional time in the upcoming sprint for bug fixes, flaky test cleanup, and test environment investigation."
    );
  } else {
    suggestions.push(
      "The project is in a healthy state. Maintain current testing practices and continue monitoring for early signs of drift."
    );
  }

  if (isHighUncertainty) {
    suggestions.push(
      "To improve forecast confidence, aim for more consistent month-to-month test execution coverage. Irregular execution cycles increase the CI band width significantly."
    );
  }

  if (lowestPoint.value < 60 && !isHighVolatility) {
    suggestions.push(
      `Investigate the root cause of the pass rate drop in ${fmtMonth(lowestPoint.month)} to prevent a recurrence.`
    );
  }

  if (forecastSlope < -5) {
    suggestions.push(
      "The downward trend in the forecast is steep. If unchecked, this trajectory could breach acceptable quality thresholds within 1–2 months."
    );
  }

  return { status, statusLabel, analysis, suggestions };
}
