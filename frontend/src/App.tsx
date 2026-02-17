import { useState, useRef } from "react";
import Layout from "./components/Layout";
import ProjectSelector from "./components/ProjectSelector";
import RefreshControls from "./components/RefreshControls";
import DateRangeFilter from "./components/DateRangeFilter";
import DashboardGrid from "./components/DashboardGrid";
import { useMetrics, useRefreshMetrics } from "./api/dashboardApi";
import { exportDashboardPdf } from "./utils/exportPdf";

export default function App() {
  const [projectKey, setProjectKey] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState(300_000);
  const [days, setDays] = useState<number | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const { data: metrics, isLoading, error } = useMetrics(projectKey, pollingInterval, days);
  const refreshMutation = useRefreshMetrics();

  const handleRefresh = () => {
    if (projectKey) {
      refreshMutation.mutate({ projectKey, days });
    }
  };

  const handleExport = async () => {
    if (!dashboardRef.current || !projectKey) return;
    setExporting(true);
    try {
      await exportDashboardPdf(dashboardRef.current, projectKey);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <ProjectSelector selectedKey={projectKey} onSelect={setProjectKey} />
        {projectKey && (
          <div className="flex flex-wrap items-center gap-3">
            <RefreshControls
              pollingInterval={pollingInterval}
              onPollingChange={setPollingInterval}
              onRefresh={handleRefresh}
              isRefreshing={refreshMutation.isPending}
              lastUpdated={metrics?.lastUpdated ?? null}
            />
            {metrics && (
              <button
                onClick={handleExport}
                disabled={exporting}
                className="rounded-md bg-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {exporting ? "Exporting..." : "Export PDF"}
              </button>
            )}
          </div>
        )}
      </div>

      {projectKey && (
        <div className="mb-6">
          <DateRangeFilter value={days} onChange={setDays} />
        </div>
      )}

      {!projectKey && (
        <div className="text-center py-20 text-gray-400">
          Select a project to view metrics
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <svg className="animate-spin h-8 w-8 mb-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading metrics...
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-500">
          Failed to load metrics: {(error as Error).message}
        </div>
      )}

      {metrics && (
        <div ref={dashboardRef}>
          <DashboardGrid metrics={metrics} />
        </div>
      )}
    </Layout>
  );
}
