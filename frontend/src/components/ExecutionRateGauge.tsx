import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import MetricCard from "./MetricCard";
import { formatNumber } from "../utils/format";

interface Props {
  rate: number;
  executed: number;
  totalTestCases: number;
}

export default function ExecutionRateGauge({ rate, executed, totalTestCases }: Props) {
  const data = [
    { name: "rate", value: rate, fill: rate >= 75 ? "#10B981" : rate >= 50 ? "#F59E0B" : "#EF4444" },
  ];

  const notExecuted = totalTestCases - executed;

  return (
    <MetricCard title="Execution Rate">
      <div className="flex flex-col items-center justify-start h-[260px]">
        <div className="relative w-full h-[100px] -mb-2">
          <ResponsiveContainer width="100%" height={120}>
            <RadialBarChart
              cx="50%"
              cy="80%"
              innerRadius="80%"
              outerRadius="110%"
              startAngle={180}
              endAngle={0}
              barSize={16}
              data={data}
            >
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                max={100}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-6xl sm:text-7xl font-bold text-gray-900">{rate}%</p>
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          <p>{formatNumber(executed)} of {formatNumber(totalTestCases)} test cases executed</p>
          <p>{formatNumber(notExecuted)} remaining</p>
        </div>
      </div>
    </MetricCard>
  );
}
