import MetricCard from "./MetricCard";
import { TestCaseMetrics } from "../api/dashboardApi";
import { formatNumber } from "../utils/format";

interface Props {
  testCases: TestCaseMetrics;
}

const InfoTooltip = () => (
  <div className="relative group">
    <button className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors text-xs font-bold cursor-help">
      i
    </button>
    <div className="absolute right-0 top-6 z-10 hidden group-hover:block w-64 bg-gray-900 text-white text-xs rounded-lg p-2.5 shadow-lg leading-relaxed">
      If counts exceed the total, it means some test cases have multiple automation labels and appear in more than one category.
    </div>
  </div>
);

export default function TotalTestCasesCard({ testCases }: Props) {
  return (
    <MetricCard title="Total Test Cases" headerAction={<InfoTooltip />}>
      <div className="flex flex-col items-center justify-center h-[300px]">
        <p className="text-6xl sm:text-7xl font-bold text-blue-600">{formatNumber(testCases.total)}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-medium">Manual: {formatNumber(testCases.manual)}</span>
          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">UI Automation: {formatNumber(testCases.uiAutomation)}</span>
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">API Automation: {formatNumber(testCases.apiAutomation)}</span>
        </div>
        {(testCases.deprecated > 0 || testCases.draft > 0) && (
          <p className="mt-3 text-xs text-gray-400">
            *Excluded:{" "}
            {testCases.deprecated > 0 && `${formatNumber(testCases.deprecated)} deprecated`}
            {testCases.deprecated > 0 && testCases.draft > 0 && ", "}
            {testCases.draft > 0 && `${formatNumber(testCases.draft)} draft`}
          </p>
        )}
      </div>
    </MetricCard>
  );
}
