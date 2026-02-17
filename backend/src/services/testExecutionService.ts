import { ZephyrTestExecution, ZephyrStatus } from "../types/zephyr.js";
import { fetchAllPages } from "./zephyrApi.js";

export async function getAllTestExecutions(
  projectKey: string
): Promise<ZephyrTestExecution[]> {
  return fetchAllPages<ZephyrTestExecution>("/testexecutions", { projectKey });
}

export async function getExecutionStatuses(
  projectKey: string
): Promise<ZephyrStatus[]> {
  return fetchAllPages<ZephyrStatus>("/statuses", {
    projectKey,
    statusType: "TEST_EXECUTION",
  });
}
