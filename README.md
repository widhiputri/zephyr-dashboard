# Zephyr Scale QA Metrics Dashboard

A dashboard that visualizes QA metrics from [Zephyr Scale](https://smartbear.com/test-management/zephyr-scale/) (Test Management for Jira). Built as a monorepo with a Node.js/Express backend and React frontend.

## Features

### Dashboard
- **Project selector** — browse all Zephyr Scale projects
- **Squad filter** — narrow metrics to a specific team sub-folder per project
- **Test case overview** — total count with manual vs automated breakdown, excludes deprecated and draft test cases
- **Automation progress** — tracks test cases through Ready for Automation, In Progress, and Completed stages; handles test cases with multiple automation labels (UI + API) without double-counting
- **UI vs API automation** — dedicated breakdown chart for automation type split
- **Test case breakdown** — pie chart showing manual, automation done, in-progress, and ready-for-automation
- **Execution results** — pass/fail/blocked/not executed breakdown
- **Pass rate** — percentage with colour-coded indicator
- **Execution rate** — radial gauge showing percentage of test cases executed
- **Execution trend** — monthly pass/fail/blocked line chart
- **Test cases added per month** — bar + cumulative line combo chart
- **Feature coverage** — folder-level automation coverage table with progress bars
- **Date range filter** — last 7, 30, 90 days, or all time
- **Auto-refresh** — configurable polling interval (1 min to 30 min)
- **PDF export** — one-click export of the dashboard view
- **Responsive layout** — works on different screen sizes

### Forecast
- **Pass rate forecast** — Holt's Double Exponential Smoothing model predicts pass rate trend up to 6 months ahead with confidence interval band
- **Forecast summary panel** — dynamic insight text with trend direction, velocity, and data quality assessment
- **Methodology modal** — explains the forecasting model, data requirements, and confidence band calculation

### CI Sync
- **Cucumber HTML report upload** — drag-and-drop or browse to upload a Cucumber HTML report from CI/CD
- **Execution preview** — parses `window.CUCUMBER_MESSAGES` from the report and shows a table of test case keys, scenario names, and pass/fail/skipped status before pushing
- **Push to Zephyr** — auto-creates a named test cycle and posts individual execution results to Zephyr Scale
- **Run metadata** — optional Git ref and Job ID fields embedded in the cycle name for traceability (`[CI Run][Git Ref abc1234] Job 123 on YYYY-MM-DD HH:mm`)
- **Multi-key scenarios** — a single scenario name can contain multiple Zephyr keys (e.g. `[AM-T134][AM-T654]`), each producing a separate execution record

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express 4, TypeScript |
| Frontend | React 18, TypeScript, Vite |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Data fetching | TanStack React Query v5 |
| Caching | node-cache (in-memory, TTL-based) |
| PDF export | html2canvas + jsPDF |
| Forecasting | Holt's Double Exponential Smoothing (custom implementation) |

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9 (uses npm workspaces)
- A **Zephyr Scale API token** — generate one from [Zephyr Scale API tokens](https://support.smartbear.com/zephyr-scale-cloud/docs/rest-api/generating-api-access-tokens.html)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/widhiputri/zephyr-dashboard.git
   cd zephyr-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your values. See [Environment Variables](#environment-variables) below.

4. **Start development servers**

   ```bash
   npm run dev
   ```

   This starts both backend (`http://localhost:3002`) and frontend (`http://localhost:5173`) concurrently.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ZEPHYR_API_TOKEN` | Yes | — | Zephyr Scale API token |
| `PORT` | No | `3002` | Backend server port |
| `CACHE_TTL_PROJECTS` | No | `3600` | Cache TTL for project list (seconds) |
| `CACHE_TTL_METRICS` | No | `300` | Cache TTL for metrics (seconds) |
| `CORS_ORIGIN` | No | unset (allow all) | Allowed CORS origin(s), comma-separated. Set this in production. Example: `https://qa-dashboard.yourcompany.com` |
| `TEAM_PROJECTS` | No | unset | Comma-separated project keys that have team sub-folders. Only these projects show the Squad filter. |
| `TEAM_FOLDERS_<PROJECT>` | No | unset | Allowlist of folder names shown as squad options for a project. Example: `TEAM_FOLDERS_PROJ1=Team A,Team B` |

## Project Structure

```
zephyr-dashboard/
├── backend/
│   └── src/
│       ├── index.ts              # Express server entry point
│       ├── config.ts             # Environment variable loading
│       ├── services/
│       │   ├── zephyrApi.ts      # Zephyr Scale REST API client (pagination + POST)
│       │   ├── projectService.ts
│       │   ├── folderService.ts  # Team folder fetching
│       │   ├── testCaseService.ts
│       │   ├── testExecutionService.ts
│       │   ├── metricsService.ts # Aggregation and metric computation
│       │   ├── forecastService.ts # Holt's DES pass rate forecasting engine
│       │   └── ciSyncService.ts  # Cucumber HTML parser + Zephyr execution push
│       ├── routes/
│       │   ├── health.ts         # GET /api/health
│       │   ├── projects.ts       # GET /api/projects
│       │   ├── folders.ts        # GET /api/folders/:projectKey
│       │   ├── metrics.ts        # GET/POST /api/metrics/:projectKey
│       │   └── ciSync.ts         # POST /api/ciSync/:projectKey/preview|push
│       ├── cache/
│       │   └── cacheManager.ts   # In-memory cache with TTL
│       ├── middleware/
│       │   ├── errorHandler.ts
│       │   └── rateLimiter.ts
│       └── types/
│           ├── metrics.ts        # Shared metric interfaces
│           └── zephyr.ts         # Zephyr API response types
├── frontend/
│   └── src/
│       ├── App.tsx               # Root: project/team state, page routing
│       ├── api/dashboardApi.ts   # All React Query hooks and API types
│       ├── components/
│       │   ├── Layout.tsx                  # Header + nav tabs (Dashboard / Forecast / CI Sync)
│       │   ├── DashboardGrid.tsx           # Main dashboard layout
│       │   ├── TotalTestCasesCard.tsx      # Test case count with deprecated/draft exclusion note
│       │   ├── AutomationProgressChart.tsx # Progress bars with multi-label info note
│       │   ├── ManualVsAutomatedChart.tsx  # Test case breakdown pie chart
│       │   ├── UIvsAPIAutomationChart.tsx  # UI vs API automation bar chart
│       │   ├── ExecutionResultsChart.tsx   # Bar chart by execution status
│       │   ├── ExecutionTrendChart.tsx     # Monthly trend line chart
│       │   ├── TestCaseTrendChart.tsx      # Monthly additions + cumulative
│       │   ├── PassRateCard.tsx
│       │   ├── ExecutionRateGauge.tsx
│       │   ├── FolderCoverageTable.tsx     # Folder-level automation coverage table
│       │   ├── PassRateForecastChart.tsx   # Forecast chart with confidence band
│       │   ├── ForecastInfoModal.tsx       # Methodology explanation modal
│       │   ├── ForecastSummaryPanel.tsx    # Dynamic trend analysis panel
│       │   ├── ProjectSelector.tsx
│       │   ├── TeamFilter.tsx              # Squad pill-filter with reset button
│       │   ├── DateRangeFilter.tsx
│       │   └── RefreshControls.tsx
│       ├── pages/
│       │   ├── ForecastPage.tsx            # Predictive analytics page
│       │   └── CISyncPage.tsx             # CI Sync upload / preview / done flow
│       └── utils/
│           ├── forecastSummary.ts          # buildForecastInsight() logic
│           ├── exportPdf.ts               # html2canvas + jsPDF export
│           └── format.ts                  # Number/date formatting helpers
├── .env.example
├── .gitignore
└── package.json                  # npm workspaces root
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with server status |
| GET | `/api/projects` | List all Zephyr Scale projects |
| GET | `/api/folders/:projectKey` | List team folders for a project |
| GET | `/api/metrics/:projectKey` | Get computed metrics for a project |
| GET | `/api/metrics/:projectKey?days=30&teamFolderId=<id>` | Metrics filtered by date range and/or squad folder |
| GET | `/api/metrics/:projectKey/folder-coverage` | Get folder-level automation coverage |
| POST | `/api/metrics/:projectKey/refresh` | Force cache refresh |
| POST | `/api/ciSync/:projectKey/preview` | Parse a Cucumber HTML report and return execution preview |
| POST | `/api/ciSync/:projectKey/push` | Push pre-parsed executions to Zephyr Scale (creates test cycle) |
