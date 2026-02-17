import { useState, useEffect } from "react";
import { relativeTime } from "../utils/format";

interface Props {
  pollingInterval: number;
  onPollingChange: (ms: number) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string | null;
}

const INTERVALS = [
  { label: "Off", value: 0 },
  { label: "1 min", value: 60_000 },
  { label: "5 min", value: 300_000 },
  { label: "15 min", value: 900_000 },
];

export default function RefreshControls({
  pollingInterval,
  onPollingChange,
  onRefresh,
  isRefreshing,
  lastUpdated,
}: Props) {
  // Re-render every 15s so relative time stays fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      {lastUpdated && (
        <span
          className="text-xs text-gray-400 w-full sm:w-auto cursor-default"
          title={new Date(lastUpdated).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        >
          Updated {relativeTime(lastUpdated)}
        </span>
      )}
      <select
        value={pollingInterval}
        onChange={(e) => onPollingChange(Number(e.target.value))}
        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm"
      >
        {INTERVALS.map((i) => (
          <option key={i.value} value={i.value}>
            {i.label}
          </option>
        ))}
      </select>
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isRefreshing ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}
