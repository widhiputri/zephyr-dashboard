import { useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import MetricCard from "./MetricCard";
import ForecastInfoModal from "./ForecastInfoModal";
import { QAForecast } from "../api/dashboardApi";

interface Props {
  forecast: QAForecast | undefined;
}

function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title="How to read this chart"
      className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-colors text-xs font-bold"
    >
      i
    </button>
  );
}

export default function PassRateForecastChart({ forecast }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const infoBtn = <InfoButton onClick={() => setShowInfo(true)} />;

  if (!forecast) {
    return (
      <MetricCard title="Pass Rate Forecast (3-month)" headerAction={infoBtn}>
        <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
          No forecast data available
        </div>
      </MetricCard>
    );
  }

  if (forecast.insufficient) {
    return (
      <MetricCard title="Pass Rate Forecast (3-month)" headerAction={infoBtn}>
        {showInfo && <ForecastInfoModal onClose={() => setShowInfo(false)} />}
        <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
          Insufficient data — need at least 3 months of execution history
          {forecast.dataPointsUsed > 0 && (
            <span className="ml-1">({forecast.dataPointsUsed} month{forecast.dataPointsUsed !== 1 ? "s" : ""} found)</span>
          )}
        </div>
      </MetricCard>
    );
  }

  const firstForecastMonth = forecast.passRate.find((p) => p.isForecast)?.month;

  const data = forecast.passRate.map((p) => {
    const [y, m] = p.month.split("-");
    const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-GB", {
      month: "short",
      year: "2-digit",
    });
    return {
      label,
      month: p.month,
      historical: p.isForecast ? null : p.value,
      predicted: p.isForecast ? p.value : p.value,
      ciRange: p.isForecast ? [p.lower, p.upper] : null,
      isForecast: p.isForecast,
    };
  });

  // First forecast label for the reference line
  const firstForecastLabel = firstForecastMonth
    ? data.find((d) => d.month === firstForecastMonth)?.label
    : undefined;

  return (
    <MetricCard title="Pass Rate Forecast (3-month)" headerAction={infoBtn}>
      {showInfo && <ForecastInfoModal onClose={() => setShowInfo(false)} />}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            width={40}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            formatter={(value, name) => {
              if (value === null || value === undefined) return ["-", name];
              const num = Array.isArray(value) ? Number(value[0]) : Number(value);
              return [`${num.toFixed(1)}%`, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />

          {/* CI band — only for forecast points */}
          <Area
            type="monotone"
            dataKey="ciRange"
            fill="#818CF8"
            fillOpacity={0.2}
            stroke="none"
            name="90% CI"
            legendType="rect"
            connectNulls={false}
          />

          {/* Historical pass rate */}
          <Line
            type="monotone"
            dataKey="historical"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="Historical"
            connectNulls={false}
          />

          {/* Forecast pass rate */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#8B5CF6"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3 }}
            name="Forecast"
            connectNulls
          />

          {firstForecastLabel && (
            <ReferenceLine
              x={firstForecastLabel}
              stroke="#6B7280"
              strokeDasharray="4 2"
              label={{ value: "Forecast →", position: "insideTopLeft", fontSize: 11, fill: "#6B7280" }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </MetricCard>
  );
}
