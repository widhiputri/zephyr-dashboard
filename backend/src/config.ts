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

// Parse TEAM_FOLDERS_<PROJECT>=Name1,Name2 into a map of projectKey → Set of folder names
function parseTeamFolderNames(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith("TEAM_FOLDERS_") || !value) continue;
    const projectKey = key.slice("TEAM_FOLDERS_".length);
    map.set(projectKey, new Set(value.split(",").map((n) => n.trim()).filter(Boolean)));
  }
  return map;
}

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  zephyrApiToken: requireEnv("ZEPHYR_API_TOKEN"),
  // Comma-separated project keys that have meaningful team sub-folders
  teamProjects: new Set(
    (process.env.TEAM_PROJECTS || "").split(",").map((k) => k.trim()).filter(Boolean)
  ),
  // Per-project allowlist of team folder names (see .env.example for format)
  teamFolderNames: parseTeamFolderNames(),
  cache: {
    ttlProjects: parseInt(process.env.CACHE_TTL_PROJECTS || "3600", 10),
    ttlMetrics: parseInt(process.env.CACHE_TTL_METRICS || "300", 10),
  },
};
