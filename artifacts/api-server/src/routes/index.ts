import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import setupRouter from "./setup.js";
import authRouter from "./auth.js";
import studentsRouter from "./students.js";
import staffRouter from "./staff.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(setupRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(staffRouter);
router.use(adminRouter);

export default router;
