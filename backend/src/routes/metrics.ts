import { Router, Request, Response, NextFunction } from "express";
import { getMetrics, getFolderCoverage } from "../services/metricsService.js";
import { invalidateMetrics } from "../cache/cacheManager.js";

const router = Router();

router.get("/:projectKey", async (req: Request<{ projectKey: string }>, res: Response, next: NextFunction) => {
  try {
    const { projectKey } = req.params;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;
    const teamFolderId = req.query.teamFolderId ? parseInt(req.query.teamFolderId as string, 10) : undefined;
    const metrics = await getMetrics(projectKey, days, teamFolderId);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

router.get("/:projectKey/folder-coverage", async (req: Request<{ projectKey: string }>, res: Response, next: NextFunction) => {
  try {
    const { projectKey } = req.params;
    const teamFolderId = req.query.teamFolderId ? parseInt(req.query.teamFolderId as string, 10) : undefined;
    const rows = await getFolderCoverage(projectKey, teamFolderId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/:projectKey/refresh", async (req: Request<{ projectKey: string }>, res: Response, next: NextFunction) => {
  try {
    const { projectKey } = req.params;
    invalidateMetrics(projectKey);
    const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;
    const teamFolderId = req.query.teamFolderId ? parseInt(req.query.teamFolderId as string, 10) : undefined;
    const metrics = await getMetrics(projectKey, days, teamFolderId);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

export default router;
