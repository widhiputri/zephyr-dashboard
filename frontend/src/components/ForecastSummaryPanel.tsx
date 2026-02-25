import { ForecastInsight, ForecastStatus } from "../utils/forecastSummary";

interface Props {
  insight: ForecastInsight;
  dataPointsUsed: number;
}

const statusStyles: Record<ForecastStatus, { badge: string; border: string; icon: string }> = {
  healthy: {
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
    icon: "✓",
  },
  warning: {
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
    icon: "⚠",
  },
  critical: {
    badge: "bg-red-100 text-red-700",
    border: "border-red-200",
    icon: "✕",
  },
};

export default function ForecastSummaryPanel({ insight, dataPointsUsed }: Props) {
  const style = statusStyles[insight.status];

  return (
    <div className={`rounded-lg border ${style.border} bg-white p-5 space-y-4`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
          <span>{style.icon}</span>
          {insight.statusLabel}
        </span>
        <h4 className="text-sm font-semibold text-gray-800">Analysis &amp; Recommendations</h4>
        <span className="ml-auto text-xs text-gray-400">
          Model: Holt's DES · {dataPointsUsed} data point{dataPointsUsed !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Analysis paragraphs */}
      <div className="space-y-2">
        {insight.analysis.map((para, i) => (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {para}
          </p>
        ))}
      </div>

      {/* Suggestions */}
      {insight.suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Recommendations
          </p>
          <ul className="space-y-1.5">
            {insight.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="mt-0.5 text-blue-500 shrink-0">→</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
