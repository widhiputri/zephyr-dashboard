import { useState, useRef, useCallback } from "react";
import {
  usePreviewSync,
  usePushSync,
  SyncPreview,
  ParsedExecution,
} from "../api/dashboardApi";

interface Props {
  projectKey: string | null;
}

type Step = "idle" | "previewing" | "done";

const STATUS_STYLES: Record<ParsedExecution["status"], string> = {
  PASSED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
  SKIPPED: "bg-gray-100 text-gray-600",
};

export default function CISyncPage({ projectKey }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<SyncPreview | null>(null);
  const [gitRef, setGitRef] = useState("");
  const [jobId, setJobId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewMutation = usePreviewSync();
  const pushMutation = usePushSync();

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".html")) return;
    setFile(f);
    previewMutation.reset();
    pushMutation.reset();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handlePreview = async () => {
    if (!projectKey || !file) return;
    const result = await previewMutation.mutateAsync({ projectKey, file });
    setPreview(result);
    setStep("previewing");
  };

  const handlePush = async () => {
    if (!projectKey || !preview) return;
    await pushMutation.mutateAsync({
      projectKey,
      executions: preview.executions,
      executionDate: new Date().toISOString(),
      gitRef: gitRef.trim() || undefined,
      jobId: jobId.trim() || undefined,
    });
    setStep("done");
  };

  const reset = () => {
    setStep("idle");
    setFile(null);
    setPreview(null);
    setGitRef("");
    setJobId("");
    previewMutation.reset();
    pushMutation.reset();
  };

  if (!projectKey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm">Select a project to use CI Sync</p>
      </div>
    );
  }

  // ── Done ──
  if (step === "done" && pushMutation.data) {
    const { synced, errors } = pushMutation.data;
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {synced} execution{synced !== 1 ? "s" : ""} synced to Zephyr
          </h2>
          <p className="text-sm text-gray-500">
            Test cycle:{" "}
            <span className="font-mono text-gray-700">{pushMutation.data.testCycleKey}</span>
          </p>
          {errors.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-sm font-medium text-red-600 mb-2">
                {errors.length} error{errors.length !== 1 ? "s" : ""}:
              </p>
              <ul className="text-sm text-red-500 space-y-1 max-h-40 overflow-y-auto">
                {errors.map((e) => (
                  <li key={e.testCaseKey}>
                    <span className="font-mono">{e.testCaseKey}</span>: {e.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={reset}
            className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Sync another report
          </button>
        </div>
      </div>
    );
  }

  // ── Preview ──
  if (step === "previewing" && preview) {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Preview</h2>

        {/* Summary bar */}
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
            {preview.total} test cases
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            ✓ {preview.passed} passed
          </span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            ✗ {preview.failed} failed
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
            — {preview.skipped} skipped
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-2 w-28">Key</th>
                  <th className="text-left px-4 py-2">Scenario</th>
                  <th className="text-left px-4 py-2 w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.executions.map((e, i) => (
                  <tr key={i} className="hover:bg-blue-50/40">
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">{e.testCaseKey}</td>
                    <td className="px-4 py-2 text-gray-700 truncate max-w-xs" title={e.testName}>
                      {e.testName}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[e.status]}`}>
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {pushMutation.error && (
          <p className="text-sm text-red-500">{(pushMutation.error as Error).message}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handlePush}
            disabled={pushMutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {pushMutation.isPending ? "Pushing…" : "Push to Zephyr"}
          </button>
          <button
            onClick={reset}
            disabled={pushMutation.isPending}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Idle ──
  return (
    <div className="max-w-xl mx-auto py-12 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">CI Sync</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a Cucumber HTML report to sync execution results to Zephyr Scale.
          Scenario names must contain test case keys like{" "}
          <span className="font-mono text-xs bg-gray-100 px-1 rounded">[AM-T821]</span>.
        </p>
      </div>

      {/* Run metadata */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Git Ref</label>
          <input
            type="text"
            value={gitRef}
            onChange={(e) => setGitRef(e.target.value)}
            placeholder="e.g. 6cec573"
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Job ID</label>
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="e.g. 22379134439"
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={[
          "rounded-xl border-2 border-dashed px-8 py-14 text-center cursor-pointer transition-colors",
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-white",
        ].join(" ")}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".html"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
        />
        {file ? (
          <div>
            <p className="text-sm font-medium text-gray-800">{file.name}</p>
            <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(0)} KB — click to change</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500">Drag & drop a Cucumber HTML report here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse</p>
          </div>
        )}
      </div>

      {previewMutation.error && (
        <p className="text-sm text-red-500">{(previewMutation.error as Error).message}</p>
      )}

      <button
        onClick={handlePreview}
        disabled={!file || previewMutation.isPending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {previewMutation.isPending ? "Parsing…" : "Preview"}
      </button>
    </div>
  );
}
