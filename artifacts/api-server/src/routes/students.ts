import { Router, type IRouter } from "express";
import { store, serializeUser } from "../lib/store.js";
import { requireAuth } from "../middlewares/auth.js";
import { requireStaff, requireAdmin } from "../middlewares/authorize.js";
import { CreateStudentBody, UpdateStudentBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/students", requireAuth, requireStaff, (_req, res) => {
  res.json(store.getStudents().map(serializeUser));
});

router.post("/students", requireAuth, requireAdmin, async (req, res) => {
  try {
    const parsed = CreateStudentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const { name, enrollmentNumber, collegeName, department, semester } = parsed.data;

    const existing = store.findStudentByEnrollment(enrollmentNumber);
    if (existing) {
      res.status(409).json({ error: "Enrollment number already registered" });
      return;
    }

    const student = store.createUser({
      name,
      enrollmentNumber,
      collegeName,
      department,
      semester,
      role: "student",
      isActive: true,
    });

    store.addActivityLog({
      type: "student_registered",
      description: `Student ${name} (${enrollmentNumber}) registered`,
      actor: req.user!.name,
      actorId: req.user!.userId,
    });

    res.status(201).json(serializeUser(student));
  } catch (err) {
    req.log.error({ err }, "Create student failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/students/:id", requireAuth, requireStaff, (req, res) => {
  const id = req.params["id"] as string;
  const student = store.findUserById(id);
  if (!student || student.role !== "student") {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json(serializeUser(student));
});

router.patch("/students/:id", requireAuth, requireAdmin, (req, res) => {
  try {
    const id = req.params["id"] as string;
    const parsed = UpdateStudentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
      return;
    }

    const student = store.findUserById(id);
    if (!student || student.role !== "student") {
      res.status(404).json({ error: "Student not found" });
      return;
    }

    const updated = store.updateUser(id, parsed.data);
    res.json(serializeUser(updated!));
  } catch (err) {
    req.log.error({ err }, "Update student failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
