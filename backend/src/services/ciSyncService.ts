import { getExecutionStatuses } from "./testExecutionService.js";
import { postToZephyr } from "./zephyrApi.js";

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

export function parseCucumberHtml(html: string): SyncPreview {
  const match = html.match(/window\.CUCUMBER_MESSAGES\s*=\s*([\s\S]*?);\s*<\/script>/);
  if (!match) throw new Error("No CUCUMBER_MESSAGES found — is this a Cucumber HTML report?");

  const messages: unknown[] = JSON.parse(match[1]);

  const pickleNames = new Map<string, string>();
  const tcToPickle = new Map<string, string>();
  const runToTc = new Map<string, string>();
  const stepStatuses = new Map<string, string[]>();
  const executions: ParsedExecution[] = [];

  for (const msg of messages) {
    const m = msg as Record<string, unknown>;

    if (m.pickle) {
      const p = m.pickle as { id: string; name: string };
      pickleNames.set(p.id, p.name);
    } else if (m.testCase) {
      const tc = m.testCase as { id: string; pickleId: string };
      tcToPickle.set(tc.id, tc.pickleId);
    } else if (m.testCaseStarted) {
      const tcs = m.testCaseStarted as { id: string; testCaseId: string };
      runToTc.set(tcs.id, tcs.testCaseId);
    } else if (m.testStepFinished) {
      const tsf = m.testStepFinished as {
        testCaseStartedId: string;
        testStepResult: { status: string };
      };
      const arr = stepStatuses.get(tsf.testCaseStartedId) ?? [];
      arr.push(tsf.testStepResult.status);
      stepStatuses.set(tsf.testCaseStartedId, arr);
    } else if (m.testCaseFinished) {
      const tcf = m.testCaseFinished as { testCaseStartedId: string };
      const runId = tcf.testCaseStartedId;
      const tcId = runToTc.get(runId);
      if (!tcId) continue;
      const pickleId = tcToPickle.get(tcId);
      if (!pickleId) continue;
      const name = pickleNames.get(pickleId) ?? "";

      // Derive scenario status from its step results
      const steps = stepStatuses.get(runId) ?? [];
      let status: "PASSED" | "FAILED" | "SKIPPED";
      if (steps.includes("FAILED")) status = "FAILED";
      else if (steps.length > 0 && steps.every((s) => s === "SKIPPED")) status = "SKIPPED";
      else status = "PASSED";

      // Extract one ParsedExecution per Zephyr test case key in the name
      const keyRegex = /\[([A-Z]+-T\d+)\]/g;
      let keyMatch;
      while ((keyMatch = keyRegex.exec(name)) !== null) {
        executions.push({ testCaseKey: keyMatch[1], testName: name, status });
      }
    }
  }

  const passed = executions.filter((e) => e.status === "PASSED").length;
  const failed = executions.filter((e) => e.status === "FAILED").length;
  const skipped = executions.filter((e) => e.status === "SKIPPED").length;

  return { total: executions.length, passed, failed, skipped, executions };
}

export async function pushExecutions(
  projectKey: string,
  executions: ParsedExecution[],
  executionDate: string,
  gitRef?: string,
  jobId?: string
): Promise<SyncResult> {
  const statuses = await getExecutionStatuses(projectKey);

  // Map Cucumber statuses to Zephyr status names
  const find = (keyword: string) =>
    statuses.find((s) => s.name.toLowerCase().includes(keyword))?.name;

  const statusMap: Record<"PASSED" | "FAILED" | "SKIPPED", string> = {
    PASSED: find("pass") ?? "Pass",
    FAILED: find("fail") ?? "Fail",
    SKIPPED: find("not executed") ?? find("skipped") ?? "Not Executed",
  };

  // Zephyr requires a test cycle — create one named after the run
  const runLabel = new Date(executionDate)
    .toISOString()
    .replace("T", " ")
    .substring(0, 16); // "YYYY-MM-DD HH:mm"
  const gitPart = gitRef ? `[Git Ref ${gitRef}]` : "";
  const jobPart = jobId ? ` Job ${jobId}` : "";
  const cycleName = `[CI Run]${gitPart}${jobPart} on ${runLabel}`;
  const cycle = await postToZephyr<{ key: string }>("/testcycles", {
    projectKey,
    name: cycleName,
    description: "Automated CI/CD run synced from Cucumber HTML report",
  });
  const testCycleKey = cycle.key;

  let synced = 0;
  const errors: { testCaseKey: string; error: string }[] = [];

  for (const exec of executions) {
    try {
      await postToZephyr("/testexecutions", {
        projectKey,
        testCaseKey: exec.testCaseKey,
        testCycleKey,
        statusName: statusMap[exec.status],
        executionDate,
        automated: true,
        comment: "Synced from CI/CD report",
      });
      synced++;
    } catch (err) {
      errors.push({ testCaseKey: exec.testCaseKey, error: (err as Error).message });
    }
  }

  return { synced, testCycleKey, errors };
}
