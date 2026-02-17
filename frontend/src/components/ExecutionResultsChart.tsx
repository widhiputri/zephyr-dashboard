import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import MetricCard from "./MetricCard";
import { ExecutionResultMetrics } from "../api/dashboardApi";
import { formatNumber } from "../utils/format";

interface Props {
  results: ExecutionResultMetrics;
}

export default function ExecutionResultsChart({ results }: Props) {
  const data = [
    { name: "Pass", value: results.pass, fill: "#10B981" },
    { name: "Fail", value: results.fail, fill: "#EF4444" },
    { name: "Blocked", value: results.blocked, fill: "#F59E0B" },
    { name: "Not Executed", value: results.notExecuted, fill: "#9CA3AF" },
  ];

  return (
    <MetricCard title="Execution Results">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip formatter={(value: number) => formatNumber(value)} />
          <Bar dataKey="value" name="Count">
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
