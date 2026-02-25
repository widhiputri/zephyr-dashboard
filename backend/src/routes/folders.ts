import { Router, Request, Response, NextFunction } from "express";
import { getRootFolders } from "../services/folderService.js";
import { config } from "../config.js";

const router = Router();

router.get("/:projectKey", async (req: Request<{ projectKey: string }>, res: Response, next: NextFunction) => {
  try {
    const { projectKey } = req.params;
    if (!config.teamProjects.has(projectKey)) {
      return res.json([]);
    }
    let folders = await getRootFolders(projectKey);
    const allowedNames = config.teamFolderNames.get(projectKey);
    if (allowedNames) {
      folders = folders.filter((f) => allowedNames.has(f.name));
    }
    res.json(folders);
  } catch (err) {
    next(err);
  }
});

export default router;
