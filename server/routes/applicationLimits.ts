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

// Проверка лимита заявок/отпусков для текущего пользователя (новый endpoint)
router.get("/:type", async (req: any, res) => {
  if (!req.user) return res.status(401).json({ restriction: { allowed: false, reason: "Unauthorized" } });
  const { type } = req.params;
  if (!type) return res.status(400).json({ restriction: { allowed: false, reason: "Type required" } });
  
  try {
    const result = await logic.canSubmitApplication(req.user.id, String(type));
    res.json({ restriction: result });
  } catch (error) {
    console.error('Error checking application limit:', error);
    res.status(500).json({ restriction: { allowed: false, reason: "Internal server error" } });
  }
});

export default router;
