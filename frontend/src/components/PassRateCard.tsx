import MetricCard from "./MetricCard";
import { formatNumber } from "../utils/format";

interface Props {
  passRate: number;
  executionResults: { pass: number; fail: number; blocked: number };
}

export default function PassRateCard({ passRate, executionResults }: Props) {
  const total = executionResults.pass + executionResults.fail + executionResults.blocked;
  const color =
    passRate >= 80 ? "text-green-600" : passRate >= 60 ? "text-yellow-500" : "text-red-500";

  return (
    <MetricCard title="Pass Rate">
      <div className="flex flex-col items-center justify-center h-[260px]">
        <p className={`text-6xl sm:text-7xl font-bold ${color}`}>{passRate}%</p>
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
          <p>{formatNumber(executionResults.pass)} passed out of {formatNumber(total)} executed</p>
          <p>{formatNumber(executionResults.fail)} failed · {formatNumber(executionResults.blocked)} blocked</p>
        </div>
      </div>
    </MetricCard>
  );
}
