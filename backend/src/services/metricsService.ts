import { DashboardMetrics, AutomationProgressMetrics, AutomationTypeProgress, ExecutionTrendPoint, TestCaseTrendPoint } from "../types/metrics.js";
import { ZephyrTestCase, ZephyrTestExecution } from "../types/zephyr.js";
import { getCachedMetrics, setCachedMetrics } from "../cache/cacheManager.js";
import { getAllProjects } from "./projectService.js";
import { getAllTestCases, getTestCaseStatuses } from "./testCaseService.js";
import { getAllTestExecutions, getExecutionStatuses } from "./testExecutionService.js";
import { forecastPassRate } from "./forecastService.js";
import { buildTeamMap } from "./folderService.js";

function getAutomationType(tc: ZephyrTestCase): "ui" | "api" | "manual" {
  for (const label of tc.labels ?? []) {
    const l = label.toLowerCase();
    if (l.includes("automation") || l.includes("automated")) {
      if (l.includes("ui")) return "ui";
      if (l.includes("api")) return "api";
      return "api"; // fallback for other automation labels
    }
  }
  return "manual";
}

function emptyTypeProgress(): AutomationTypeProgress {
  return { completed: 0, inProgress: 0, readyForAutomation: 0, total: 0, completionRate: 0 };
}

function normalizeExecStatus(statusName: string): "pass" | "fail" | "blocked" | "notExecuted" {
  const s = statusName.toLowerCase();
  if (s === "pass" || s === "passed") return "pass";
  if (s === "fail" || s === "failed") return "fail";
  if (s === "blocked") return "blocked";
  if (s === "skipped" || s === "skip") return "notExecuted";
  return "notExecuted";
}

function classifyAutomationStatus(statusName: string): "completed" | "inProgress" | "readyForAutomation" {
  const s = statusName.toLowerCase();
  if (s === "completed" || s === "done") return "completed";
  if (s.includes("in progress") || s.includes("in-progress")) return "inProgress";
  return "readyForAutomation";
}

function buildTrend(
  executions: ZephyrTestExecution[],
  execStatusMap: Map<number, string>
): ExecutionTrendPoint[] {
  const buckets = new Map<string, { pass: number; fail: number; blocked: number }>();

  for (const exec of executions) {
    const date = exec.executionDate || exec.actualEndDate;
    if (!date) continue;

    const month = date.substring(0, 7); // "YYYY-MM"
    if (!buckets.has(month)) {
      buckets.set(month, { pass: 0, fail: 0, blocked: 0 });
    }
    const bucket = buckets.get(month)!;
    const statusName = execStatusMap.get(exec.testExecutionStatus.id) || "Not Executed";
    const status = normalizeExecStatus(statusName);
    if (status === "pass") bucket.pass++;
    else if (status === "fail") bucket.fail++;
    else if (status === "blocked") bucket.blocked++;
  }

  return Array.from(buckets.entries())
    .map(([month, counts]) => ({ month, ...counts }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function buildTestCaseTrend(testCases: ZephyrTestCase[]): TestCaseTrendPoint[] {
  const buckets = new Map<string, number>();

  for (const tc of testCases) {
    if (!tc.createdOn) continue;
    const month = tc.createdOn.substring(0, 7);
    buckets.set(month, (buckets.get(month) || 0) + 1);
  }

  const sorted = Array.from(buckets.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  let cumulative = 0;
  return sorted.map(([month, added]) => {
    cumulative += added;
    return { month, added, cumulative };
  });
}

export async function getMetrics(projectKey: string, days?: number, teamFolderId?: number): Promise<DashboardMetrics> {
  const cacheKey = [projectKey, days ?? "all", teamFolderId ?? "all"].join(":");
  const cached = getCachedMetrics<DashboardMetrics>(cacheKey);
  if (cached) {
    return cached;
  }

  const [projects, testCases, allExecutions, tcStatuses, execStatuses] = await Promise.all([
    getAllProjects(),
    getAllTestCases(projectKey),
    getAllTestExecutions(projectKey),
    getTestCaseStatuses(projectKey),
    getExecutionStatuses(projectKey),
  ]);

  // Build status maps
  const tcStatusMap = new Map<number, string>();
  for (const s of tcStatuses) tcStatusMap.set(s.id, s.name);
  const execStatusMap = new Map<number, string>();
  for (const s of execStatuses) execStatusMap.set(s.id, s.name);

  // Filter test cases by team folder if specified
  let filteredTestCases = testCases;
  if (teamFolderId !== undefined) {
    const teamMap = await buildTeamMap(projectKey);
    filteredTestCases = testCases.filter((tc) => {
      if (!tc.folder) return false;
      return teamMap.get(tc.folder.id) === teamFolderId;
    });
  }
  const teamTCIds = new Set(filteredTestCases.map((tc) => tc.id));

  // Filter executions by date range if specified
  let executions = teamFolderId !== undefined
    ? allExecutions.filter((e) => e.testCase?.id !== undefined && teamTCIds.has(e.testCase.id))
    : allExecutions;
  if (days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffIso = cutoff.toISOString();
    executions = executions.filter((e) => {
      const date = e.executionDate || e.actualEndDate;
      return date && date >= cutoffIso;
    });
  }

  const project = projects.find((p) => p.key === projectKey);
  const projectName = project?.key || projectKey;

  // Separate deprecated test cases (excluded from all counts)
  const deprecatedTCs = filteredTestCases.filter((tc) => {
    const statusName = tcStatusMap.get(tc.status.id) || "";
    return statusName.toLowerCase().includes("deprecated");
  });
  const activeTCs = filteredTestCases.filter((tc) => {
    const statusName = tcStatusMap.get(tc.status.id) || "";
    return !statusName.toLowerCase().includes("deprecated");
  });

  // Classify active test cases by automation type
  const uiTCs = activeTCs.filter((tc) => getAutomationType(tc) === "ui");
  const apiTCs = activeTCs.filter((tc) => getAutomationType(tc) === "api");
  const automationTCs = [...uiTCs, ...apiTCs];
  const automated = automationTCs.length;
  const manual = activeTCs.length - automated;

  // Helper: compute progress for a set of automation test cases
  function computeTypeProgress(tcs: ZephyrTestCase[]): AutomationTypeProgress {
    const p = emptyTypeProgress();
    p.total = tcs.length;
    for (const tc of tcs) {
      const statusName = tcStatusMap.get(tc.status.id) || "";
      p[classifyAutomationStatus(statusName)]++;
    }
    p.completionRate = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
    return p;
  }

  const uiProgress = computeTypeProgress(uiTCs);
  const apiProgress = computeTypeProgress(apiTCs);

  // Automation progress (aggregate + per-type)
  const automationProgress: AutomationProgressMetrics = {
    completed: uiProgress.completed + apiProgress.completed,
    inProgress: uiProgress.inProgress + apiProgress.inProgress,
    readyForAutomation: uiProgress.readyForAutomation + apiProgress.readyForAutomation,
    total: automationTCs.length,
    completionRate: automationTCs.length > 0
      ? Math.round(((uiProgress.completed + apiProgress.completed) / automationTCs.length) * 100) : 0,
    ui: uiProgress,
    api: apiProgress,
  };

  // Build a map of latest execution per test case (by date)
  const latestExecPerTC = new Map<number, ZephyrTestExecution>();
  for (const exec of executions) {
    if (!exec.testCase?.id) continue;
    const tcId = exec.testCase.id;
    const existing = latestExecPerTC.get(tcId);
    if (!existing) {
      latestExecPerTC.set(tcId, exec);
    } else {
      const existingDate = existing.executionDate || existing.actualEndDate || "";
      const thisDate = exec.executionDate || exec.actualEndDate || "";
      if (thisDate > existingDate) latestExecPerTC.set(tcId, exec);
    }
  }

  // Execution results: one count per test case using its latest execution status
  // Test cases with no execution record count as notExecuted
  const executionResults = { pass: 0, fail: 0, blocked: 0, notExecuted: 0 };
  const activeTCIds = new Set(activeTCs.map((tc) => tc.id));
  for (const tcId of activeTCIds) {
    const exec = latestExecPerTC.get(tcId);
    if (!exec) {
      executionResults.notExecuted++;
    } else {
      const statusName = execStatusMap.get(exec.testExecutionStatus.id) || "";
      executionResults[normalizeExecStatus(statusName)]++;
    }
  }

  const executedCount = executionResults.pass + executionResults.fail + executionResults.blocked;

  // Pass rate: of executed test cases, what % passed (latest status)
  const passRate = executedCount > 0
    ? Math.round((executionResults.pass / executedCount) * 100) : 0;

  // Execution rate: unique test cases with at least one execution / total active
  const executionRate = activeTCs.length > 0
    ? Math.round((executedCount / activeTCs.length) * 100) : 0;

  // Trend data (use active TCs only for test case trend)
  // Always use all executions (not date-filtered) for forecast to maximize training history
  const executionTrend = buildTrend(executions, execStatusMap);
  const allTeamExecutions = teamFolderId !== undefined
    ? allExecutions.filter((e) => e.testCase?.id !== undefined && teamTCIds.has(e.testCase.id))
    : allExecutions;
  const allTimeTrend = days ? buildTrend(allTeamExecutions, execStatusMap) : executionTrend;
  const testCaseTrend = buildTestCaseTrend(activeTCs);
  const forecast = forecastPassRate(allTimeTrend);

  const metrics: DashboardMetrics = {
    projectKey,
    projectName,
    testCases: {
      total: activeTCs.length,
      manual,
      automated,
      uiAutomation: uiTCs.length,
      apiAutomation: apiTCs.length,
      deprecated: deprecatedTCs.length,
    },
    automationProgress,
    executionResults,
    passRate,
    executionRate: Math.min(executionRate, 100),
    executionTrend,
    testCaseTrend,
    forecast,
    lastUpdated: new Date().toISOString(),
  };

  setCachedMetrics(cacheKey, metrics);
  return metrics;
}
