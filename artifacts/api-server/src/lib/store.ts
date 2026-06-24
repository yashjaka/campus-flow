import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export type UserRole = "student" | "faculty" | "maintenance" | "admin";

export interface StoreUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  passwordHash?: string;
  enrollmentNumber?: string;
  collegeName?: string;
  department?: string;
  semester?: number;
  isActive: boolean;
  createdAt: string;
}

export interface StoreActivityLog {
  id: string;
  type: string;
  description: string;
  actor: string;
  actorId?: string;
  timestamp: string;
}

function hash(password: string) {
  return bcrypt.hashSync(password, 10);
}

function now() {
  return new Date().toISOString();
}

const seedDate = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86_400_000).toISOString();

const users: StoreUser[] = [
  {
    id: "cu-admin-1",
    name: "Campus Admin",
    role: "admin",
    email: "admin@campusflow.demo",
    passwordHash: hash("admin123"),
    isActive: true,
    createdAt: seedDate(30),
  },
  {
    id: "cu-fac-1",
    name: "Dr. Sarah Mitchell",
    role: "faculty",
    email: "sarah.mitchell@campusflow.demo",
    passwordHash: hash("faculty123"),
    department: "Computer Science",
    isActive: true,
    createdAt: seedDate(25),
  },
  {
    id: "cu-fac-2",
    name: "Prof. James Carter",
    role: "faculty",
    email: "james.carter@campusflow.demo",
    passwordHash: hash("faculty123"),
    department: "Mathematics",
    isActive: true,
    createdAt: seedDate(20),
  },
  {
    id: "cu-mnt-1",
    name: "Carlos Rivera",
    role: "maintenance",
    email: "carlos.rivera@campusflow.demo",
    passwordHash: hash("staff123"),
    isActive: true,
    createdAt: seedDate(18),
  },
  {
    id: "cu-std-1",
    name: "Priya Sharma",
    role: "student",
    enrollmentNumber: "ENR2024001",
    collegeName: "State University of Technology",
    department: "Computer Science",
    semester: 4,
    isActive: true,
    createdAt: seedDate(10),
  },
  {
    id: "cu-std-2",
    name: "Arjun Verma",
    role: "student",
    enrollmentNumber: "ENR2024002",
    collegeName: "State University of Technology",
    department: "Computer Engineering",
    semester: 2,
    isActive: true,
    createdAt: seedDate(8),
  },
  {
    id: "cu-std-3",
    name: "Meera Nair",
    role: "student",
    enrollmentNumber: "ENR2024003",
    collegeName: "State University of Technology",
    department: "Information Technology",
    semester: 6,
    isActive: true,
    createdAt: seedDate(5),
  },
  {
    id: "cu-std-4",
    name: "Rahul Singh",
    role: "student",
    enrollmentNumber: "ENR2024004",
    collegeName: "State University of Technology",
    department: "Mechanical Engineering",
    semester: 1,
    isActive: true,
    createdAt: seedDate(3),
  },
  {
    id: "cu-std-5",
    name: "Ananya Bose",
    role: "student",
    enrollmentNumber: "ENR2024005",
    collegeName: "State University of Technology",
    department: "Electrical Engineering",
    semester: 3,
    isActive: true,
    createdAt: seedDate(1),
  },
];

const activityLogs: StoreActivityLog[] = [
  {
    id: randomUUID(),
    type: "student_registered",
    description: "Student Ananya Bose (ENR2024005) registered",
    actor: "Campus Admin",
    timestamp: seedDate(1),
  },
  {
    id: randomUUID(),
    type: "student_registered",
    description: "Student Rahul Singh (ENR2024004) registered",
    actor: "Campus Admin",
    timestamp: seedDate(3),
  },
  {
    id: randomUUID(),
    type: "staff_added",
    description: "Maintenance staff member Carlos Rivera added",
    actor: "Campus Admin",
    timestamp: seedDate(5),
  },
  {
    id: randomUUID(),
    type: "student_registered",
    description: "Student Meera Nair (ENR2024003) registered",
    actor: "Campus Admin",
    timestamp: seedDate(5),
  },
  {
    id: randomUUID(),
    type: "staff_added",
    description: "Faculty member Prof. James Carter added",
    actor: "Campus Admin",
    timestamp: seedDate(8),
  },
];

export const store = {
  users,
  activityLogs,

  findUserById(id: string): StoreUser | undefined {
    return users.find((u) => u.id === id);
  },

  findUserByEmail(email: string): StoreUser | undefined {
    return users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase() && u.isActive,
    );
  },

  findStudentByEnrollment(enrollmentNumber: string): StoreUser | undefined {
    return users.find(
      (u) =>
        u.enrollmentNumber === enrollmentNumber &&
        u.role === "student" &&
        u.isActive,
    );
  },

  adminExists(): boolean {
    return users.some((u) => u.role === "admin" && u.isActive);
  },

  createUser(data: Omit<StoreUser, "id" | "createdAt">): StoreUser {
    const user: StoreUser = { ...data, id: randomUUID(), createdAt: now() };
    users.push(user);
    return user;
  },

  updateUser(id: string, data: Partial<StoreUser>): StoreUser | null {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx]!, ...data };
    return users[idx]!;
  },

  getStudents(): StoreUser[] {
    return users
      .filter((u) => u.role === "student")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  },

  getStaff(): StoreUser[] {
    return users
      .filter((u) => u.role === "faculty" || u.role === "maintenance")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  },

  addActivityLog(
    data: Omit<StoreActivityLog, "id" | "timestamp">,
  ): StoreActivityLog {
    const log: StoreActivityLog = {
      ...data,
      id: randomUUID(),
      timestamp: now(),
    };
    activityLogs.unshift(log);
    return log;
  },

  getRecentActivity(): StoreActivityLog[] {
    return activityLogs.slice(0, 20);
  },
};

export function serializeUser(user: StoreUser) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email ?? null,
    enrollmentNumber: user.enrollmentNumber ?? null,
    department: user.department ?? null,
    collegeName: user.collegeName ?? null,
    semester: user.semester ?? null,
    createdAt: user.createdAt,
  };
}
