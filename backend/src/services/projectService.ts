import { ZephyrProject } from "../types/zephyr.js";
import { fetchAllPages } from "./zephyrApi.js";
import { getCachedProjects, setCachedProjects } from "../cache/cacheManager.js";

export async function getAllProjects(): Promise<ZephyrProject[]> {
  const cached = getCachedProjects<ZephyrProject[]>();
  if (cached) {
    return cached;
  }

  const projects = await fetchAllPages<ZephyrProject>("/projects");
  setCachedProjects(projects);
  return projects;
}
