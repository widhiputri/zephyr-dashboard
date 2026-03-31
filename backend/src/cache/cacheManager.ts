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
  const prefix = `metrics:${projectKey}:`;
  const keys = metricsCache.keys().filter((k) => k.startsWith(prefix));
  if (keys.length > 0) metricsCache.del(keys);
}

export function invalidateAll(): void {
  projectsCache.flushAll();
  metricsCache.flushAll();
}
