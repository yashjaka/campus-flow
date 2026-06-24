import { Router, type IRouter } from "express";
import { store } from "../lib/store.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/authorize.js";

const router: IRouter = Router();

router.get("/admin/stats", requireAuth, requireAdmin, (_req, res) => {
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const allUsers = store.users;
  const totalStudents = allUsers.filter((u) => u.role === "student").length;
  const totalFaculty = allUsers.filter((u) => u.role === "faculty").length;
  const totalMaintenance = allUsers.filter(
    (u) => u.role === "maintenance",
  ).length;
  const totalAdmins = allUsers.filter((u) => u.role === "admin").length;
  const recentRegistrations = allUsers.filter(
    (u) => u.role === "student" && u.createdAt >= sevenDaysAgo,
  ).length;

  res.json({
    totalStudents,
    totalFaculty,
    totalMaintenance,
    totalAdmins,
    recentRegistrations,
  });
});

router.get("/admin/activity", requireAuth, requireAdmin, (_req, res) => {
  res.json(store.getRecentActivity());
});

export default router;
