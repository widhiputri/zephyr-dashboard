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
  completionRate: number; // 0-100
}

export interface ExecutionResultMetrics {
  pass: number;
  fail: number;
  blocked: number;
  notExecuted: number;
}

export interface ExecutionTrendPoint {
  month: string; // "YYYY-MM"
  pass: number;
  fail: number;
  blocked: number;
}

export interface TestCaseTrendPoint {
  month: string; // "YYYY-MM"
  added: number;
  cumulative: number;
}

export interface DashboardMetrics {
  projectKey: string;
  projectName: string;
  testCases: TestCaseMetrics;
  automationProgress: AutomationProgressMetrics;
  executionResults: ExecutionResultMetrics;
  passRate: number;       // 0-100, of executed tests what % passed
  executionRate: number;  // 0-100, what % of test cases have been executed
  executionTrend: ExecutionTrendPoint[];
  testCaseTrend: TestCaseTrendPoint[];
  lastUpdated: string;
}
