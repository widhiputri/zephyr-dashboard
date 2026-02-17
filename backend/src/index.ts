import express from "express";
import cors from "cors";
import { config } from "./config.js";
import healthRouter from "./routes/health.js";
import projectsRouter from "./routes/projects.js";
import metricsRouter from "./routes/metrics.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", apiLimiter);

app.use("/api/health", healthRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/metrics", metricsRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[Server] Listening on http://localhost:${config.port}`);
  console.log("[Server] Using Zephyr Scale REST API directly");
});
