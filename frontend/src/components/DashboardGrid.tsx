import { DashboardMetrics } from "../api/dashboardApi";
import TotalTestCasesCard from "./TotalTestCasesCard";
import PassRateCard from "./PassRateCard";
import ManualVsAutomatedChart from "./ManualVsAutomatedChart";
import AutomationProgressChart from "./AutomationProgressChart";
import ExecutionResultsChart from "./ExecutionResultsChart";
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
      <PassRateCard passRate={metrics.passRate} executionResults={metrics.executionResults} />
      <ExecutionRateGauge
        rate={metrics.executionRate}
        executed={metrics.executionResults.pass + metrics.executionResults.fail + metrics.executionResults.blocked}
        totalTestCases={metrics.testCases.total}
      />
      <ManualVsAutomatedChart testCases={metrics.testCases} automationProgress={metrics.automationProgress} />
      <AutomationProgressChart progress={metrics.automationProgress} />
      <ExecutionResultsChart results={metrics.executionResults} />
      <div className="md:col-span-2 lg:col-span-3">
        <ExecutionTrendChart trend={metrics.executionTrend} />
      </div>
      <div className="md:col-span-2 lg:col-span-3">
        <TestCaseTrendChart trend={metrics.testCaseTrend} />
      </div>
    </div>
  );
}
