# TokTickIT — IT Service Desk Platform

TokTickIT is a full-stack, multi-role IT Service Desk web application developed as part of **CPE 334: Introduction to Software Engineering in the Age of AI Agents** (Semester 1/2026, KMUTT).

**Lab 4 Final Operational Increment: Actions Taken, Dashboards, and Final Regression** completes the core service-desk workflow:
- **Parent-Child Actions Taken:** Plan, track, and log technical actions performed on each Ticket by IT Staff and Administrators (action timestamp, description, result, automated actor attribution, conditional follow-up note validation, and attachment notes).
- **Server-Side Resolution Gate:** Strict 8-state ticket transition lifecycle enforcing that Tickets cannot be resolved or closed without at least one recorded Action Taken (`RESOLUTION_GATE_FAILED`). Requester "Problem Appears Resolved" indication is advisory and does not bypass staff resolution authority.
- **Role-Appropriate Operational Dashboards:** Authoritative real-time aggregation metrics for IT Staff (Teacher Mockup 1: 5 KPI counters, urgent ticket alert banner, recent operational tickets table, and quick actions) and Requesters (Teacher Mockup 2: 4 personal KPI metric cards, recent requests list, strict ownership isolation, and drill-down navigation into filtered queues).
- **Full Multi-Sprint Regression Hardening:** 100% test pass rate across all 217 automated tests (134 server, 73 client, 10 Playwright E2E) preserving all capabilities from Labs 1 through 3 under the unified **Zen Green** (`#006B3C`) design language.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Bootstrap 5, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL (with SQLite / in-memory dual-persistence fallback)
- **Testing:** Vitest, React Testing Library, Supertest, Playwright (Chromium/Firefox/WebKit)
- **Code Quality:** ESLint, Prettier, TypeScript Strict Mode

---

## Repository Structure (Section 12 Increment)

```text
toktickit/
├── client/                     # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/         # StaffDashboard, RequesterDashboard, ActionsTakenSection,
│   │   │                       # AddActionTakenModal, StaffTicketQueue, StaffTicketDetail,
│   │   │                       # TicketDetail, MyTickets, CreateTicket, UserManagement
│   │   ├── context/            # AuthContext (JWT session management)
│   │   ├── api.ts              # API client methods with Bearer token authentication
│   │   └── App.tsx             # Main shell, role-based routing, and active-tab indicator
│   └── tests/                  # Frontend Vitest component test suites
│       ├── lab-01/
│       ├── lab-02/
│       ├── lab-03/
│       └── lab-04/             # StaffDashboard, RequesterDashboard, ActionsTaken, TicketWorkflow
├── server/                     # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma       # User, Ticket, ActionTaken, Attachment, Comment, Note models
│   │   ├── migrations/         # Safe, non-destructive PostgreSQL migrations
│   │   └── seed.ts             # Idempotent seed data covering 0, 1, and multi-action tickets
│   ├── src/
│   │   ├── middleware/         # auth.middleware.ts, rbac.middleware.ts
│   │   └── app.ts              # REST API routes: actions-taken, dashboards, tickets, auth, users
│   └── tests/                  # Backend Supertest + Vitest integration test suites
│       ├── lab-01/
│       ├── lab-02/
│       ├── lab-03/
│       └── lab-04/             # actions-taken, ticket-workflow, staff-dash, requester-dash
├── docs/                       # Course engineering contracts & specifications
│   ├── lab-01/
│   ├── lab-02/
│   ├── lab-03/
│   └── lab-04/
│       ├── specification.md    # FR-01..12, BR-01..20, AC-01..15, 8-state transition matrix
│       ├── api-spec.md         # REST API schema, status codes, and error definitions
│       ├── ui-spec.md          # Zen Green tokens, responsive rules, and visual checklist
│       ├── tests.md            # Traceability matrix and automated test execution results
│       ├── reviewer.md         # Peer review logs (Rules 1–5, PR links, author/reviewer records)
│       └── ai-use.md           # AI tool usage log, key prompts, and engineering reflection
├── e2e/                        # Playwright multi-role End-to-End test suites
│   ├── lab-02/                 # Requester ticket creation and attachment journey
│   ├── lab-03/                 # Multi-role authentication, staff queue, and user administration
│   └── lab-04/                 # Actions Taken workflow, Resolution Gate, and role dashboards
├── artifacts/                  # Visual evidence and screenshot assets
│   └── lab-04/screenshots/     # Desktop, Tablet, and Mobile captures
│       ├── staff-dashboard/
│       ├── requester-dashboard/
│       └── actions-taken/
├── .gitignore                  # Git ignore rules for node_modules, dist, .env, and temp files
└── README.md                   # Project documentation and setup instructions
```

---

## Setup & Running Instructions

### 1. Prerequisites
- **Node.js:** v18.0.0 or higher
- **Package Manager:** npm (v9+)
- **Database:** PostgreSQL (or built-in fallback)

### 2. Backend Setup (`server`)
```bash
cd server
npm install

# Configure environment variables
cp .env.example .env
# Set DATABASE_URL in .env to your PostgreSQL database instance

# Run database migrations and seed data
npx prisma migrate dev
npm run prisma:seed

# Start the Express API server (http://localhost:3000)
npm run dev

# Run all 17 backend integration test suites (134 tests)
npm test
```

### 3. Frontend Setup (`client`)
```bash
cd client
npm install

# Start Vite development server (http://localhost:5173)
npm run dev

# Run all 15 frontend component test suites (73 tests)
npm test -- --run

# Compile TypeScript and build production bundle
npm run build
```

### 4. Playwright End-to-End Testing (`e2e`)
```bash
# Run Sprint 4 E2E test suites (Actions Taken, Resolution Gate, Dashboards)
npx playwright test e2e/lab-04/ --workers=1

# Run full multi-sprint E2E regression suite across Labs 2, 3, and 4 (10 tests)
npx playwright test e2e/lab-02/ e2e/lab-03/ e2e/lab-04/ --workers=1
```

---

## Test Accounts & Personas

| Persona | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Jennifer Anderson** | `jennifer.a@example.com` | `Password123!` | `REQUESTER` | Active requester with personal tickets and isolated dashboard |
| **Alex Thompson** | `tech.alex@example.com` | `Password123!` | `IT_STAFF` | IT technician with queue access, actions logging, and resolution |
| **Sarah Chen** | `admin.sarah@example.com` | `Password123!` | `ADMINISTRATOR` | Full access: user administration, ticket actions, and system oversight |
| **David Miller** | `david.m@example.com` | `Password123!` | `REQUESTER` | First-login quarantine test user (`mustChangePassword: true`) |
| **Robert Taylor** | `robert.t@example.com` | `Password123!` | `IT_STAFF` | Inactive staff account for assignment rejection testing |

---

## Branching Strategy & Staging Workflow

TokTickIT adheres strictly to the staged Git integration workflow required by course rules:
- **`main`:** Production release branch containing only verified, reviewer-merged increments.
- **`lab4-staging`:** Sprint 4 staging branch where all feature PRs are integrated and hardened before release.
- **`feature/<issue-number>-<feature-name>`:** Isolated feature branches developed per GitHub Issue.
- **Course Rule 1 (Reviewer Merges PR):** Authors **never** merge their own pull requests; assigned peer reviewers inspect, verify, approve, and merge into staging/main.
