# CampusFlow

"Where Campus Life Flows Smoothly." — A premium SaaS-style campus management platform for universities with role-based access for Students, Faculty, Maintenance Staff, and Campus Admins.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port assigned by workflow)
- `pnpm --filter @workspace/campusflow run dev` — run the React frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Optional env: `JWT_SECRET` — secret for signing JWT tokens (demo fallback is used if not set)
- **No database required** — demo mode uses an in-memory store pre-seeded with demo data

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Shadcn UI + Framer Motion + Wouter + TanStack Query
- API: Express 5 (artifacts/api-server)
- DB: MongoDB Atlas + Mongoose
- Auth: JWT (jsonwebtoken + bcryptjs)
- Validation: Zod (`zod/v4`), Orval-generated Zod schemas
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (single source of truth)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas for server validation (do not edit)
- `artifacts/api-server/src/models/` — Mongoose models (User, ActivityLog)
- `artifacts/api-server/src/middlewares/` — JWT auth + role authorization
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/campusflow/src/contexts/AuthContext.tsx` — Auth context + ProtectedRoute
- `artifacts/campusflow/src/components/layout/` — Navbar, Sidebar, DashboardLayout, GradientBackground
- `artifacts/campusflow/src/pages/` — All pages (landing, login variants, dashboards, admin pages)

## Architecture decisions

- **MongoDB over PostgreSQL**: User requested MongoDB Atlas; Mongoose chosen for schema validation and ODM.
- **Passwordless student entry**: Students log in by enrollment number only — no password — matching the spec requirement.
- **Single User collection, role-discriminated**: All user types (student, faculty, maintenance, admin) live in one `users` collection, differentiated by `role` field. Keeps queries simple.
- **First-run setup flow**: Admin account created through `/setup` route before any admin can log in. System checks `User.exists({ role: "admin" })` to determine setup state.
- **JWT stored in localStorage**: Token stored as `campusflow_token`, user profile as `campusflow_user`. AuthContext reads these on mount.
- **Contract-first API**: OpenAPI spec in `lib/api-spec/openapi.yaml` gates both the Zod server schemas and React Query client hooks via Orval codegen.

## Roles & Auth

| Role | Login Method | Path |
|------|-------------|------|
| Student | Enrollment number only (no password) | `/login/student` |
| Faculty | Email + password | `/login/staff` |
| Maintenance | Email + password | `/login/staff` |
| Admin | Email + password | `/login/admin` |
| First Admin | Setup wizard | `/setup` |

## Product

- **Landing page** (`/`) — Hero, role cards, feature highlights
- **First-run setup** (`/setup`) — Creates the initial admin account
- **Role dashboards** — Student, Faculty, Maintenance, Admin each get their own dashboard shell
- **Admin dashboard** (`/dashboard/admin`) — Real-time stats (totalStudents, totalFaculty, etc.) + activity feed
- **Student management** (`/admin/students`) — Searchable table, register new students
- **Staff management** (`/admin/staff`) — Searchable table, add faculty/maintenance staff

## Gotchas

- Run codegen after any OpenAPI spec change: `pnpm --filter @workspace/api-spec run codegen`
- MongoDB URI must be set as `MONGODB_URI` secret before the API server can connect to the database
- The `/api/setup/admin` endpoint is only usable when no admin exists yet
- `passwordHash` field is `select: false` on the User model — must use `.select("+passwordHash")` when needed for login

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._
