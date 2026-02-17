import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  zephyrApiToken: requireEnv("ZEPHYR_API_TOKEN"),
  cache: {
    ttlProjects: parseInt(process.env.CACHE_TTL_PROJECTS || "3600", 10),
    ttlMetrics: parseInt(process.env.CACHE_TTL_METRICS || "300", 10),
  },
  paginationDelayMs: parseInt(process.env.PAGINATION_DELAY_MS || "200", 10),
};
