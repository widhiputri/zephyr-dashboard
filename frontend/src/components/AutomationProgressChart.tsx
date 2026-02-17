import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import MetricCard from "./MetricCard";
import { AutomationProgressMetrics } from "../api/dashboardApi";
import { formatNumber } from "../utils/format";

interface Props {
  progress: AutomationProgressMetrics;
}

export default function AutomationProgressChart({ progress }: Props) {
  const data = [
    { name: "Completed", value: progress.completed, fill: "#10B981" },
    { name: "In Progress", value: progress.inProgress, fill: "#F59E0B" },
    { name: "Ready", value: progress.readyForAutomation, fill: "#9CA3AF" },
  ];

  return (
    <MetricCard title="Automation Progress">
      <div className="text-center mb-3">
        <span className="text-3xl sm:text-4xl font-bold text-gray-900">
          {progress.completionRate}%
        </span>
        <span className="text-sm text-gray-500 ml-2">
          ({formatNumber(progress.completed)}/{formatNumber(progress.total)} completed)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip />
          <Bar dataKey="value" name="Test Cases">
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
            <LabelList dataKey="value" position="top" fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
