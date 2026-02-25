export interface TestCaseMetrics {
  total: number;       // excludes deprecated
  manual: number;
  automated: number;
  uiAutomation: number;
  apiAutomation: number;
  deprecated: number;  // excluded from all other counts
}

export interface AutomationTypeProgress {
  completed: number;
  inProgress: number;
  readyForAutomation: number;
  total: number;
  completionRate: number; // 0-100
}

export interface AutomationProgressMetrics {
  completed: number;
  inProgress: number;
  readyForAutomation: number;
  total: number;
  completionRate: number; // 0-100
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

export interface ForecastPoint {
  month: string;        // "YYYY-MM"
  value: number;        // predicted pass rate 0–100
  lower: number;        // 90% CI lower bound, clamped to 0
  upper: number;        // 90% CI upper bound, clamped to 100
  isForecast: boolean;
}

export interface QAForecast {
  passRate: ForecastPoint[];
  horizonMonths: number;   // 3
  modelType: string;       // "holt-des"
  dataPointsUsed: number;
  insufficient: boolean;   // true if < 3 months of execution data
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
  forecast?: QAForecast;
  lastUpdated: string;
}
