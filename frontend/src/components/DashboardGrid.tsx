import { DashboardMetrics } from "../api/dashboardApi";
import TotalTestCasesCard from "./TotalTestCasesCard";
import PassRateCard from "./PassRateCard";
import ManualVsAutomatedChart from "./ManualVsAutomatedChart";
import AutomationProgressChart from "./AutomationProgressChart";
import UIvsAPIAutomationChart from "./UIvsAPIAutomationChart";
import ExecutionRateGauge from "./ExecutionRateGauge";
import ExecutionTrendChart from "./ExecutionTrendChart";
import TestCaseTrendChart from "./TestCaseTrendChart";

interface Props {
  metrics: DashboardMetrics;
}

export default function DashboardGrid({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <TotalTestCasesCard testCases={metrics.testCases} />
      <ExecutionRateGauge
        rate={metrics.executionRate}
        executed={metrics.executionResults.pass + metrics.executionResults.fail + metrics.executionResults.blocked}
        totalTestCases={metrics.testCases.total}
      />
      <PassRateCard passRate={metrics.passRate} executionResults={metrics.executionResults} />
      <ManualVsAutomatedChart testCases={metrics.testCases} automationProgress={metrics.automationProgress} />
      <AutomationProgressChart progress={metrics.automationProgress} testCases={metrics.testCases} />
      <UIvsAPIAutomationChart progress={metrics.automationProgress} />
      <div className="md:col-span-2 lg:col-span-3">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trends</h3>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="space-y-4 sm:space-y-6">
          <ExecutionTrendChart trend={metrics.executionTrend} />
          <TestCaseTrendChart trend={metrics.testCaseTrend} />
        </div>
      </div>
    </div>
  );
}
