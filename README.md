# CampusFlow

> Where Campus Life Flows Smoothly.

CampusFlow is a comprehensive, premium digital workspace for modern universities. It simplifies campus administration, streamlines maintenance workflows, enhances student life, and provides rapid emergency coordination inside a single unified platform.

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
  - [Student Features](#student-features)
  - [Faculty Features](#faculty-features)
  - [Maintenance Staff Features](#maintenance-staff-features)
  - [Campus Admin Features](#campus-admin-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Installation Guide](#-installation-guide)
- [Run Locally Instructions](#-run-locally-instructions)
- [Build Instructions](#-build-instructions)
- [Deployment Notes (Vercel Readiness)](#-deployment-notes-vercel-readiness)
- [Screenshots](#-screenshots)
- [Future Scope](#-future-scope)
- [Author Information](#-author-information)
- [License Information](#-license-information)

---

## 🔍 Problem Statement

Managing operations inside modern university campuses is often fragmented. Universities rely on multiple disjointed systems for reporting maintenance issues, booking campus resources (labs, seminar halls), managing events, displaying announcements, registering lost/found items, and broadcasting campus emergencies.

This fragmentation results in:

- Delayed responses to critical facilities maintenance and safety issues.
- Administrative overhead from manually coordinating resource bookings and notices.
- Lack of centralized transparency, leaving students, faculty, and maintenance staff disconnected.
- Inefficiencies in emergency communications when swift action is required.

---

## 💡 Solution Overview

CampusFlow resolves these challenges by providing a single, role-based platform that unites the entire university community:

1. **Students**: A modern dashboard to report facilities issues, book resources, find lost items, register for events, view notices, submit surveys, and trigger SOS alerts.
2. **Faculty**: Dedicated tools to post notices, request facilities support, view event participation, and manage booking requests.
3. **Maintenance Staff**: Real-time status update interfaces with photo uploads to track, assign, and update reported maintenance tasks.
4. **Campus Admins**: A centralized command dashboard to manage users (students, faculty, staff), track key performance metrics, approve bookings, and monitor active campus issues.

---

## 🌟 Key Features

### Student Features

- **Smart Issue Reporting**: Report facility, equipment, or service issues directly with detail fields, severity tagging, and photo previews.
- **Emergency SOS Reporting**: Instantly trigger a campus-wide or security-focused emergency SOS, alerting administrators with geolocation/location markers and status updates.
- **Lost & Found**: Post lost or found items with image uploads and descriptions. Users can mark resolved items and update claims.
- **Resource Booking**: Seamless reservation system for labs, study spaces, audio-visual equipment, and auditoriums with calendar availability and approval status tracking.
- **Event Hub**: View upcoming campus events, register with a single click, and view registration lists.
- **Digital Notice Board**: Interactive board with bookmarking filters, categorization, and chronological updates.
- **Feedback System / Surveys**: Participate in campus surveys, submit feedback, and view real-time satisfaction graphs.
- **Notifications**: Instant popups and centralized inbox for critical notifications, booking updates, and announcements.

### Faculty Features

- **Digital Notice Board Publishing**: Create and publish notices with target audiences (e.g., student body, department).
- **Resource Requesting**: Reserve high-priority resources for lectures, exams, or seminars.
- **Facilities Support**: Submit staff-tier issues directly to the maintenance queue.
- **Feedback Collection**: Review feedback and participate in administrative polls.

### Maintenance Staff Features

- **Work Order Queue**: A clean, mobile-responsive work board showing assigned issues.
- **Resolution Flow**: Update statuses (`In Progress`, `Resolved`) and upload before/after photos with notes.
- **Priority Management**: Sort and filter tasks based on severity and category.

### Campus Admin Features

- **System Dashboard**: View high-level metrics (active students, faculty, resolved issues, open SOS alerts) with rich data visualizations.
- **User Management**: Add, update, and manage student and staff records.
- **Resource Management**: Configure booking spaces, set rules, and approve/reject booking requests.
- **Notice & Survey Moderation**: Review and publish surveys, manage notice boards, and send campus-wide broadcast messages.

---

## 🛠️ Technology Stack

CampusFlow is built with a modern, high-performance monorepo architecture:

- **Frontend**:
  - **Framework**: React 19 (via Vite)
  - **Styling**: Tailwind CSS + Shadcn UI components for premium design aesthetics
  - **Transitions**: Framer Motion for smooth UI animations
  - **Routing**: Wouter (lightweight React router)
  - **Data Fetching**: Axios + TanStack Query (React Query)
- **Backend API**:
  - **Framework**: Express 5 (Node.js)
  - **Logger**: Pino (structured logging)
  - **Compilation**: Esbuild (fast bundling)
- **Shared Libraries & Contracts**:
  - **OpenAPI**: Single source of truth OpenAPI spec (`openapi.yaml`)
  - **API Codegen**: Orval (generates React Query hooks and Zod schemas automatically from the OpenAPI spec)
  - **Validation**: Zod
- **Storage/Persistence**:
  - **Demo Store**: Structured, pre-seeded in-memory store (database-less sandbox)
  - **Client State**: LocalStorage persistence for user sessions and student registrations

---

## 📁 Project Structure

```text
campus-flow/
├── artifacts/
│   ├── campusflow/         # Core React SPA (Frontend client application)
│   ├── api-server/         # Node.js/Express API server (Backend)
│   └── mockup-sandbox/     # Isolated UI sandbox and component previewer
├── lib/
│   ├── api-client-react/   # Automatically generated Axios & React Query hooks
│   ├── api-spec/           # OpenAPI Specification contract (openapi.yaml)
│   ├── api-zod/            # Generated Zod validation schemas
│   └── db/                 # Database schema definitions
├── scripts/                # Workspace/monorepo tooling scripts
├── .env.example            # Environment variables template
├── .gitignore              # Workspace-wide Git exclusion rules
├── LICENSE                 # MIT License details
├── package.json            # Monorepo root configuration and scripts
├── pnpm-lock.yaml          # Monorepo lockfile
├── pnpm-workspace.yaml     # PNPM workspace configurations
└── tsconfig.base.json      # Shared TypeScript compiler config
```

---

## ⚙️ Installation Guide

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or above, v24 recommended)
- [PNPM](https://pnpm.io/) package manager (strongly recommended for workspaces)

### Step-by-Step Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/yashjaka/campus-flow.git
   cd campus-flow
   ```

2. **Install Workspace Dependencies**:

   ```bash
   pnpm install
   ```

   _(Alternatively, run `npx pnpm install` if pnpm is not globally installed.)_

3. **Configure Environment Variables**:
   Copy the root configuration template:
   ```bash
   cp .env.example .env
   ```
   Modify the `.env` file to customize your local port or session keys.

---

## 🚀 Run Locally Instructions

To spin up the entire application (both the Express backend and React frontend) concurrently:

```bash
pnpm dev
```

This starts:

- **Express Backend API**: Runs on port `5000` (by default)
- **Vite Frontend Dev Server**: Runs on port `5173` (by default) with proxy rules routing API requests to `/api/*` seamlessly.

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 📦 Build Instructions

To verify types and compile all workspace packages for production:

```bash
pnpm build
```

This command runs:

1. Workspace typecheck: Runs TypeScript compile audits (`tsc --noEmit`) across all client and backend projects.
2. Codebundling: Builds production assets.
   - Frontend static assets are generated in `artifacts/campusflow/dist/public`
   - Express server files are bundled into `artifacts/api-server/dist`

To preview the compiled client application:

```bash
pnpm preview
```

---

## 🔍 Linting & Formatting

We maintain professional, clean code standards. You can run linter checks across all project files:

```bash
pnpm lint
```

To automatically format the codebase to match our Prettier style rules:

```bash
npx prettier --write . --ignore-path .gitignore
```

---

## 🌐 Deployment Notes (Vercel Readiness)

CampusFlow has been structured for painless future deployment:

- **Build Output**: The Vite build configurations output directly to `artifacts/campusflow/dist/public` conforming to standard static asset hosting.
- **Frontend SPA Routing**: Uses clean, client-side Wouter routing.
- **API Proxy**: In production environments, client calls route to the relative `/api` path, easily mapped using Vercel rewrites or a server gateway.
- **Database-Less Core**: The backend API operates an in-memory database configuration making it serverless-ready and easy to spin up instantly without database credentials.

_Note: No deployment pipelines or Actions are included, keeping the codebase lightweight and deployment platform-agnostic._

---

## 🖼️ Screenshots

> _Placeholder: A collection of high-resolution mockups and screenshots representing the student portal, SOS reporting tool, notice boards, and admin dashboards will be hosted here._

|       Landing Page       |       Student Dashboard        |        SOS Interface         |
| :----------------------: | :----------------------------: | :--------------------------: |
| _[Hero Section & Roles]_ | _[Student Dashboard overview]_ | _[SOS emergency broadcasts]_ |

---

## 🔮 Future Scope

- **MongoDB / PostgreSQL Integration**: Migrating the database-less Express server to utilize Drizzle ORM (schema definitions already initialized under `lib/db`) or MongoDB Atlas.
- **Native Geolocation Integration**: Real-time GPS mapping for SOS alerts and Lost & Found items.
- **Automated Mailroom Alerting**: Sending automated email notifications via SMTP/SendGrid on ticket updates and event reminders.
- **Role-based Push Notifications**: Mobile push alerts for immediate SOS warnings.

---

## ✍️ Author Information

Developed and maintained by:

- **Yash Jaka** — [@yashjaka](https://github.com/yashjaka)

---

## 📄 License Information

This project is licensed under the **MIT License**. For details, please review the [LICENSE](file:///LICENSE) file.
