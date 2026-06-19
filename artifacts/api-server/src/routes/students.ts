import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import User, { serializeUser } from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireStaff, requireAdmin } from "../middlewares/authorize.js";
import {
  CreateStudentBody,
  UpdateStudentBody,
  GetStudentParams,
  UpdateStudentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/students", requireAuth, requireStaff, async (req, res) => {
  try {
    const students = await User.find({ role: "student", isActive: true }).sort({ createdAt: -1 });
    res.json(students.map(serializeUser));
  } catch (err) {
    req.log.error({ err }, "List students failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/students", requireAuth, requireAdmin, async (req, res) => {
  try {
    const parsed = CreateStudentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const { name, enrollmentNumber, collegeName, department, semester } = parsed.data;

    const existing = await User.findOne({ enrollmentNumber });
    if (existing) {
      res.status(409).json({ error: "Enrollment number already registered" });
      return;
    }

    const student = await User.create({
      name,
      enrollmentNumber,
      collegeName,
      department,
      semester,
      role: "student",
    });

    await ActivityLog.create({
      type: "student_registered",
      description: `Student ${name} (${enrollmentNumber}) registered`,
      actor: req.user!.name,
      actorId: req.user!.userId,
    });

    res.status(201).json(serializeUser(student));
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      res.status(409).json({ error: "Enrollment number already exists" });
      return;
    }
    req.log.error({ err }, "Create student failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/students/:id", requireAuth, requireStaff, async (req, res) => {
  try {
    const paramsParsed = GetStudentParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid params" });
      return;
    }

    const student = await User.findOne({ _id: paramsParsed.data.id, role: "student" });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    res.json(serializeUser(student));
  } catch (err) {
    req.log.error({ err }, "Get student failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/students/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const paramsParsed = UpdateStudentParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid params" });
      return;
    }

    const parsed = UpdateStudentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const student = await User.findOneAndUpdate(
      { _id: paramsParsed.data.id, role: "student" },
      { $set: parsed.data },
      { new: true },
    );

    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    res.json(serializeUser(student));
  } catch (err) {
    req.log.error({ err }, "Update student failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
