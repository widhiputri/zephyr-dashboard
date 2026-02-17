import { DashboardMetrics, AutomationProgressMetrics, ExecutionTrendPoint, TestCaseTrendPoint } from "../types/metrics.js";
import { ZephyrTestCase, ZephyrTestExecution } from "../types/zephyr.js";
import { getCachedMetrics, setCachedMetrics } from "../cache/cacheManager.js";
import { getAllProjects } from "./projectService.js";
import { getAllTestCases, getTestCaseStatuses } from "./testCaseService.js";
import { getAllTestExecutions, getExecutionStatuses } from "./testExecutionService.js";

function isAutomationLabel(label: string): boolean {
  const l = label.toLowerCase();
  return l.includes("automation") || l.includes("automated");
}

function hasAutomationLabel(tc: ZephyrTestCase): boolean {
  return tc.labels?.some(isAutomationLabel) ?? false;
}

function normalizeExecStatus(statusName: string): "pass" | "fail" | "blocked" | "notExecuted" {
  const s = statusName.toLowerCase();
  if (s === "pass" || s === "passed") return "pass";
  if (s === "fail" || s === "failed") return "fail";
  if (s === "blocked") return "blocked";
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

export async function getMetrics(projectKey: string, days?: number): Promise<DashboardMetrics> {
  const cacheKey = days ? `${projectKey}:${days}` : projectKey;
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

  // Filter executions by date range if specified
  let executions = allExecutions;
  if (days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffIso = cutoff.toISOString();
    executions = allExecutions.filter((e) => {
      const date = e.executionDate || e.actualEndDate;
      return date && date >= cutoffIso;
    });
  }

  const project = projects.find((p) => p.key === projectKey);
  const projectName = project?.key || projectKey;

  // Classify test cases
  const automationTCs = testCases.filter(hasAutomationLabel);
  const automated = automationTCs.length;
  const manual = testCases.length - automated;

  // Automation progress
  const automationProgress: AutomationProgressMetrics = {
    completed: 0, inProgress: 0, readyForAutomation: 0,
    total: automationTCs.length, completionRate: 0,
  };
  for (const tc of automationTCs) {
    const statusName = tcStatusMap.get(tc.status.id) || "";
    automationProgress[classifyAutomationStatus(statusName)]++;
  }
  automationProgress.completionRate = automationProgress.total > 0
    ? Math.round((automationProgress.completed / automationProgress.total) * 100) : 0;

  // Execution results
  const executionResults = { pass: 0, fail: 0, blocked: 0, notExecuted: 0 };
  for (const exec of executions) {
    const statusName = execStatusMap.get(exec.testExecutionStatus.id) || "Not Executed";
    executionResults[normalizeExecStatus(statusName)]++;
  }

  const executedCount = executionResults.pass + executionResults.fail + executionResults.blocked;

  // Pass rate: of executed tests, what % passed
  const passRate = executedCount > 0
    ? Math.round((executionResults.pass / executedCount) * 100) : 0;

  // Execution rate: what % of test cases have been executed
  const executionRate = testCases.length > 0
    ? Math.round((executedCount / testCases.length) * 100) : 0;

  // Trend data
  const executionTrend = buildTrend(executions, execStatusMap);
  const testCaseTrend = buildTestCaseTrend(testCases);

  const metrics: DashboardMetrics = {
    projectKey,
    projectName,
    testCases: { total: testCases.length, manual, automated },
    automationProgress,
    executionResults,
    passRate,
    executionRate: Math.min(executionRate, 100),
    executionTrend,
    testCaseTrend,
    lastUpdated: new Date().toISOString(),
  };

  setCachedMetrics(cacheKey, metrics);
  return metrics;
}
