import MetricCard from "./MetricCard";
import { formatNumber } from "../utils/format";

interface Props {
  rate: number;
  executed: number;
  totalTestCases: number;
}

export default function ExecutionRateGauge({ rate, executed, totalTestCases }: Props) {
  const color = rate >= 75 ? "#10B981" : rate >= 50 ? "#F59E0B" : "#EF4444";
  const textColor = rate >= 75 ? "text-green-500" : rate >= 50 ? "text-yellow-500" : "text-red-500";
  const notExecuted = totalTestCases - executed;

  return (
    <MetricCard title="Execution Rate">
      <div className="flex flex-col items-center justify-center h-[300px]">
        <p className={`text-6xl sm:text-7xl font-bold ${textColor}`}>{rate}%</p>
        <div className="w-3/4 mt-5 mb-1">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ width: `${rate}%`, backgroundColor: color }}
            />
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-gray-500 space-y-1">
          <p>{formatNumber(executed)} of {formatNumber(totalTestCases)} test cases executed</p>
          <p>{formatNumber(notExecuted)} remaining</p>
        </div>
      </div>
    </MetricCard>
  );
}
