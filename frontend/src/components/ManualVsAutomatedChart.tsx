import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import MetricCard from "./MetricCard";
import { TestCaseMetrics, AutomationProgressMetrics } from "../api/dashboardApi";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#9CA3AF"];

interface Props {
  testCases: TestCaseMetrics;
  automationProgress: AutomationProgressMetrics;
}

export default function ManualVsAutomatedChart({ testCases, automationProgress }: Props) {
  const data = [
    { name: "Manual", value: testCases.manual },
    { name: "Automated (Done)", value: automationProgress.completed },
    { name: "Automation In Progress", value: automationProgress.inProgress },
    { name: "Ready for Automation", value: automationProgress.readyForAutomation },
  ].filter((d) => d.value > 0);

  return (
    <MetricCard title="Test Case Breakdown">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="30%"
            outerRadius="52%"
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              `${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value, "Test Cases"]} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
        </PieChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
