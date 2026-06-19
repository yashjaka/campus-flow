import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { store, serializeUser } from "../lib/store.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireAdmin } from "../middlewares/authorize.js";
import { CreateStaffBody, UpdateStaffBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/staff", requireAuth, requireAdmin, (_req, res) => {
  res.json(store.getStaff().map(serializeUser));
});

router.post("/staff", requireAuth, requireAdmin, async (req, res) => {
  try {
    const parsed = CreateStaffBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const { name, email, password, role, department } = parsed.data;

    const existing = store.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const member = store.createUser({
      name,
      email,
      passwordHash,
      role,
      department: department ?? undefined,
      isActive: true,
    });

    store.addActivityLog({
      type: "staff_added",
      description: `${role === "faculty" ? "Faculty" : "Maintenance staff"} member ${name} added`,
      actor: req.user!.name,
      actorId: req.user!.userId,
    });

    res.status(201).json(serializeUser(member));
  } catch (err) {
    req.log.error({ err }, "Create staff failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/staff/:id", requireAuth, requireAdmin, (req, res) => {
  const id = req.params["id"] as string;
  const member = store.findUserById(id);
  if (!member || (member.role !== "faculty" && member.role !== "maintenance")) {
    res.status(404).json({ error: "Staff member not found" });
    return;
  }
  res.json(serializeUser(member));
});

router.patch("/staff/:id", requireAuth, requireAdmin, (req, res) => {
  try {
    const id = req.params["id"] as string;
    const parsed = UpdateStaffBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const member = store.findUserById(id);
    if (!member || (member.role !== "faculty" && member.role !== "maintenance")) {
      res.status(404).json({ error: "Staff member not found" });
      return;
    }

    const updateData = {
      ...parsed.data,
      department: parsed.data.department ?? undefined,
    };
    const updated = store.updateUser(id, updateData);
    res.json(serializeUser(updated!));
  } catch (err) {
    req.log.error({ err }, "Update staff failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
