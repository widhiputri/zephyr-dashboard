import { fetchAllPages } from "./zephyrApi.js";
import NodeCache from "node-cache";

interface ZephyrFolder {
  id: number;
  name: string;
  parentId: number | null;
}

// Folders change rarely — cache for 1 hour
const folderCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });

async function fetchFolders(projectKey: string): Promise<ZephyrFolder[]> {
  const cached = folderCache.get<ZephyrFolder[]>(projectKey);
  if (cached) return cached;

  const folders = await fetchAllPages<ZephyrFolder>("/folders", {
    projectKey,
    folderType: "TEST_CASE",
  });

  folderCache.set(projectKey, folders);
  return folders;
}

/** Root folders (no parent) — each represents a top-level team */
export async function getRootFolders(projectKey: string): Promise<{ id: number; name: string }[]> {
  const folders = await fetchFolders(projectKey);
  return folders
    .filter((f) => f.parentId === null)
    .map((f) => ({ id: f.id, name: f.name }));
}

/**
 * Returns a map of folderId → rootFolderId for every folder in the project.
 * Used to determine which team a test case belongs to.
 */
export async function buildTeamMap(projectKey: string): Promise<Map<number, number>> {
  const folders = await fetchFolders(projectKey);

  const parentMap = new Map<number, number | null>();
  for (const f of folders) {
    parentMap.set(f.id, f.parentId);
  }

  function getRootId(id: number): number {
    let current = id;
    while (parentMap.get(current) !== null && parentMap.get(current) !== undefined) {
      current = parentMap.get(current)!;
    }
    return current;
  }

  const teamMap = new Map<number, number>();
  for (const f of folders) {
    teamMap.set(f.id, getRootId(f.id));
  }
  return teamMap;
}
