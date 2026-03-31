import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MetricCard from "./MetricCard";
import { ExecutionTrendPoint } from "../api/dashboardApi";
import { formatNumber } from "../utils/format";

interface Props {
  trend: ExecutionTrendPoint[];
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
      {payload?.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span className="w-5 h-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs font-medium text-gray-500">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ExecutionTrendChart({ trend }: Props) {
  if (trend.length === 0) {
    return (
      <MetricCard title="Execution Trend">
        <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
          No execution data for this period
        </div>
      </MetricCard>
    );
  }

  // Format month labels: "2024-09" → "Sep 24"
  const data = trend.map((t) => {
    const [y, m] = t.month.split("-");
    const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
    });
    return { ...t, label };
  });

  return (
    <MetricCard title="Execution Trend">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={45} />
          <Tooltip formatter={(value: number) => formatNumber(value)} />
          <Legend content={<CustomLegend />} />
          <Line type="monotone" dataKey="pass" stroke="#10B981" name="Pass" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="fail" stroke="#EF4444" name="Fail" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="blocked" stroke="#F59E0B" name="Blocked" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
