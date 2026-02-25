import { DashboardMetrics } from "../api/dashboardApi";
import PassRateForecastChart from "../components/PassRateForecastChart";
import ForecastSummaryPanel from "../components/ForecastSummaryPanel";
import { buildForecastInsight } from "../utils/forecastSummary";

interface Props {
  metrics: DashboardMetrics | undefined;
  isLoading: boolean;
  error: Error | null;
  projectKey: string | null;
}

export default function ForecastPage({ metrics, isLoading, error, projectKey }: Props) {
  const insight = metrics?.forecast ? buildForecastInsight(metrics.forecast) : null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Predictive Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">
          Pass rate is forecast 3 months ahead using Holt's Double Exponential Smoothing (α=0.3, β=0.1).
          The shaded band shows a 90% confidence interval. Forecast always uses all-time execution history.
        </p>
      </div>

      {!projectKey && (
        <div className="text-center py-20 text-gray-400">
          Select a project to view forecast
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <svg className="animate-spin h-8 w-8 mb-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading forecast...
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-500">
          Failed to load data: {error.message}
        </div>
      )}

      {metrics && (
        <div className="space-y-4">
          <PassRateForecastChart forecast={metrics.forecast} />

          {/* Legend */}
          <div className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm text-gray-600 flex flex-wrap gap-x-6 gap-y-1 items-center">
            <span><span className="font-medium text-emerald-600">Green line</span> — historical pass rate</span>
            <span><span className="font-medium text-violet-500">Purple dashed</span> — 3-month forecast</span>
            <span><span className="font-medium text-indigo-400">Shaded band</span> — 90% confidence interval</span>
          </div>

          {/* Dynamic summary */}
          {insight && (
            <ForecastSummaryPanel
              insight={insight}
              dataPointsUsed={metrics.forecast?.dataPointsUsed ?? 0}
            />
          )}

          {metrics.forecast?.insufficient && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
              Not enough data to generate an analysis. At least 3 months of execution history are required.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
