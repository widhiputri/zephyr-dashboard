export interface ZephyrProject {
  id: number;
  key: string;
  jiraProjectId: number;
  enabled: boolean;
}

export interface ZephyrTestCase {
  id: number;
  key: string;
  name: string;
  project: { id: number };
  status: { id: number };
  createdOn: string;
  customFields: Record<string, unknown>;
  labels: string[];
}

export interface ZephyrTestExecution {
  id: number;
  key: string;
  testCase?: { id: number };
  project: { id: number };
  testExecutionStatus: { id: number };
  automated: boolean;
  executedById?: string;
  executionDate?: string;
  actualEndDate?: string;
}

export interface ZephyrStatus {
  id: number;
  name: string;
  color: string;
  archived: boolean;
}
