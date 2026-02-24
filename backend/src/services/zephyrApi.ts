import axios, { AxiosInstance } from "axios";
import { config } from "../config.js";

let apiClient: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!apiClient) {
    apiClient = axios.create({
      baseURL: "https://api.zephyrscale.smartbear.com/v2",
      headers: {
        Authorization: `Bearer ${config.zephyrApiToken}`,
        Accept: "application/json",
      },
    });
  }
  return apiClient;
}

interface PaginatedResponse<T> {
  values: T[];
  startAt: number;
  maxResults: number;
  total: number;
  isLast: boolean;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchAllPages<T>(
  path: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const client = getClient();
  const maxResults = 100;

  // Fetch first page to get total count
  const firstRes = await client.get<PaginatedResponse<T>>(path, {
    params: { ...params, startAt: 0, maxResults },
  });
  const firstPage = firstRes.data;
  const allItems: T[] = [...firstPage.values];

  if (firstPage.isLast || firstPage.total <= maxResults) {
    return allItems;
  }

  // Fire all remaining pages in parallel
  const remainingStarts: number[] = [];
  for (let startAt = maxResults; startAt < firstPage.total; startAt += maxResults) {
    remainingStarts.push(startAt);
  }

  const pages = await Promise.all(
    remainingStarts.map((startAt) =>
      client.get<PaginatedResponse<T>>(path, {
        params: { ...params, startAt, maxResults },
      }).then((r) => r.data.values)
    )
  );

  for (const page of pages) {
    allItems.push(...page);
  }

  return allItems;
}

export async function fetchSingle<T>(path: string): Promise<T> {
  const client = getClient();
  const res = await client.get<T>(path);
  return res.data;
}
