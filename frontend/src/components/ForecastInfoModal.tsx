interface Props {
  onClose: () => void;
}

export default function ForecastInfoModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">About the Pass Rate Forecast</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 text-sm text-gray-700">

          {/* Reading the chart */}
          <section>
            <h3 className="font-semibold text-gray-900 mb-2">How to read the chart</h3>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="mt-0.5 h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                <span>
                  <span className="font-medium text-emerald-600">Green solid line</span> — Historical monthly pass rate.
                  Each point is the percentage of test executions that passed in that month:
                  <span className="block mt-0.5 font-mono text-xs bg-gray-50 rounded px-2 py-1 text-gray-600">
                    pass rate = passes ÷ (passes + failures + blocked) × 100
                  </span>
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-3 w-3 rounded-full bg-violet-500 shrink-0" />
                <span>
                  <span className="font-medium text-violet-600">Purple dashed line</span> — Predicted pass rate for the
                  next 3 months, extrapolated from the historical trend.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 h-3 w-3 rounded-full bg-indigo-300 shrink-0" />
                <span>
                  <span className="font-medium text-indigo-500">Shaded band</span> — 90% confidence interval around
                  each forecast point. The band widens the further out we predict, because uncertainty grows over time.
                  If the band is narrow, the historical trend has been consistent. If it is wide, the pass rate has
                  been volatile and the forecast is less certain.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-gray-400 shrink-0">│</span>
                <span>
                  <span className="font-medium text-gray-500">Vertical dashed line</span> — The boundary between
                  history and forecast.
                </span>
              </li>
            </ul>
          </section>

          {/* How to use it */}
          <section>
            <h3 className="font-semibold text-gray-900 mb-2">How to use this forecast</h3>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600">
              <li>
                <span className="font-medium text-gray-800">Sprint / release planning</span> — if the forecast shows
                a declining pass rate, schedule extra capacity for bug fixes or test stabilisation before the next release.
              </li>
              <li>
                <span className="font-medium text-gray-800">Early risk detection</span> — a forecast below your target
                (e.g. 90%) is a leading indicator to investigate now rather than at release gate.
              </li>
              <li>
                <span className="font-medium text-gray-800">Trend validation</span> — compare the forecast against
                actual results each month to judge whether the QA process is improving as expected.
              </li>
              <li>
                <span className="font-medium text-gray-800">Wide CI band</span> — signals high month-to-month
                variability. This is a cue to investigate what is causing instability (flaky tests, environment issues,
                large feature drops, etc.).
              </li>
            </ul>
          </section>

          {/* The math */}
          <section>
            <h3 className="font-semibold text-gray-900 mb-2">How the forecast is calculated</h3>
            <p className="text-gray-600 mb-3">
              The model uses <span className="font-medium text-gray-800">Holt's Double Exponential Smoothing (DES)</span>,
              a classical time-series method that tracks two components: the current <em>level</em> (average) and
              the <em>trend</em> (direction of change). No external ML libraries are used.
            </p>

            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Update equations (each month t)</p>
                <p className="font-mono text-xs text-gray-700">Lₜ = α · yₜ + (1 − α) · (Lₜ₋₁ + Bₜ₋₁)</p>
                <p className="font-mono text-xs text-gray-700">Bₜ = β · (Lₜ − Lₜ₋₁) + (1 − β) · Bₜ₋₁</p>
              </div>

              <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Forecast h months ahead</p>
                <p className="font-mono text-xs text-gray-700">ŷₜ₊ₕ = Lₜ + h · Bₜ</p>
              </div>

              <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">90% confidence interval</p>
                <p className="font-mono text-xs text-gray-700">CI = ŷ ± 1.645 × RMSE × √h</p>
                <p className="text-xs text-gray-500 mt-1">RMSE is the root-mean-square error of the fitted values against the historical data.</p>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p><span className="font-medium">yₜ</span> — actual pass rate for month t</p>
                <p><span className="font-medium">Lₜ</span> — smoothed level (estimated current average)</p>
                <p><span className="font-medium">Bₜ</span> — smoothed trend (estimated rate of change per month)</p>
                <p><span className="font-medium">α = 0.3</span> — level smoothing factor. Higher values react faster to recent data; lower values are more stable.</p>
                <p><span className="font-medium">β = 0.1</span> — trend smoothing factor. Kept low so the trend evolves slowly and avoids over-reacting to a single unusual month.</p>
                <p><span className="font-medium">h</span> — forecast horizon (1, 2, or 3 months ahead)</p>
              </div>
            </div>
          </section>

          {/* Limitations */}
          <section>
            <h3 className="font-semibold text-gray-900 mb-2">Limitations</h3>
            <ul className="space-y-1.5 list-disc list-inside text-gray-600">
              <li>At least <span className="font-medium text-gray-800">3 months</span> of execution data are required. Fewer points produce no forecast.</li>
              <li>The model assumes the existing trend continues. It cannot anticipate sudden events (major refactors, team changes, new test suites).</li>
              <li>The forecast always uses <span className="font-medium text-gray-800">all-time data</span>, regardless of the date filter selected on the Dashboard page, to maximise training history.</li>
              <li>Pass rate only counts months where at least one test was executed. Gaps in execution history are skipped.</li>
            </ul>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
