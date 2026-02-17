import { ZephyrTestCase, ZephyrStatus } from "../types/zephyr.js";
import { fetchAllPages } from "./zephyrApi.js";

export async function getAllTestCases(
  projectKey: string
): Promise<ZephyrTestCase[]> {
  return fetchAllPages<ZephyrTestCase>("/testcases", { projectKey });
}

export async function getTestCaseStatuses(
  projectKey: string
): Promise<ZephyrStatus[]> {
  return fetchAllPages<ZephyrStatus>("/statuses", {
    projectKey,
    statusType: "TEST_CASE",
  });
}
