import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { store, serializeUser } from "../lib/store.js";
import { signToken } from "../middlewares/auth.js";
import {
  GetSetupStatusResponse,
  CreateAdminSetupBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/setup/status", (_req, res) => {
  const data = GetSetupStatusResponse.parse({
    setupComplete: store.adminExists(),
  });
  res.json(data);
});

router.post("/setup/admin", async (req, res) => {
  try {
    if (store.adminExists()) {
      res.status(409).json({ error: "Setup already complete" });
      return;
    }

    const parsed = CreateAdminSetupBody.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const { name, email, password } = parsed.data;

    const existing = store.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = store.createUser({
      name,
      email,
      passwordHash,
      role: "admin",
      isActive: true,
    });
    const token = signToken({
      userId: admin.id,
      role: "admin",
      name: admin.name,
    });

    res.status(201).json({ token, user: serializeUser(admin) });
  } catch (err) {
    req.log.error({ err }, "Failed to create admin");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
