import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import MetricCard from "./MetricCard";
import { TestCaseMetrics, AutomationProgressMetrics } from "../api/dashboardApi";

const COLORS = ["#8B5CF6", "#10B981", "#F59E0B", "#9CA3AF"];

interface Props {
  testCases: TestCaseMetrics;
  automationProgress: AutomationProgressMetrics;
}

function CustomLegend({ payload }: any) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
      {payload?.map((entry: any) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs font-medium text-gray-500">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function ManualVsAutomatedChart({ testCases, automationProgress }: Props) {
  const data = [
    { name: "Manual", value: testCases.manual },
    { name: "Automated", value: automationProgress.completed },
    { name: "Automation In Progress", value: automationProgress.inProgress },
    { name: "Ready for Automation", value: automationProgress.readyForAutomation },
  ].filter((d) => d.value > 0);

  return (
    <MetricCard title="Test Case Breakdown">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="30%"
            outerRadius="52%"
            paddingAngle={2}
            dataKey="value"
            label={({ percent }) =>
              percent * 100 < 0.5 ? "" : `${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value, "Test Cases"]} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
