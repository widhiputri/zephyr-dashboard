import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    dataSource: "zephyr-scale-rest-api",
    timestamp: new Date().toISOString(),
  });
});

export default router;
