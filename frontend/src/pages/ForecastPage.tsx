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
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Predictive Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">
          Pass rate is forecast 3 months ahead using Holt's Double Exponential Smoothing (α=0.3, β=0.1).
          The shaded band shows a 90% confidence interval. Forecast always uses all-time execution history.
        </p>
      </div>

      {!projectKey && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm">Select a project to view forecast</p>
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
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs text-gray-600 flex flex-wrap gap-x-6 gap-y-2 items-center shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-emerald-500 rounded-full" />
              <span>Historical pass rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-violet-500 rounded-full" style={{ backgroundImage: "repeating-linear-gradient(90deg, #8B5CF6 0, #8B5CF6 4px, transparent 4px, transparent 7px)" }} />
              <span>3-month forecast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 rounded bg-indigo-200 opacity-70" />
              <span>90% confidence interval</span>
            </div>
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
