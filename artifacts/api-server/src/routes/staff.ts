import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import User, { serializeUser } from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/authorize.js";
import {
  CreateStaffBody,
  UpdateStaffBody,
  GetStaffMemberParams,
  UpdateStaffParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/staff", requireAuth, requireAdmin, async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ["faculty", "maintenance"] } }).sort({ createdAt: -1 });
    res.json(staff.map(serializeUser));
  } catch (err) {
    req.log.error({ err }, "List staff failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/staff", requireAuth, requireAdmin, async (req, res) => {
  try {
    const parsed = CreateStaffBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const { name, email, password, role, department } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);

    const member = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      department: department ?? undefined,
    });

    await ActivityLog.create({
      type: "staff_added",
      description: `${role === "faculty" ? "Faculty" : "Maintenance staff"} member ${name} added`,
      actor: req.user!.name,
      actorId: req.user!.userId,
    });

    res.status(201).json(serializeUser(member));
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    req.log.error({ err }, "Create staff failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/staff/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const paramsParsed = GetStaffMemberParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid params" });
      return;
    }

    const member = await User.findOne({
      _id: paramsParsed.data.id,
      role: { $in: ["faculty", "maintenance"] },
    });

    if (!member) {
      res.status(404).json({ error: "Staff member not found" });
      return;
    }

    res.json(serializeUser(member));
  } catch (err) {
    req.log.error({ err }, "Get staff failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/staff/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const paramsParsed = UpdateStaffParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid params" });
      return;
    }

    const parsed = UpdateStaffBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const member = await User.findOneAndUpdate(
      { _id: paramsParsed.data.id, role: { $in: ["faculty", "maintenance"] } },
      { $set: parsed.data },
      { new: true },
    );

    if (!member) {
      res.status(404).json({ error: "Staff member not found" });
      return;
    }

    res.json(serializeUser(member));
  } catch (err) {
    req.log.error({ err }, "Update staff failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
