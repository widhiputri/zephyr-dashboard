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
  const allItems: T[] = [];
  let startAt = 0;
  const maxResults = 50;
  let isLast = false;

  while (!isLast) {
    const res = await client.get<PaginatedResponse<T>>(path, {
      params: { ...params, startAt, maxResults },
    });

    const page = res.data;
    allItems.push(...page.values);
    isLast = page.isLast || startAt + maxResults >= page.total;
    startAt += maxResults;

    if (!isLast) {
      await delay(config.paginationDelayMs);
    }
  }

  return allItems;
}

export async function fetchSingle<T>(path: string): Promise<T> {
  const client = getClient();
  const res = await client.get<T>(path);
  return res.data;
}
