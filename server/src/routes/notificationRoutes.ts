import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getNotifications, markAllRead, markOneRead } from "../controllers/notificationControllers";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getNotifications);
router.put("/read-all", authMiddleware(["manager", "tenant"]), markAllRead);
router.put("/:id/read", authMiddleware(["manager", "tenant"]), markOneRead);

export default router;
