import { useState, useRef, useEffect } from "react";
import Layout from "./components/Layout";
import ProjectSelector from "./components/ProjectSelector";
import RefreshControls from "./components/RefreshControls";
import DateRangeFilter from "./components/DateRangeFilter";
import TeamFilter from "./components/TeamFilter";
import DashboardGrid from "./components/DashboardGrid";
import FolderCoverageTable from "./components/FolderCoverageTable";
import ForecastPage from "./pages/ForecastPage";
import CISyncPage from "./pages/CISyncPage";
import { useMetrics, useRefreshMetrics, useTeamFolders, useFolderCoverage } from "./api/dashboardApi";
import { exportDashboardPdf } from "./utils/exportPdf";

type Page = "dashboard" | "forecast" | "ciSync";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [projectKey, setProjectKey] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState(300_000);
  const [days, setDays] = useState<number | undefined>(undefined);
  const [teamFolderId, setTeamFolderId] = useState<number | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const { data: teamFolders = [] } = useTeamFolders(projectKey);
  const { data: metrics, isLoading, error } = useMetrics(projectKey, pollingInterval, days, teamFolderId);
  const { data: folderCoverage = [], isLoading: isFolderLoading } = useFolderCoverage(projectKey, teamFolderId);
  const refreshMutation = useRefreshMetrics();

  // Reset team filter when project changes
  useEffect(() => { setTeamFolderId(undefined); }, [projectKey]);

  const handleRefresh = () => {
    if (projectKey) {
      refreshMutation.mutate({ projectKey, days, teamFolderId });
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
    <Layout activePage={page} onNavigate={setPage}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <ProjectSelector selectedKey={projectKey} onSelect={setProjectKey} />
        {projectKey && page === "dashboard" && (
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
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {exporting ? "Exporting..." : "Export PDF"}
              </button>
            )}
          </div>
        )}
      </div>

      {projectKey && page === "dashboard" && (
        <div className="mb-6 space-y-2">
          <DateRangeFilter value={days} onChange={setDays} />
          <TeamFilter teams={teamFolders} value={teamFolderId} onChange={setTeamFolderId} />
        </div>
      )}

      {page === "dashboard" && (
        <>
          {!projectKey && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm">Select a project to view metrics</p>
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

          {projectKey && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Feature Coverage</h2>
                <div className="relative group">
                  <button className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors text-xs font-bold cursor-default">
                    i
                  </button>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg leading-relaxed">
                    <p>Only folders with automation-labeled test cases (UI or API Automation) are shown. Counts roll up from all sub-folders. Folders with no automation test cases are hidden.</p>
                    <p className="mt-2">Each test case is counted once. For test cases with both UI and API labels, only their single Zephyr status is used (UI and API automation progress cannot be tracked separately for the same test case).</p>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-gray-800 rotate-45 -mt-1" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <FolderCoverageTable rows={folderCoverage} isLoading={isFolderLoading} />
              </div>
            </div>
          )}
        </>
      )}

      {page === "forecast" && (
        <ForecastPage
          metrics={metrics}
          isLoading={isLoading}
          error={error as Error | null}
          projectKey={projectKey}
        />
      )}

      {page === "ciSync" && <CISyncPage projectKey={projectKey} />}
    </Layout>
  );
}
