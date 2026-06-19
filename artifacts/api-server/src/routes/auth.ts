import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import User, { serializeUser } from "../models/User.js";
import { signToken, requireAuth } from "../middlewares/auth.js";
import {
  StudentEntryBody,
  StaffLoginBody,
  AdminLoginBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/student-entry", async (req, res) => {
  try {
    const parsed = StudentEntryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const student = await User.findOne({
      enrollmentNumber: parsed.data.enrollmentNumber,
      role: "student",
      isActive: true,
    });

    if (!student) {
      res.status(404).json({ error: "Student not found with that enrollment number" });
      return;
    }

    const token = signToken({ userId: student._id.toString(), role: "student", name: student.name });
    res.json({ token, user: serializeUser(student) });
  } catch (err) {
    req.log.error({ err }, "Student entry failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/staff-login", async (req, res) => {
  try {
    const parsed = StaffLoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const staff = await User.findOne({
      email: parsed.data.email.toLowerCase(),
      role: { $in: ["faculty", "maintenance"] },
      isActive: true,
    }).select("+passwordHash");

    if (!staff || !(await staff.comparePassword(parsed.data.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: staff._id.toString(), role: staff.role, name: staff.name });
    res.json({ token, user: serializeUser(staff) });
  } catch (err) {
    req.log.error({ err }, "Staff login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/admin-login", async (req, res) => {
  try {
    const parsed = AdminLoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const admin = await User.findOne({
      email: parsed.data.email.toLowerCase(),
      role: "admin",
      isActive: true,
    }).select("+passwordHash");

    if (!admin || !(await admin.comparePassword(parsed.data.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: admin._id.toString(), role: "admin", name: admin.name });
    res.json({ token, user: serializeUser(admin) });
  } catch (err) {
    req.log.error({ err }, "Admin login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ error: "User not found or inactive" });
      return;
    }
    res.json(serializeUser(user));
  } catch (err) {
    req.log.error({ err }, "Get me failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", requireAuth, (_req, res) => {
  res.json({ success: true });
});

export default router;
