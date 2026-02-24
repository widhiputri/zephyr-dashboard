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
        <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
          <div>
            <span className="text-gray-500">Manual: </span>
            <span className="font-semibold text-blue-600">{formatNumber(testCases.manual)}</span>
          </div>
          <div>
            <span className="text-gray-500">UI Automation: </span>
            <span className="font-semibold text-green-600">{formatNumber(testCases.uiAutomation)}</span>
          </div>
          <div>
            <span className="text-gray-500">API Automation: </span>
            <span className="font-semibold text-teal-600">{formatNumber(testCases.apiAutomation)}</span>
          </div>
        </div>
        {testCases.deprecated > 0 && (
          <p className="mt-3 text-xs text-gray-400">
            *{formatNumber(testCases.deprecated)} deprecated test case(s) excluded
          </p>
        )}
      </div>
    </MetricCard>
  );
}
