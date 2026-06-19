import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import User, { serializeUser } from "../models/User.js";
import { signToken } from "../middlewares/auth.js";
import { GetSetupStatusResponse, CreateAdminSetupBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/setup/status", async (req, res) => {
  try {
    const adminExists = await User.exists({ role: "admin" });
    const data = GetSetupStatusResponse.parse({ setupComplete: !!adminExists });
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to check setup status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/setup/admin", async (req, res) => {
  try {
    const adminExists = await User.exists({ role: "admin" });
    if (adminExists) {
      res.status(409).json({ error: "Setup already complete" });
      return;
    }

    const parsed = CreateAdminSetupBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const { name, email, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await User.create({ name, email, passwordHash, role: "admin" });
    const token = signToken({ userId: admin._id.toString(), role: "admin", name: admin.name });

    res.status(201).json({ token, user: serializeUser(admin) });
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    req.log.error({ err }, "Failed to create admin");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
