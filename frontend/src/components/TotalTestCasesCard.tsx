import MetricCard from "./MetricCard";
import { TestCaseMetrics } from "../api/dashboardApi";
import { formatNumber } from "../utils/format";

interface Props {
  testCases: TestCaseMetrics;
}

export default function TotalTestCasesCard({ testCases }: Props) {
  return (
    <MetricCard title="Total Test Cases">
      <div className="flex flex-col items-center justify-center h-[260px]">
        <p className="text-6xl sm:text-7xl font-bold text-gray-900">{formatNumber(testCases.total)}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
          <div>
            <span className="text-gray-500">Manual: </span>
            <span className="font-semibold text-blue-600">{formatNumber(testCases.manual)}</span>
          </div>
          <div>
            <span className="text-gray-500">Automated: </span>
            <span className="font-semibold text-green-600">{formatNumber(testCases.automated)}</span>
          </div>
        </div>
      </div>
    </MetricCard>
  );
}
