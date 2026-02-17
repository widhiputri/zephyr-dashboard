import NodeCache from "node-cache";
import { config } from "../config.js";

const projectsCache = new NodeCache({
  stdTTL: config.cache.ttlProjects,
  checkperiod: 120,
});

const metricsCache = new NodeCache({
  stdTTL: config.cache.ttlMetrics,
  checkperiod: 60,
});

export function getCachedProjects<T>(): T | undefined {
  return projectsCache.get<T>("projects");
}

export function setCachedProjects<T>(data: T): void {
  projectsCache.set("projects", data);
}

export function getCachedMetrics<T>(projectKey: string): T | undefined {
  return metricsCache.get<T>(`metrics:${projectKey}`);
}

export function setCachedMetrics<T>(projectKey: string, data: T): void {
  metricsCache.set(`metrics:${projectKey}`, data);
}

export function invalidateMetrics(projectKey: string): void {
  metricsCache.del(`metrics:${projectKey}`);
}

export function invalidateAll(): void {
  projectsCache.flushAll();
  metricsCache.flushAll();
}
