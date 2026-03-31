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
import { AutomationProgressMetrics, TestCaseMetrics } from "../api/dashboardApi";
import { formatNumber } from "../utils/format";

interface Props {
  progress: AutomationProgressMetrics;
  testCases: TestCaseMetrics;
}

export default function AutomationProgressChart({ progress, testCases }: Props) {
  const multiLabel = testCases.uiAutomation + testCases.apiAutomation - progress.total;
  const data = [
    { name: "Automated", value: progress.completed, fill: "#10B981" },
    { name: "Automation In Progress", value: progress.inProgress, fill: "#F59E0B" },
    { name: "Ready for Automation", value: progress.readyForAutomation, fill: "#9CA3AF" },
  ];

  return (
    <MetricCard title="Automation Progress">
      <div className="text-center mb-3">
        <span className="text-3xl sm:text-4xl font-bold text-gray-900">
          {progress.completionRate}%
        </span>
        <span className="text-sm text-gray-500 ml-2">
          ({formatNumber(progress.completed)}/{formatNumber(progress.total)} automated)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={45} interval={0} />
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
      <p className="mt-2 text-xs text-gray-400 text-center">
        *{formatNumber(progress.total)} automated test cases: {formatNumber(testCases.uiAutomation)} UI + {formatNumber(testCases.apiAutomation)} API
        {multiLabel > 0 && ` and ${formatNumber(multiLabel)} test case(s) counted in both`}
      </p>
    </MetricCard>
  );
}
