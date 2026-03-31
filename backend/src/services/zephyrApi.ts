import { config } from "../config.js";

const BASE_URL = "https://api.zephyrscale.smartbear.com/v2";

interface PaginatedResponse<T> {
  values: T[];
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
}

async function getJson<T>(path: string, params: Record<string, unknown> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${config.zephyrApiToken}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Zephyr API error: ${res.status} ${res.statusText} — ${url.pathname}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAllPages<T>(
  path: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const maxResults = 100;

  const firstPage = await getJson<PaginatedResponse<T>>(path, { ...params, startAt: 0, maxResults });
  const allItems: T[] = [...firstPage.values];

  if (firstPage.isLast || firstPage.total <= maxResults) {
    return allItems;
  }

  const remainingStarts: number[] = [];
  for (let startAt = maxResults; startAt < firstPage.total; startAt += maxResults) {
    remainingStarts.push(startAt);
  }

  const pages = await Promise.all(
    remainingStarts.map((startAt) =>
      getJson<PaginatedResponse<T>>(path, { ...params, startAt, maxResults }).then((r) => r.values)
    )
  );

  for (const page of pages) {
    allItems.push(...page);
  }

  return allItems;
}

export async function fetchSingle<T>(path: string): Promise<T> {
  return getJson<T>(path);
}

export async function postToZephyr<T>(path: string, body: unknown): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.zephyrApiToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.text();
    console.error(`[Zephyr POST ${path}] ${res.status}: ${data}`);
    throw new Error(`Zephyr API ${res.status}: ${data}`);
  }
  return res.json() as Promise<T>;
}
