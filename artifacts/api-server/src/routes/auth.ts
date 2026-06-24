import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { store, serializeUser } from "../lib/store.js";
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
      res
        .status(400)
        .json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const student = store.findStudentByEnrollment(parsed.data.enrollmentNumber);
    if (!student) {
      res
        .status(404)
        .json({ error: "Student not found with that enrollment number" });
      return;
    }

    const token = signToken({
      userId: student.id,
      role: "student",
      name: student.name,
    });
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
      res
        .status(400)
        .json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const staff = store.findUserByEmail(parsed.data.email);
    if (!staff || (staff.role !== "faculty" && staff.role !== "maintenance")) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid =
      staff.passwordHash &&
      (await bcrypt.compare(parsed.data.password, staff.passwordHash));
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({
      userId: staff.id,
      role: staff.role,
      name: staff.name,
    });
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
      res
        .status(400)
        .json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const admin = store.findUserByEmail(parsed.data.email);
    if (!admin || admin.role !== "admin") {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid =
      admin.passwordHash &&
      (await bcrypt.compare(parsed.data.password, admin.passwordHash));
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({
      userId: admin.id,
      role: "admin",
      name: admin.name,
    });
    res.json({ token, user: serializeUser(admin) });
  } catch (err) {
    req.log.error({ err }, "Admin login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", requireAuth, (req, res) => {
  try {
    const user = store.findUserById(req.user!.userId);
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
