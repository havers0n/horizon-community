import { Router } from "express";
import { storage } from "../storage";
import { BusinessLogic } from "../businessLogic";

const router = Router();
const logic = new BusinessLogic(storage);

// Проверка лимита заявок/отпусков для текущего пользователя
router.get("/check-limit", async (req: any, res) => {
  if (!req.user) return res.status(401).json({ allowed: false, reason: "Unauthorized" });
  const { type } = req.query;
  if (!type) return res.status(400).json({ allowed: false, reason: "Type required" });
  const result = await logic.canSubmitApplication(req.user.id, String(type));
  if (!result.allowed) {
    return res.status(429).json(result);
  }
  res.json(result);
});

export default router;
