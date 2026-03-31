import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import MetricCard from "./MetricCard";
import { AutomationProgressMetrics } from "../api/dashboardApi";
import { formatNumber } from "../utils/format";

interface Props {
  progress: AutomationProgressMetrics;
}

export default function UIvsAPIAutomationChart({ progress }: Props) {
  const data = [
    {
      name: "UI Automation",
      Automated: progress.ui.completed,
      "Automation In Progress": progress.ui.inProgress,
      "Ready for Automation": progress.ui.readyForAutomation,
      total: progress.ui.total,
      rate: progress.ui.completionRate,
    },
    {
      name: "API Automation",
      Automated: progress.api.completed,
      "Automation In Progress": progress.api.inProgress,
      "Ready for Automation": progress.api.readyForAutomation,
      total: progress.api.total,
      rate: progress.api.completionRate,
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const row = data.find((d) => d.name === label);
    return (
      <div className="bg-white border border-gray-200 rounded shadow p-3 text-xs">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill }}>
            {p.name}: {formatNumber(p.value)}
          </p>
        ))}
        {row && <p className="mt-1 text-gray-500">Total: {formatNumber(row.total)} · {row.rate}% automated</p>}
      </div>
    );
  };

  return (
    <MetricCard title="UI vs API Automation">
      <div className="flex justify-around mb-3">
        {data.map((d) => (
          <div key={d.name} className="text-center">
            <p className="text-2xl font-bold text-gray-900">{d.rate}%</p>
            <p className="text-xs text-gray-500">{d.name}</p>
            <p className="text-xs text-gray-400">{formatNumber(d.Automated)}/{formatNumber(d.total)} automated</p>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={195}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Bar dataKey="Automated" stackId="a" fill="#10B981">
            <LabelList dataKey="Automated" position="inside" fontSize={11} fill="#fff" />
          </Bar>
          <Bar dataKey="Automation In Progress" stackId="a" fill="#F59E0B">
            <LabelList dataKey="Automation In Progress" position="inside" fontSize={11} fill="#fff" />
          </Bar>
          <Bar dataKey="Ready for Automation" stackId="a" fill="#9CA3AF">
            <LabelList dataKey="Ready for Automation" position="inside" fontSize={11} fill="#fff" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
