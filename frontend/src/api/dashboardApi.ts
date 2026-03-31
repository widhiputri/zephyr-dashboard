import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ZephyrProject {
  id: number;
  key: string;
  jiraProjectId: number;
  enabled: boolean;
}

export interface TeamFolder {
  id: number;
  name: string;
}

export interface TestCaseMetrics {
  total: number;
  manual: number;
  automated: number;
  uiAutomation: number;
  apiAutomation: number;
  deprecated: number;
  draft: number;
}

export interface AutomationTypeProgress {
  completed: number;
  inProgress: number;
  readyForAutomation: number;
  total: number;
  completionRate: number;
}

export interface AutomationProgressMetrics {
  completed: number;
  inProgress: number;
  readyForAutomation: number;
  total: number;
  completionRate: number;
  ui: AutomationTypeProgress;
  api: AutomationTypeProgress;
}

export interface ExecutionResultMetrics {
  pass: number;
  fail: number;
  blocked: number;
  notExecuted: number;
}

export interface ExecutionTrendPoint {
  month: string;
  pass: number;
  fail: number;
  blocked: number;
}

export interface TestCaseTrendPoint {
  month: string;
  added: number;
  cumulative: number;
}

export interface ForecastPoint {
  month: string;
  value: number;
  lower: number;
  upper: number;
  isForecast: boolean;
}

export interface QAForecast {
  passRate: ForecastPoint[];
  horizonMonths: number;
  modelType: string;
  dataPointsUsed: number;
  insufficient: boolean;
}

export interface FolderCoverageRow {
  folderId: number;
  folderName: string;
  parentId: number | null;
  depth: number;
  total: number;
  completed: number;
  inProgress: number;
  readyForAutomation: number;
  coverageRate: number;
}

export interface DashboardMetrics {
  projectKey: string;
  projectName: string;
  testCases: TestCaseMetrics;
  automationProgress: AutomationProgressMetrics;
  executionResults: ExecutionResultMetrics;
  passRate: number;
  executionRate: number;
  executionTrend: ExecutionTrendPoint[];
  testCaseTrend: TestCaseTrendPoint[];
  forecast?: QAForecast;
  lastUpdated: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchJson<ZephyrProject[]>("/api/projects"),
    staleTime: 60 * 60 * 1000,
  });
}

export function useTeamFolders(projectKey: string | null) {
  return useQuery({
    queryKey: ["folders", projectKey],
    queryFn: () => fetchJson<TeamFolder[]>(`/api/folders/${projectKey}`),
    enabled: !!projectKey,
    staleTime: 60 * 60 * 1000,
  });
}

export function useMetrics(projectKey: string | null, pollingInterval: number, days?: number, teamFolderId?: number) {
  const params = new URLSearchParams();
  if (days) params.set("days", String(days));
  if (teamFolderId !== undefined) params.set("teamFolderId", String(teamFolderId));
  const query = params.size > 0 ? `?${params}` : "";
  return useQuery({
    queryKey: ["metrics", projectKey, days, teamFolderId],
    queryFn: () => fetchJson<DashboardMetrics>(`/api/metrics/${projectKey}${query}`),
    enabled: !!projectKey,
    refetchInterval: pollingInterval || false,
  });
}

export function useFolderCoverage(projectKey: string | null, teamFolderId?: number) {
  const params = new URLSearchParams();
  if (teamFolderId !== undefined) params.set("teamFolderId", String(teamFolderId));
  const query = params.size > 0 ? `?${params}` : "";
  return useQuery({
    queryKey: ["folderCoverage", projectKey, teamFolderId],
    queryFn: () => fetchJson<FolderCoverageRow[]>(`/api/metrics/${projectKey}/folder-coverage${query}`),
    enabled: !!projectKey,
    staleTime: 5 * 60 * 1000,
  });
}

export interface ParsedExecution {
  testCaseKey: string;
  testName: string;
  status: "PASSED" | "FAILED" | "SKIPPED";
}

export interface SyncPreview {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  executions: ParsedExecution[];
}

export interface SyncResult {
  synced: number;
  testCycleKey: string;
  errors: { testCaseKey: string; error: string }[];
}

export function usePreviewSync() {
  return useMutation({
    mutationFn: async ({ projectKey, file }: { projectKey: string; file: File }) => {
      const text = await file.text();
      const res = await fetch(`/api/ciSync/${projectKey}/preview`, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: text,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `Preview failed: ${res.status}`);
      }
      return res.json() as Promise<SyncPreview>;
    },
  });
}

export function usePushSync() {
  return useMutation({
    mutationFn: async ({
      projectKey,
      executions,
      executionDate,
      gitRef,
      jobId,
    }: {
      projectKey: string;
      executions: ParsedExecution[];
      executionDate: string;
      gitRef?: string;
      jobId?: string;
    }) => {
      const res = await fetch(`/api/ciSync/${projectKey}/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ executions, executionDate, gitRef, jobId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error ?? `Push failed: ${res.status}`);
      }
      return res.json() as Promise<SyncResult>;
    },
  });
}

export function useRefreshMetrics() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectKey, days, teamFolderId }: { projectKey: string; days?: number; teamFolderId?: number }) => {
      const params = new URLSearchParams();
      if (days) params.set("days", String(days));
      if (teamFolderId !== undefined) params.set("teamFolderId", String(teamFolderId));
      const query = params.size > 0 ? `?${params}` : "";
      return fetch(`/api/metrics/${projectKey}/refresh${query}`, { method: "POST" }).then(
        (r) => r.json() as Promise<DashboardMetrics>
      );
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["metrics", data.projectKey, variables.days, variables.teamFolderId], data);
    },
  });
}
