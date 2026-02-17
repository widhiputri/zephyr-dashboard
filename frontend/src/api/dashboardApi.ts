import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ZephyrProject {
  id: number;
  key: string;
  jiraProjectId: number;
  enabled: boolean;
}

export interface TestCaseMetrics {
  total: number;
  manual: number;
  automated: number;
}

export interface AutomationProgressMetrics {
  completed: number;
  inProgress: number;
  readyForAutomation: number;
  total: number;
  completionRate: number;
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

export function useMetrics(projectKey: string | null, pollingInterval: number, days?: number) {
  const daysParam = days ? `?days=${days}` : "";
  return useQuery({
    queryKey: ["metrics", projectKey, days],
    queryFn: () => fetchJson<DashboardMetrics>(`/api/metrics/${projectKey}${daysParam}`),
    enabled: !!projectKey,
    refetchInterval: pollingInterval || false,
  });
}

export function useRefreshMetrics() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectKey, days }: { projectKey: string; days?: number }) => {
      const daysParam = days ? `?days=${days}` : "";
      return fetch(`/api/metrics/${projectKey}/refresh${daysParam}`, { method: "POST" }).then(
        (r) => r.json() as Promise<DashboardMetrics>
      );
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["metrics", data.projectKey, variables.days], data);
    },
  });
}
