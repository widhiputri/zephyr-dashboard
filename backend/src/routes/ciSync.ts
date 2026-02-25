import { Router, Request, Response, NextFunction } from "express";
import express from "express";
import { parseCucumberHtml, pushExecutions, ParsedExecution } from "../services/ciSyncService.js";
import { invalidateAll } from "../cache/cacheManager.js";

const router = Router();

// Parse HTML and return a preview — no writes to Zephyr
router.post(
  "/:projectKey/preview",
  express.text({ limit: "15mb" }),
  async (req: Request<{ projectKey: string }>, res: Response, next: NextFunction) => {
    try {
      const preview = parseCucumberHtml(req.body as string);
      res.json(preview);
    } catch (err) {
      next(err);
    }
  }
);

// Push pre-parsed executions to Zephyr
router.post(
  "/:projectKey/push",
  express.json(),
  async (req: Request<{ projectKey: string }>, res: Response, next: NextFunction) => {
    try {
      const { projectKey } = req.params;
      const { executions, executionDate, gitRef, jobId } = req.body as {
        executions: ParsedExecution[];
        executionDate: string;
        gitRef?: string;
        jobId?: string;
      };
      const result = await pushExecutions(projectKey, executions, executionDate, gitRef, jobId);
      invalidateAll();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
