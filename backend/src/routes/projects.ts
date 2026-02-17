import { Router, Request, Response, NextFunction } from "express";
import { getAllProjects } from "../services/projectService.js";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await getAllProjects();
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

export default router;
