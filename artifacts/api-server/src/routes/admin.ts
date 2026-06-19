import { Router, type IRouter } from "express";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/authorize.js";

const router: IRouter = Router();

router.get("/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalStudents, totalFaculty, totalMaintenance, totalAdmins, recentRegistrations] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "faculty" }),
        User.countDocuments({ role: "maintenance" }),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ role: "student", createdAt: { $gte: sevenDaysAgo } }),
      ]);

    res.json({
      totalStudents,
      totalFaculty,
      totalMaintenance,
      totalAdmins,
      recentRegistrations,
    });
  } catch (err) {
    req.log.error({ err }, "Get admin stats failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/activity", requireAuth, requireAdmin, async (req, res) => {
  try {
    const activity = await ActivityLog.find().sort({ createdAt: -1 }).limit(20);
    res.json(
      activity.map((a) => ({
        id: a._id.toString(),
        type: a.type,
        description: a.description,
        actor: a.actor,
        timestamp: a.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Get recent activity failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
