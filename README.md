# Zephyr Scale QA Metrics Dashboard

A proof-of-concept dashboard that visualizes QA metrics from [Zephyr Scale](https://smartbear.com/test-management/zephyr-scale/) (Test Management for Jira). Built as a monorepo with a Node.js/Express backend and React frontend.

## Features

- **Project selector** — browse all Zephyr Scale projects
- **Test case overview** — total count with manual vs automated breakdown
- **Automation progress** — tracks test cases through Ready for Automation, In Progress, and Completed stages
- **Execution results** — pass/fail/blocked/not executed breakdown (stacked bar chart)
- **Pass rate** — percentage with colour-coded indicator
- **Execution rate** — radial gauge showing percentage of test cases executed
- **Execution trend** — monthly pass/fail/blocked line chart
- **Test cases added per month** — bar + cumulative line combo chart
- **Date range filter** — last 7, 30, 90 days, or all time
- **Auto-refresh** — configurable polling interval (1 min to 30 min)
- **PDF export** — one-click export of the dashboard view
- **Responsive layout** — works on different screen sizes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express 4, TypeScript |
| Frontend | React 18, TypeScript, Vite |
| Charts | Recharts |
| Styling | Tailwind CSS |
| Data fetching | TanStack React Query v5 |
| Caching | node-cache (in-memory) |
| PDF export | html2canvas + jsPDF |

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

   Edit `.env` and fill in your values:

   ```
   ZEPHYR_API_TOKEN=your-zephyr-scale-api-token
   ZEPHYR_BASE_URL=https://your-instance.atlassian.net
   ```

4. **Start development servers**

   ```bash
   npm run dev
   ```

   This starts both backend (`http://localhost:3001`) and frontend (`http://localhost:5173`) concurrently.

## Project Structure

```
zephyr-dashboard/
├── backend/
│   └── src/
│       ├── index.ts              # Express server entry point
│       ├── config.ts             # Environment variable loading
│       ├── services/
│       │   ├── zephyrApi.ts      # Zephyr Scale REST API client with pagination
│       │   ├── projectService.ts
│       │   ├── testCaseService.ts
│       │   ├── testExecutionService.ts
│       │   └── metricsService.ts # Aggregation and metric computation
│       ├── routes/
│       │   ├── health.ts         # GET /api/health
│       │   ├── projects.ts       # GET /api/projects
│       │   └── metrics.ts        # GET/POST /api/metrics/:projectKey
│       ├── cache/
│       │   └── cacheManager.ts   # In-memory cache with TTL
│       ├── middleware/
│       └── types/
├── frontend/
│   └── src/
│       ├── App.tsx
│       ├── api/dashboardApi.ts   # React Query hooks
│       ├── components/           # Dashboard UI components
│       └── utils/                # Formatting, PDF export
├── .env.example
├── .gitignore
└── package.json                  # npm workspaces root
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with server status |
| GET | `/api/projects` | List all Zephyr Scale projects |
| GET | `/api/metrics/:projectKey` | Get computed metrics for a project |
| GET | `/api/metrics/:projectKey?days=30` | Get metrics filtered by date range |
| POST | `/api/metrics/:projectKey/refresh` | Force cache refresh |

## Building for Production

```bash
npm run build:backend
npm run build:frontend
```

The backend compiles to `backend/dist/` and can be started with `npm run start -w backend`.
The frontend builds to `frontend/dist/` and can be served by any static file server.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
