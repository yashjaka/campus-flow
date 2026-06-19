import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../models/User.js";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: insufficient permissions" });
      return;
    }
    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireRole("admin")(req, res, next);
}

export function requireStaff(req: Request, res: Response, next: NextFunction): void {
  requireRole("faculty", "maintenance", "admin")(req, res, next);
}
