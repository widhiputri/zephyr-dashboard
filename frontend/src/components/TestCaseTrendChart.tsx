import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import MetricCard from "./MetricCard";
import { TestCaseTrendPoint } from "../api/dashboardApi";
import { formatNumber } from "../utils/format";

interface Props {
  trend: TestCaseTrendPoint[];
}

export default function TestCaseTrendChart({ trend }: Props) {
  if (trend.length === 0) {
    return (
      <MetricCard title="Test Cases Added per Month">
        <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
          No test case data available
        </div>
      </MetricCard>
    );
  }

  const data = trend.map((t) => {
    const [y, m] = t.month.split("-");
    const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
    });
    return { ...t, label };
  });

  return (
    <MetricCard title="Test Cases Added per Month">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={45} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={50} />
          <Tooltip formatter={(value: number) => formatNumber(value)} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar yAxisId="left" dataKey="added" fill="#3B82F6" name="Added" barSize={20} radius={[3, 3, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#6366F1" name="Cumulative" strokeWidth={2} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
