# CPE 334 Lab 3 Submission Report: TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens

- **Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents (Semester 1/2026)
- **Student Name:** Nitithorn Ketkaew
- **Student ID:** 67070505203
- **GitHub Username:** [@SANOP19](https://github.com/SANOP19)
- **Repository:** [https://github.com/SANOP19/toktickit](https://github.com/SANOP19/toktickit)
- **Collaborators & Peer Reviewers:**
  - Supanut Watthanasimakorn ([@Beethoven190](https://github.com/Beethoven190) — Student ID: 67070505226)
  - Wachirawit Photchamnian ([@Davidice23](https://github.com/Davidice23))
- **Target Score:** 60 / 60

---

## Answer Part 1: Git Use with Engineering Workflow

### 1.1 Git Branch Flow & Commit History Evidence

The engineering workflow strictly followed the course branching strategy:
- All feature branches (`feature/1-sprint3-spec` through `feature/7-docs-e2e`) were branched from and merged into `lab3-staging`.
- The final release milestone merged `lab3-staging` into `main` via Release Pull Request #37.
- **Rule 1 (Reviewer Merges PR):** The author (@SANOP19) never merged their own PR; all PRs were reviewed, approved, and merged by peer collaborator @Beethoven190.

#### Commit Graph Evidence (`git log --graph --oneline --decorate`):
```text
* 23dc66c (HEAD -> main, origin/main, origin/lab3-staging, lab3-staging) chore(screenshots): recapture all UI screenshots with clean Lab 3 production navbar
* 6982a68 test(e2e): scope navbar user locator and ensure idempotent quarantine login
* bcaaa4e fix(navbar): hide legacy Lab 2 requester change button on live site while keeping test compatibility
* 57fd827 docs(reviewer): include final release PR #37 and Issue #36 in quality checklist
* 5433a83 docs(reviewer): record PR #37 approval and merge for Sprint 3 Final Release
*   03ad12e Merge pull request #37 from SANOP19/lab3-staging
|\  
| * 72517bb docs(reviewer): record PR #37 details for Sprint 3 Final Release
| * 84e5c6a docs(reviewer): keep only active collaborators for Lab 3 in header
| * 6d61685 docs(reviewer): add Beethoven190 PR #31 peer review record to Table 1.2 and detailed evaluation
| * d1cde7d docs: finalize Lab 3 specifications, completed visual checklist, and screenshot evidence
| * fd51520 docs: update README for Lab 3 directory structure, E2E testing, and lab3-staging branch
| * 867aabc docs(reviewer): record PR #35 approval and merge for Issue 7 in Table 1.1
| *   c5865c1 Merge pull request #35 from SANOP19/feature/7-docs-e2e
| |\  
| | * fa2b6b9 (origin/feature/7-docs-e2e, feature/7-docs-e2e) docs(reviewer): update Table 1.1 with PR #35 details for Issue 7
| | * 3166cd8 feat(e2e-docs): implement Playwright E2E multi-role test suite and finalize documentation (Issue #34)
| |/  
| * 4688d58 docs(reviewer): record review and merge of peer PR #34 in Table 1.2
| * 5e63e43 docs(reviewer): record PR #33 approvals and merges for Issue 6 and separate Issue 7 from Final Release
| *   7271019 Merge pull request #33 from SANOP19/feature/6-admin-user-management
| |\  
| | * 2178534 (origin/feature/6-admin-user-management) docs(reviewer): update Table 1.1 with PR #33 for Issue 6
| | * 87ec84e feat(admin-users): implement Administrator User Management, account provisioning, and safety controls (Issue #32)
| |/  
| * 064352b docs(reviewer): record PR #31 approvals and merges for Issue 5
| *   cab134e Merge pull request #31 from SANOP19/feature/5-staff-ticket-detail
| |\  
| | * 753708c (origin/feature/5-staff-ticket-detail, feature/5-staff-ticket-detail) docs(reviewer): update Table 1.1 with Issue 5 PR #31 details
| | * 8ed8fd6 feat(staff-ticket-detail): implement IT Staff ticket detail, operational controls, claim ticket, and confidential internal notes (Issue #30)
| |/  
| * e2790e2 docs(lab-03): update reviewer.md with PR #29 approval and merge record
| *   39ad850 Merge pull request #29 from SANOP19/feature/4-staff-queue
| |\  
| | * fbc1e88 (origin/feature/4-staff-queue, feature/4-staff-queue) feat(staff-queue): implement IT Staff Ticket Queue with search, filters, sorting, and pagination (Issue #28)
| |/  
| * e652758 docs(lab-03): update reviewer.md with PR #27 approval and merge record
| *   6d6118b Merge pull request #27 from SANOP19/feature/3-requester-continuation
| |\  
| | * 8ae3e8c (origin/feature/3-requester-continuation, feature/3-requester-continuation) feat(requester): implement requester continuation, public comments, and problem resolved indicator (Issue #26)
| |/  
| * a04b7be docs(lab-03): update reviewer.md with PR #25 approval and merge record
| *   c9a896d Merge pull request #25 from SANOP19/feature/2-auth-foundation
| |\  
| | * ca2bfe0 (origin/feature/2-auth-foundation, feature/2-auth-foundation) feat(auth): implement user authentication foundation, database models, and first-login password quarantine (Issue #24)
| |/  
| * 1c6dc36 docs(lab-03): update reviewer.md with PR #22 approval and merge record
| *   ea89ea4 Merge pull request #22 from SANOP19/feature/1-sprint3-spec
| |\  
| | * 48a04f2 (origin/feature/1-sprint3-spec, feature/1-sprint3-spec) docs(lab-03): define Sprint 3 engineering contracts, specifications, UI guidelines, and test plan (Issue #23)
| |/  
* | 13470da (origin/lab2-staging, lab2-staging) Merge pull request #15 from SANOP19/lab2-staging
```

---

### 1.2 GitHub Project Kanban Board Evidence

- **Kanban Board URL:** [https://github.com/users/SANOP19/projects/3](https://github.com/users/SANOP19/projects/3)
- **Status:** All 18 cards across Lab 1, Lab 2, and Lab 3 have progressed through `Backlog` → `Specified` → `Started` → `PR Review` → `Done` and reside in **`Done`** (100% complete).

| Issue # | Type | Title | Linked PR | State | Assignee |
| :---: | :---: | :--- | :---: | :---: | :---: |
| #23 | Issue | Lab 3 - Issue 1: Sprint 3 specification and test plan | [PR #22](https://github.com/SANOP19/toktickit/pull/22) | **Done** | @SANOP19 |
| #24 | Issue | Lab 3 - Issue 2: Database models, seed data, and authentication foundation | [PR #25](https://github.com/SANOP19/toktickit/pull/25) | **Done** | @SANOP19 |
| #26 | Issue | Lab 3 - Issue 3: Requester continuation, public comments, and problem resolved indicator | [PR #27](https://github.com/SANOP19/toktickit/pull/27) | **Done** | @SANOP19 |
| #28 | Issue | Lab 3 - Issue 4: IT Staff Ticket Queue with search, multi-field filters, sorting, and pagination | [PR #29](https://github.com/SANOP19/toktickit/pull/29) | **Done** | @SANOP19 |
| #30 | Issue | Lab 3 - Issue 5: IT Staff Ticket Detail screen with ownership assignment, IT priority, status workflow, and confidential internal notes | [PR #31](https://github.com/SANOP19/toktickit/pull/31) | **Done** | @SANOP19 |
| #32 | Issue | Lab 3 - Issue 6: Administrator User Management screen, account provisioning, and safety controls | [PR #33](https://github.com/SANOP19/toktickit/pull/33) | **Done** | @SANOP19 |
| #34 | Issue | Lab 3 - Issue 7: Sprint 3 E2E Multi-Role Journey Test Suite, Final Verification & Documentation Completion | [PR #35](https://github.com/SANOP19/toktickit/pull/35) | **Done** | @SANOP19 |
| #36 | Issue | Release: TokTickIT Sprint 3 (Lab 3) Multi-Role Platform Final Release | [PR #37](https://github.com/SANOP19/toktickit/pull/37) | **Done** | @SANOP19 |

---

### 1.3 Rendered `reviewer.md` Evidence

- **Rendered Document Link:** [docs/lab-03/reviewer.md](file:///c:/Users/nopni/Downloads/toktickit/docs/lab-03/reviewer.md)
- **Rule 1 Strictly Enforced:** All PRs authored by @SANOP19 were reviewed and merged by peer reviewer @Beethoven190. Conversely, all peer PRs by @Beethoven190 were reviewed and merged by @SANOP19.

#### Table 1.1: Feature Pull Requests Authored by @SANOP19 (Merged by Collaborators)

| Issue # | Feature Branch | PR # | PR Link | Target Branch | Reviewer | Review Decision | Merged By |
| :---: | :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| **Issue 1** | `feature/1-sprint3-spec` | #22 | [PR #22](https://github.com/SANOP19/toktickit/pull/22) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 2** | `feature/2-auth-foundation` | #25 | [PR #25](https://github.com/SANOP19/toktickit/pull/25) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 3** | `feature/3-requester-continuation` | #27 | [PR #27](https://github.com/SANOP19/toktickit/pull/27) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 4** | `feature/4-staff-queue` | #29 | [PR #29](https://github.com/SANOP19/toktickit/pull/29) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 5** | `feature/5-staff-ticket-detail` | #31 | [PR #31](https://github.com/SANOP19/toktickit/pull/31) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 6** | `feature/6-admin-user-management` | #33 | [PR #33](https://github.com/SANOP19/toktickit/pull/33) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 7** | `feature/7-docs-e2e` | #35 | [PR #35](https://github.com/SANOP19/toktickit/pull/35) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Release** | `lab3-staging` | #37 | [PR #37](https://github.com/SANOP19/toktickit/pull/37) | `main` | @Beethoven190 | **Approved** | @Beethoven190 |

#### Table 1.2: Peer Pull Requests Reviewed & Merged by @SANOP19

| Peer Author | Peer Repo | PR # | Issue Reviewed | Review Decision | Merged By |
| :---: | :---: | :---: | :--- | :---: | :---: |
| @Beethoven190 | `Beethoven190/toktickit` | #23 | [PR #23](https://github.com/Beethoven190/toktickit/pull/23) (Issue 1: Sprint 3 Engineering Contract) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #25 | [PR #25](https://github.com/Beethoven190/toktickit/pull/25) (Issue 2: Authentication Foundation) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #27 | [PR #27](https://github.com/Beethoven190/toktickit/pull/27) (Issue 3: IT Staff Ticket Queue) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #29 | [PR #29](https://github.com/Beethoven190/toktickit/pull/29) (Issue 4: IT Staff Ticket Operations) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #31 | [PR #31](https://github.com/Beethoven190/toktickit/pull/31) (Issue 5: Public Comments, Internal Notes & Problem Resolved) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #33 | [PR #33](https://github.com/Beethoven190/toktickit/pull/33) (Issue 6: Admin User Management) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #34 | [PR #34](https://github.com/Beethoven190/toktickit/pull/34) (Sprint 3 Final Release) | **Approved** | @SANOP19 |

---

### 1.4 README and `.gitignore` Evidence

#### `.gitignore` File Content:
```gitignore
# dependencies
node_modules/
# env & secrets
.env
*.env
!.env.example
# build output
dist/
build/
# prisma
server/prisma/*.db
# logs & OS
*.log
.DS_Store

# Uploaded attachments
server/uploads/*
!server/uploads/.gitkeep

# Playwright
test-results/
playwright-report/
```

#### `README.md` File Content:
```markdown
# TokTickIT - IT Service Desk Application

TokTickIT is a full-stack IT Service Desk application built as part of CPE334 Introduction to Software Engineering.

## Tech Stack
- Frontend: React, TypeScript, Vite, Bootstrap 5
- Backend: Node.js, Express, TypeScript
- Database & ORM: PostgreSQL, Prisma ORM
- Testing: Vitest, Supertest, React Testing Library, Playwright

## Directory Structure
toktickit/
├── client/         # React + TypeScript + Vite frontend
├── server/         # Node.js + Express + Prisma backend
├── docs/           # Engineering contracts & documentation (lab-01, lab-02, lab-03)
├── e2e/            # Playwright End-to-End test suite (lab-02, lab-03)
├── .gitignore      # Git ignore patterns
└── README.md       # Project setup and usage instructions
```

---

### 1.5 Repository Directory Structure Evidence
```text
toktickit/
├── .gitignore
├── README.md
├── package.json
├── playwright.config.ts
├── artifacts/
│   └── lab-03/
│       └── screenshots/
│           ├── authentication/     # 10 hi-res screenshots
│           ├── staff-queue/        # 4 hi-res screenshots
│           ├── staff-ticket-detail/# 8 hi-res screenshots
│           └── user-management/    # 7 hi-res screenshots
├── client/
│   ├── src/
│   │   ├── components/             # LoginScreen, StaffTicketQueue, StaffTicketDetail, UserManagement, etc.
│   │   ├── context/                # AuthContext, RequesterContext
│   │   ├── api.ts
│   │   └── App.tsx
│   └── tests/                      # 11 component test suites (49 passing tests)
├── server/
│   ├── prisma/
│   │   ├── schema.prisma           # Unified User model, Roles, Comments, InternalNotes
│   │   └── seed.ts
│   ├── src/
│   │   ├── app.ts                  # Express API routes, JWT auth, RBAC middleware, 8-state workflow
│   │   └── index.ts
│   └── tests/                      # 13 integration test suites (99 passing tests)
├── docs/
│   └── lab-03/
│       ├── specification.md        # 11 sections matching Handout Table 9
│       ├── api-spec.md             # REST API contracts & schemas
│       ├── ui-spec.md              # Visual Checklist VC-01..09 (All PASS)
│       ├── tests.md                # Traceability matrix & 153 passing test logs
│       ├── reviewer.md             # Table 1.1 & 1.2 peer review records
│       └── ai-use.md               # 7-phase prompts, reflection, integrity statement
└── e2e/
    └── lab-03/                     # 3 Playwright test suites (5 passing tests)
```

---

## Answer Part 2: Spec DD (Specification-Driven Development)

- **Rendered Specification Link:** [docs/lab-03/specification.md](file:///c:/Users/nopni/Downloads/toktickit/docs/lab-03/specification.md)
- **Evidence of Timing:** The complete specification was committed on `feature/1-sprint3-spec` (commit `48a04f2`), reviewed, and merged via PR #22 on September 17, 2026, **prior** to beginning implementation PRs #25, #27, #29, #31, #33, and #35.

### Summary of the 11 Required Sections (Handout Table 9 Conformance)

#### Section 1: Sprint Goal
Deliver Sprint 3 by introducing multi-role identity and authentication (Requester, IT Staff, Administrator), password quarantine, operational IT Staff ticket triage, confidential internal notes, and administrative user controls with safety guards, while preserving 100% regression continuity for all Lab 2 Requester capabilities.

#### Section 2: Stakeholder Request Interpretation
Transition TokTickIT from simulated development contexts into a multi-role enterprise IT service desk platform with server-enforced role authorization, ticket ownership assignment, IT priority management, distinct public versus internal communications, and account administration.

#### Section 3: Scope Boundaries
- **Included Scope:** Email/password authentication, JWT bearer session management, first-login password quarantine modal, IT Staff Ticket Queue with multi-field search and filters, IT Staff Ticket Detail with 8-state status workflow, append-only Public Comments and confidential Internal Notes, Administrator User Management with Self-Deactivation Guard and Last Active Admin Guard.
- **Explicitly Excluded Scope:** Multi-factor authentication, social login, self-registration, user deletion, bulk user operations, multi-tenant organizations, and SLA escalation rules.

#### Section 4: Functional Requirements (FR-01 to FR-12)
- **FR-01 (Authentication):** Users authenticate with email and password via `POST /api/auth/login`.
- **FR-02 (Password Quarantine):** Users with `mustChangePassword: true` are restricted to password change until an 8+ character password is saved.
- **FR-03 (Session & Current User):** `GET /api/auth/me` retrieves authenticated user profile and role; `POST /api/auth/logout` invalidates session.
- **FR-04 (Requester Continuation):** Requesters create and view tickets derived from `req.user.id`; legacy `DevRequesterSelector` removed from live UI.
- **FR-05 (Public Comments):** Requesters and IT Staff post append-only public comments on tickets.
- **FR-06 (Problem Resolved Indication):** Requesters toggle problem resolution indicator (`isRequesterResolved`) without changing formal ticket status.
- **FR-07 (IT Staff Ticket Queue):** `GET /api/staff/tickets` supports search, filters (category, priority, status, ownership), sorting, and pagination.
- **FR-08 (Ticket Ownership Assignment):** IT Staff claim unassigned tickets or reassign ownership to active IT Staff members.
- **FR-09 (IT Priority Management):** IT Staff independently set operational IT Priority (Low, Medium, High, Urgent).
- **FR-10 (Operational Status Workflow):** Enforce 8-state ticket status transitions; invalid transitions return HTTP 400.
- **FR-11 (Confidential Internal Notes):** IT Staff and Administrators post internal notes with strict HTTP 403 blocking against Requesters.
- **FR-12 (Administrator User Management):** Minimalist CRUD for user listing, creation, role editing, account activation, and password reset.

#### Section 5: Business Rules (BR-01 to BR-21)
- **BR-01:** Only active users with valid credentials may authenticate.
- **BR-02:** Users marked with `mustChangePassword = true` cannot access normal application endpoints (HTTP 403 `PASSWORD_CHANGE_REQUIRED`).
- **BR-03:** All passwords must have minimum length of 8 characters and be securely hashed with bcrypt (salt rounds = 10).
- **BR-04:** Tokens are transmitted via HTTP `Authorization: Bearer <token>` header.
- **BR-05:** Authenticated user identity (`req.user.id`) determines ownership; spoofed client parameters are ignored.
- **BR-06:** Requesters can only access tickets they authored.
- **BR-07:** Non-staff users accessing staff queue or detail endpoints receive HTTP 403 Forbidden.
- **BR-08:** Tickets must progress through the permitted 8-state transition matrix:
  - `New` → `Open`, `Cancelled`
  - `Open` → `In Progress`, `Cancelled`
  - `In Progress` → `Waiting for Requester`, `Resolved`, `Cancelled`
  - `Waiting for Requester` → `In Progress`, `Resolved`
  - `Resolved` → `Closed`, `Reopened`
  - `Reopened` → `In Progress`, `Waiting for Requester`, `Resolved`
  - `Closed`, `Cancelled` → Terminal states
- **BR-09:** Assigning an owner to an unassigned ticket in `New` status automatically advances status to `Open`.
- **BR-10:** Requester "Problem Appears Resolved" toggle does not modify formal `currentStatus`.
- **BR-11:** `itPriority` is separate from and does not overwrite `requestedPriority`.
- **BR-12:** Ticket owner must be an active IT Staff or Administrator account.
- **BR-13:** Public comments are visible to Requester, IT Staff, and Administrator.
- **BR-14:** Public comment body must be between 1 and 2,000 characters.
- **BR-15:** Internal Notes are confidential and strictly visible only to IT Staff and Administrators.
- **BR-16:** Requester requests to Internal Note endpoints receive HTTP 403 without leaking note existence.
- **BR-17:** Non-administrators accessing User Management receive HTTP 403 Forbidden.
- **BR-18 (Self-Deactivation Guard):** An Administrator cannot deactivate their own account (HTTP 400 `CANNOT_DEACTIVATE_SELF`).
- **BR-19 (Last Active Admin Guard):** The system cannot deactivate the sole active Administrator (HTTP 400 `LAST_ADMIN_PROTECTED`).
- **BR-20 (Duplicate Email Guard):** Email addresses must be unique; duplicates return HTTP 409 Conflict.
- **BR-21 (Password Reset Policy):** Admin password reset sets `mustChangePassword = true`.

#### Section 6: UI Specification Summary
Clean Zen Green presentation (`#006B3C`, `#0B7A46`, `#EAF6EF`), responsive breakpoints (Desktop 1280px, Tablet 768px, Mobile 375px), distinct communication tab styling (Zen Green for Public Comments vs amber `#F59E0B` with 🔒 lock badge for Internal Notes), and completed Visual Checklist (VC-01..09 all PASS).

#### Section 7: Data Changes & Migration Decisions
- Database evolved from `RequesterUser` into unified `User` model (`id`, `name`, `email`, `passwordHash`, `role`, `isActive`, `mustChangePassword`, `createdAt`, `updatedAt`).
- Added relations: `Ticket.owner`, `Ticket.comments`, `Ticket.notes`.
- Non-destructive migration preserving all Lab 2 tickets, categories, related systems, and attachments.

#### Section 8: API Contract Summary
- Auth: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/change-password`
- Requester: `GET/POST /api/tickets`, `GET /api/tickets/:id`, `GET/POST /api/tickets/:id/comments`, `PATCH /api/tickets/:id/resolve-indication`
- IT Staff: `GET /api/staff/tickets`, `GET /api/staff/tickets/:id`, `PATCH /api/staff/tickets/:id/claim`, `PATCH /api/staff/tickets/:id/it-priority`, `PATCH /api/staff/tickets/:id/status`, `GET/POST /api/tickets/:id/notes`
- Admin: `GET/POST /api/admin/users`, `PATCH /api/admin/users/:id`, `POST /api/admin/users/:id/reset-password`

#### Section 9: Acceptance Criteria (AC-01 to AC-15)
- AC-01: Valid user credentials login
- AC-02: Inactive account rejection
- AC-03: Mandatory password quarantine
- AC-04: Authenticated requester operations
- AC-05: Public comment creation & retrieval
- AC-06: Internal notes confidentiality
- AC-07: IT staff ticket queue triage
- AC-08: IT staff ticket ownership & priority
- AC-09: 8-state status workflow transitions
- AC-10: Administrator user provisioning
- AC-11: Administrator self-deactivation guard
- AC-12: Last active administrator guard
- AC-13: Administrator RBAC authorization
- AC-14: Requester problem resolution indication
- AC-15: Responsive layout & mobile adaptation

#### Section 10: Definition of Done (DoD)
All 15 ACs implemented, 100% test pass rate across unit, integration, and E2E tiers, zero compiler warnings, peer review approval without author self-merge (Rule 1), and clean staged branch integration.

#### Section 11: Assumptions and Architectural Decisions
JWT stored in client localStorage for session persistence, in-memory cache synchronized with PostgreSQL Prisma schema, append-only communication design preventing comment tampering.

---

## Answer Part 3: Test DD and Traceability

- **Rendered Test Plan Link:** [docs/lab-03/tests.md](file:///c:/Users/nopni/Downloads/toktickit/docs/lab-03/tests.md)

### 3.1 Test Traceability Matrix Across Acceptance Criteria

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File Path | Status |
| :---: | :---: | :--- | :--- | :--- | :--- | :---: |
| **API-01** | API | AC-01, BR-01 | Valid credentials login | HTTP 200, JWT token returned, user profile populated | `server/tests/lab-03/auth.api.test.ts` | **Pass** |
| **API-02** | API | AC-01, BR-03 | Invalid password login | HTTP 401 Unauthorized (`INVALID_CREDENTIALS`) | `server/tests/lab-03/auth.api.test.ts` | **Pass** |
| **API-03** | API | AC-02, BR-01 | Inactive account login | HTTP 401 Unauthorized (`ACCOUNT_INACTIVE`) | `server/tests/lab-03/auth.api.test.ts` | **Pass** |
| **API-04** | API | AC-03, BR-02 | First-login user access to normal endpoints | HTTP 403 Forbidden (`PASSWORD_CHANGE_REQUIRED`) | `server/tests/lab-03/auth.api.test.ts` | **Pass** |
| **API-05** | API | AC-03, BR-02 | Change password for quarantined user | HTTP 200, password updated, `mustChangePassword` cleared | `server/tests/lab-03/auth.api.test.ts` | **Pass** |
| **API-06** | API | AC-04, BR-05 | Requester queries tickets | Returns only tickets where `requesterId == req.user.id` | `server/tests/lab-03/authorization.api.test.ts` | **Pass** |
| **API-07** | API | AC-04, BR-06 | Requester accesses other's ticket | HTTP 404/403 without leaking data | `server/tests/lab-03/authorization.api.test.ts` | **Pass** |
| **API-08** | API | AC-06, BR-15 | Requester requests Internal Notes | HTTP 403 Forbidden with zero notes returned | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | **Pass** |
| **API-09** | API | AC-05, BR-14 | Post Public Comment on ticket | HTTP 201 Created, comment visible to requester and staff | `server/tests/lab-03/requester-continuation.api.test.ts` | **Pass** |
| **API-10** | API | AC-06, BR-15 | IT Staff posts Internal Note | HTTP 201 Created, internal note saved with staff author | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | **Pass** |
| **API-11** | API | AC-07, BR-08 | IT Staff queries ticket queue | Returns paginated queue matching search and filter parameters | `server/tests/lab-03/staff-queue.api.test.ts` | **Pass** |
| **API-12** | API | AC-08, BR-12 | IT Staff claims unassigned ticket | Ticket `ownerId` set to staff member; status advances to Open | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | **Pass** |
| **API-13** | API | AC-08, BR-11 | Update IT Priority | `itPriority` updated; `requestedPriority` remains untouched | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | **Pass** |
| **API-14** | API | AC-09, BR-09 | Valid ticket status transition | Status advances according to 8-state transition matrix | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | **Pass** |
| **API-15** | API | AC-09, BR-09 | Invalid ticket status transition | HTTP 400 Bad Request (`INVALID_STATUS_TRANSITION`) | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | **Pass** |
| **API-16** | API | AC-14, BR-10 | Requester signals problem resolved | `isRequesterResolved` becomes true; formal status unchanged | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | **Pass** |
| **API-17** | API | AC-10, BR-20 | Admin creates user | HTTP 201 Created with initial password and forced change flag | `server/tests/lab-03/users-admin.api.test.ts` | **Pass** |
| **API-18** | API | AC-10, BR-20 | Admin creates user with duplicate email | HTTP 409 Conflict (`EMAIL_ALREADY_EXISTS`) | `server/tests/lab-03/users-admin.api.test.ts` | **Pass** |
| **API-19** | API | AC-11, BR-18 | Admin attempts self-deactivation | HTTP 400 Bad Request (`CANNOT_DEACTIVATE_SELF`) | `server/tests/lab-03/users-admin.api.test.ts` | **Pass** |
| **API-20** | API | AC-12, BR-19 | Admin deactivates sole active admin | HTTP 400 Bad Request (`LAST_ADMIN_PROTECTED`) | `server/tests/lab-03/users-admin.api.test.ts` | **Pass** |
| **API-21** | API | AC-13, BR-07 | Non-admin accesses user management API | HTTP 403 Forbidden | `server/tests/lab-03/authorization.api.test.ts` | **Pass** |
| **UI-01** | UI | AC-01 | Login screen validation | Shows inline error on empty inputs; shows busy spinner | `client/tests/lab-03/Login.test.tsx` | **Pass** |
| **UI-02** | UI | AC-03 | Mandatory Change Password modal | Enforces 8-char rule & password match before submit | `client/tests/lab-03/ChangePassword.test.tsx` | **Pass** |
| **UI-03** | UI | AC-07 | Staff Ticket Queue table & filters | Renders ticket rows, filter dropdowns, and pagination controls | `client/tests/lab-03/StaffTicketQueue.test.tsx` | **Pass** |
| **UI-04** | UI | AC-08, AC-09 | Staff Ticket Detail controls | Renders Owner claim, IT priority, and status dropdowns | `client/tests/lab-03/StaffTicketDetail.test.tsx` | **Pass** |
| **UI-05** | UI | AC-05, AC-06 | Distinct Comments vs Internal Notes | Distinct visual styling for public comments vs amber notes | `client/tests/lab-03/StaffTicketDetail.test.tsx` | **Pass** |
| **UI-06** | UI | AC-10, AC-11 | User Management & Admin safety | Disables self-deactivation toggle on own account row | `client/tests/lab-03/UserManagement.test.tsx` | **Pass** |
| **E2E-01** | E2E | AC-01, AC-03 | Login & First-Login Password Change | User logs in with initial password, forced to change, enters app | `e2e/lab-03/authentication.spec.ts` | **Pass** |
| **E2E-02** | E2E | AC-04, AC-08, AC-09 | End-to-End Ticket Lifecycle | Requester creates -> Staff claims/updates/notes -> Resolved | `e2e/lab-03/staff-ticket-flow.spec.ts` | **Pass** |
| **E2E-03** | E2E | AC-10, AC-11, AC-12 | Admin User Lifecycle & Safety Guards | Create user, edit role, verify self-deactivation blocked | `e2e/lab-03/user-administration.spec.ts` | **Pass** |

---

### 3.2 Live Automated Test Execution Output (`main` branch)

#### 1. Backend Integration Suites (`npm --prefix server test -- --run`):
```text
 ✓ tests/lab-01/health.test.ts (1 test) 21ms
 ✓ tests/lab-01/categories.test.ts (1 test) 34ms
 ✓ tests/lab-02/requester-context.api.test.ts (2 tests) 40ms
 ✓ tests/lab-02/my-tickets.api.test.ts (4 tests) 53ms
 ✓ tests/lab-02/create-ticket.api.test.ts (3 tests) 61ms
 ✓ tests/lab-02/ticket-detail.api.test.ts (3 tests) 115ms
 ✓ tests/lab-03/staff-queue.api.test.ts (13 tests) 136ms
 ✓ tests/lab-03/requester-continuation.api.test.ts (9 tests) 157ms
 ✓ tests/lab-02/attachments.api.test.ts (7 tests) 207ms
 ✓ tests/lab-03/authorization.api.test.ts (3 tests) 235ms
 ✓ tests/lab-03/staff-ticket-detail.api.test.ts (22 tests) 236ms
 ✓ tests/lab-03/users-admin.api.test.ts (19 tests) 488ms
 ✓ tests/lab-03/auth.api.test.ts (12 tests) 720ms

 Test Files  13 passed (13)
      Tests  99 passed (99)
   Start at  20:33:43
   Duration  1.67s
```

#### 2. Frontend Component Suites (`npm --prefix client test`):
```text
 ✓ tests/lab-03/ChangePassword.test.tsx (4 tests) 111ms
 ✓ tests/lab-03/Login.test.tsx (6 tests) 177ms
 ✓ tests/lab-02/MyTickets.test.tsx (3 tests) 165ms
 ✓ tests/lab-01/App.test.tsx (3 tests) 220ms
 ✓ tests/lab-02/RequesterContext.test.tsx (2 tests) 228ms
 ✓ tests/lab-02/CreateTicket.test.tsx (3 tests) 273ms
 ✓ tests/lab-03/StaffTicketQueue.test.tsx (7 tests) 808ms
 ✓ tests/lab-03/RequesterContinuation.test.tsx (3 tests) 947ms
 ✓ tests/lab-02/TicketDetail.test.tsx (3 tests) 1130ms
 ✓ tests/lab-03/StaffTicketDetail.test.tsx (8 tests) 2281ms
 ✓ tests/lab-03/UserManagement.test.tsx (7 tests) 2510ms

 Test Files  11 passed (11)
      Tests  49 passed (49)
   Start at  20:33:45
   Duration  4.10s
```

#### 3. Playwright End-to-End Multi-Role Suites (`npx playwright test e2e/lab-03/`):
```text
Running 5 tests using 5 workers

  ok 1 [chromium] › e2e/lab-03/authentication.spec.ts: inactive account login is rejected with HTTP 401 and error message (2.2s)
  ok 2 [chromium] › e2e/lab-03/authentication.spec.ts: first-login quarantine intercepts user and forces mandatory password change (2.6s)
  ok 3 [chromium] › e2e/lab-03/authentication.spec.ts: valid credentials login across Requester, IT Staff, and Admin roles with proper navigation & logout (2.9s)
  ok 4 [chromium] › e2e/lab-03/user-administration.spec.ts: admin user provisioning, role editing, self-deactivation protection, and password reset (3.0s)
  ok 5 [chromium] › e2e/lab-03/staff-ticket-flow.spec.ts: full operational ticket lifecycle across Requester and IT Staff personas (4.2s)

  5 passed (5.4s)
```

#### 4. Summary Test Metrics:
- **Total Automated Test Suites:** 27 test files
- **Total Passing Automated Tests:** 153 tests (**100% pass rate, 0 failing, 0 skipped**)
- **TypeScript & Production Bundle:** 0 errors (`tsc` on server; `tsc && vite build` on client)

---

## Answer Part 4: AI Use with Reflection

- **Rendered AI Log Link:** [docs/lab-03/ai-use.md](file:///c:/Users/nopni/Downloads/toktickit/docs/lab-03/ai-use.md)
- **AI Platform Used:** Google DeepMind Antigravity AI Coding Agent (Claude 3.5 Sonnet / Gemini 2.5 Pro)

### 4.1 Key Prompts Table (7 Development Phases)

| # | Development Phase | Issue / Context | Prompt Provided to AI Agent | Outcome / Artifact Produced |
|---|---|---|---|---|
| **1** | Specification & Contract | Issue 1 | *"Review the Lab 3 labsheet (all 18 pages) and decompose stakeholder requirements into a formal engineering contract. Generate `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` with numbered Business Rules (BR-01 to BR-21), Acceptance Criteria (AC-01 to AC-15), 8-status transition matrix, and full test traceability matrix."* | Created comprehensive sprint specifications and traceability matrix before coding. |
| **2** | Authentication Foundation | Issue 2 | *"Evolve the database schema from `RequesterUser` to `User` with bcrypt password hashing and roles (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`). Implement `/api/auth/login`, `/logout`, `/me`, and `/change-password`. Build the Mandatory First-Login Password Change Modal and auth middleware."* | Established secure authentication, first-login password change quarantine, and token management. |
| **3** | Requester Continuation | Issue 3 | *"Remove the temporary Development Requester selector. Update Create Ticket and My Tickets to use authenticated credentials. Enhance Requester Ticket Detail with threaded Public Comments and a 'Problem Appears Resolved' toggle."* | Maintained 100% regression continuity for Requester features with authenticated identity. |
| **4** | IT Staff Ticket Queue | Issue 4 | *"Build `/api/staff/tickets` supporting search, filters (category, priority, status, ownership), sorting, and pagination. Implement the responsive Zen Green Ticket Queue UI with desktop table and mobile card views."* | Implemented operational ticket triage queue for IT Staff. |
| **5** | IT Staff Ticket Detail & Notes | Issue 5 | *"Build `/api/staff/tickets/:id` operations: ticket claim/reassignment, IT Priority updates, and 8-state status transitions. Implement threaded Public Comments and confidential Internal Notes with clear visual distinction."* | Created staff ticket command center with clear comment/note confidentiality boundaries. |
| **6** | Admin User Management | Issue 6 | *"Build `/api/admin/users` CRUD with initial password provisioning and reset. Implement User Management UI with safety guards blocking self-deactivation and preventing removal of the last active Administrator."* | Delivered minimalist user administration with essential safety controls. |
| **7** | E2E Testing & Verification | Issue 7 | *"Implement Playwright E2E suites (`authentication.spec.ts`, `staff-ticket-flow.spec.ts`, `user-administration.spec.ts`) validating complete multi-user workflows across all three roles."* | Verified end-to-end user journeys and system stability. |

### 4.2 Engineering Reflection on AI Agent Collaboration

1. **Spec-Driven Precision Eliminates Architectural Drift:**
   Sprint 3 introduced significant multi-role complexity: 3 distinct user roles, an 8-state status workflow, public comments vs confidential operational notes, and administrative safety guards. Defining formal contracts upfront across `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` gave the agent clear specifications to fulfill, eliminating ambiguity.
2. **TDD as an AI Verification Shield:**
   Supplying the agent with precise test assertions for edge cases—such as the Self-Deactivation Guard (`400 CANNOT_DEACTIVATE_SELF`), Last Active Admin Guard (`400 LAST_ADMIN_PROTECTED`), and duplicate email detection (`409 Conflict`)—ensured that security requirements were built defensively and tested automatically.
3. **Confidentiality & RBAC Enforcement:**
   Human-directed oversight ensured that Internal Operational Notes remain completely invisible to Requesters (AC-06, BR-15, BR-16) at both the database query level (omitting internal notes from requester endpoints) and the UI layer (omitting the internal notes tab for non-staff), with automated tests proving zero data leakage.
4. **Rigorous Course Collaboration (Rule 1 & Rule 5):**
   Automating development velocity with AI did not bypass course collaboration protocols. Every issue followed strict Git Flow: branching from `lab3-staging`, opening linked PRs to GitHub Issues, advancing Kanban board cards through defined stages, and strictly observing Rule 1 where the author (@SANOP19) never merged their own PR, relying on thorough peer review and merge approvals from collaborators (@Beethoven190 and @Davidice23).

### 4.3 Ethical & Academic Integrity Statement
The AI agent was utilized strictly as an advanced pair programmer and implementation accelerator. All specifications, business rules, API schemas, UI design implementations, and automated test scenarios were directed, audited, understood, and validated by the student author. All Git operations, pull request discussions, peer code reviews, and project management artifacts adhere strictly to KMUTT and CPE 334 academic integrity standards.

---

## Answer Part 5: Working Login and Password Change UI

### 5.1 Overview & Verification Points
- **Valid Login:** User logs in with email and password, receives JWT token, and enters authenticated application shell.
- **Invalid Login:** Shows inline error message `Invalid email or password.` with HTTP 401.
- **Inactive Account:** Rejects inactive accounts with HTTP 401 `Account is inactive. Please contact system administrator.`
- **First-Login Quarantine:** Intercepts accounts flagged with `mustChangePassword: true` and blocks navigation until an 8-character password is saved.
- **Authenticated Shell:** Clean navbar displaying `👤 [Name] [Role Badge]` and `[Sign Out]`.
- **Logout:** Clears token from localStorage and redirects user immediately back to the Login screen.

### 5.2 Screenshots Evidence

#### 1. Desktop Login Screen (1280px)
![Desktop Login Screen](artifacts/lab-03/screenshots/authentication/01-login-screen-desktop.png)

#### 2. Tablet Login Screen (768px)
![Tablet Login Screen](artifacts/lab-03/screenshots/authentication/02-login-screen-tablet.png)

#### 3. Mobile Login Screen (375px)
![Mobile Login Screen](artifacts/lab-03/screenshots/authentication/03-login-screen-mobile.png)

#### 4. Invalid Credentials Error Feedback
![Invalid Credentials Error](artifacts/lab-03/screenshots/authentication/04-invalid-credentials-error.png)

#### 5. Inactive Account Rejection Feedback
![Inactive Account Error](artifacts/lab-03/screenshots/authentication/05-inactive-account-error.png)

#### 6. First-Login Password Quarantine Modal
![First Login Quarantine Modal](artifacts/lab-03/screenshots/authentication/06-first-login-quarantine-modal.png)

#### 7. Password Complexity Checklist Satisfied
![Password Checklist Satisfied](artifacts/lab-03/screenshots/authentication/07-password-checklist-satisfied.png)

#### 8. Authenticated Requester Application Shell
![Authenticated Requester Shell](artifacts/lab-03/screenshots/authentication/08-requester-authenticated-shell.png)

#### 9. Authenticated IT Staff Application Shell
![Authenticated IT Staff Shell](artifacts/lab-03/screenshots/authentication/09-it-staff-authenticated-shell.png)

#### 10. Authenticated Administrator Application Shell
![Authenticated Administrator Shell](artifacts/lab-03/screenshots/authentication/10-admin-authenticated-shell.png)

---

## Answer Part 6: Working IT Staff Ticket Queue UI

### 6.1 Overview & Verification Points
- **Shared Ticket Queue (`/api/staff/tickets`):** Accessible exclusively to IT Staff and Administrators (HTTP 403 for Requesters).
- **Summary Metrics Bar:** Displays total tickets, unassigned tickets, open tickets, in-progress tickets, and resolved tickets.
- **Multi-Field Filters:** Category filter, priority filter, status filter, and ownership filter tabs (All, Unassigned, Assigned to Me).
- **Search:** Case-insensitive search matching ticket number or summary.
- **Sorting & Pagination:** Sort by created date, ticket number, summary, priority, status; paginated controls.
- **Badges:** Distinction between Requester Priority vs IT Priority; ownership badge or `Unassigned` pill.
- **Responsive Presentation:** Full table view on desktop (1280px); responsive cards layout on mobile (375px).

### 6.2 Screenshots Evidence

#### 1. Desktop Staff Ticket Queue Screen (1280px)
![Desktop Staff Queue](artifacts/lab-03/screenshots/staff-queue/01-staff-queue-desktop.png)

#### 2. Tablet Staff Ticket Queue Screen (768px)
![Tablet Staff Queue](artifacts/lab-03/screenshots/staff-queue/02-staff-queue-tablet.png)

#### 3. Mobile Staff Ticket Queue Screen (375px)
![Mobile Staff Queue](artifacts/lab-03/screenshots/staff-queue/03-staff-queue-mobile.png)

#### 4. Staff Queue with Multi-Field Filter & Search Applied
![Staff Queue Filters Applied](artifacts/lab-03/screenshots/staff-queue/04-staff-queue-search-filter.png)

---

## Answer Part 7: Working IT Staff Ticket Detail UI

### 7.1 Overview & Verification Points
- **Operational Command Panel:** IT Staff can claim unassigned tickets (advances status from `New` to `Open`), reassign owner, and update IT Priority independently of requested priority.
- **8-State Status Workflow:** Status transitions strictly enforce permitted transitions; illegal jumps are blocked with HTTP 400.
- **Tabbed Communication Separation:**
  - **Public Comments Tab:** Zen Green styling; visible to Requester, IT Staff, and Administrator.
  - **Internal Notes Tab:** Amber warning styling (`#F59E0B`), 🔒 lock badge, confidential operational notes strictly blocked from Requesters.
- **Requester Resolution Banner:** Displays prominent green alert when Requester indicates problem appears resolved (`isRequesterResolved: true`).
- **Direct API Authorization:** Supertest integration tests verify that Requesters attempting to GET or POST `/api/tickets/:id/notes` receive HTTP 403 Forbidden with zero notes leaked.

### 7.2 Screenshots Evidence

#### 1. Desktop Staff Ticket Detail Screen (1280px)
![Desktop Staff Ticket Detail](artifacts/lab-03/screenshots/staff-ticket-detail/01-staff-ticket-detail-desktop.png)

#### 2. Tablet Staff Ticket Detail Screen (768px)
![Tablet Staff Ticket Detail](artifacts/lab-03/screenshots/staff-ticket-detail/02-staff-ticket-detail-tablet.png)

#### 3. Mobile Staff Ticket Detail Screen (375px)
![Mobile Staff Ticket Detail](artifacts/lab-03/screenshots/staff-ticket-detail/03-staff-ticket-detail-mobile.png)

#### 4. Operational Control Panel Close-Up
![Operational Control Panel](artifacts/lab-03/screenshots/staff-ticket-detail/04-operational-control-panel.png)

#### 5. Public Comments Thread Tab (Zen Green)
![Public Comments Tab](artifacts/lab-03/screenshots/staff-ticket-detail/05-public-comments-tab.png)

#### 6. Confidential Internal Notes Tab with Lock Badge (Amber Warning)
![Confidential Internal Notes Tab](artifacts/lab-03/screenshots/staff-ticket-detail/06-internal-notes-tab-confidential.png)

#### 7. Requester Resolution Banner Close-Up
![Requester Resolution Banner](artifacts/lab-03/screenshots/staff-ticket-detail/07-requester-resolution-banner.png)

#### 8. Requester Ticket Detail View with Resolution Toggle
![Requester Ticket Detail View](artifacts/lab-03/screenshots/staff-ticket-detail/08-requester-ticket-detail-view.png)

---

## Answer Part 8: Working Administrator User Management UI

### 8.1 Overview & Verification Points
- **User List Table:** Displays Name, Email, Role (Requester, IT Staff, Administrator pills), Status (Active / Deactivated), Password State (Normal / Change Required), and Edit / Reset Pass action buttons.
- **Current User Indicator:** Displays `You` badge on John Smith's row.
- **Search & Role Filter:** Instant filter by name/email and dropdown filter by role.
- **Create User Modal:** Provisions new user with initial password and forced first-login change flag (`mustChangePassword: true`).
- **Edit User Modal:** Edits user profile, role, and active status.
- **Self-Deactivation Guard:** When editing own administrator account, active toggle is disabled and replaced with warning banner (API rejects with HTTP 400 `CANNOT_DEACTIVATE_SELF`).
- **Last Active Admin Guard:** API prevents deactivation of the sole active administrator (HTTP 400 `LAST_ADMIN_PROTECTED`).
- **Reset Password Modal:** Admin assigns new initial password, setting `mustChangePassword: true`.
- **Non-Admin Protection:** Non-administrators attempting to access `/api/admin/users` receive HTTP 403 Forbidden.

### 8.2 Screenshots Evidence

#### 1. Desktop User Management Screen (1280px)
![Desktop User Management](artifacts/lab-03/screenshots/user-management/01-user-management-desktop.png)

#### 2. Tablet User Management Screen (768px)
![Tablet User Management](artifacts/lab-03/screenshots/user-management/02-user-management-tablet.png)

#### 3. Mobile User Management Screen (375px)
![Mobile User Management](artifacts/lab-03/screenshots/user-management/03-user-management-mobile.png)

#### 4. Create User Modal with Initial Password Provisioning
![Create User Modal](artifacts/lab-03/screenshots/user-management/04-create-user-modal.png)

#### 5. Edit User Modal with Role Assignment
![Edit User Modal](artifacts/lab-03/screenshots/user-management/05-edit-user-modal.png)

#### 6. Self-Deactivation Guard Alert (Admin Protection)
![Self Deactivation Guard Alert](artifacts/lab-03/screenshots/user-management/06-self-deactivation-guard-alert.png)

#### 7. Reset Password Modal with Forced Change Flag
![Reset Password Modal](artifacts/lab-03/screenshots/user-management/07-reset-password-modal.png)

---

## Answer Part 9: Zen Green UI and Responsive Evidence

- **Rendered UI Spec Link:** [docs/lab-03/ui-spec.md](file:///c:/Users/nopni/Downloads/toktickit/docs/lab-03/ui-spec.md)

### 9.1 Completed Visual Checklist (VC-01 to VC-09)

| Checklist ID | Design Requirement | Evaluation Standard | Status | Verification Evidence |
| :---: | :--- | :--- | :---: | :--- |
| **VC-01** | **Zen Green Palette** | Tokens (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`) applied consistently across all screens. | **PASS** | Brand header, buttons, badges, and surfaces conform uniformly. |
| **VC-02** | **Role Navigation** | Requesters see only Requester links; Staff see Queue; Admin sees Users; no unauthorized routes. | **PASS** | Dynamic navbar filtering verified in `Navbar.tsx` and E2E-01 suite. |
| **VC-03** | **Badges & Labels** | Consistent color tokens for status (`New`, `Open`, `In Progress`, etc.), priority, and role pills. | **PASS** | Verified on Queue, Detail, and User Management table screens. |
| **VC-04** | **Editable vs Read-Only** | Editable fields have clear input borders; read-only fields use subtle background styling. | **PASS** | Verified in `StaffTicketDetail.tsx` and `UserManagement.tsx` modals. |
| **VC-05** | **Communication Separation** | Public Comments (green/neutral) are visually unmistakable from Internal Notes (amber warning). | **PASS** | Amber border `#F59E0B` and lock badge on internal notes; green on comments. |
| **VC-06** | **Validation Placement** | Inline red error messages placed directly below invalid inputs; banner callouts for global errors. | **PASS** | Verified in Login form, Create Ticket form, and User Modals. |
| **VC-07** | **Focus & Accessibility** | Form inputs display clear `#0B7A46` outline on focus; tab navigation logical. | **PASS** | WCAG AA compliance and keyboard accessibility verified. |
| **VC-08** | **Clipping & Overlap** | Modals, dropdowns, and cards render without clipping or overlapping content. | **PASS** | Verified across all dialogs and expanded comment threads. |
| **VC-09** | **Zero Overflow** | Zero horizontal scrollbars across desktop (1280px), tablet (768px), and mobile (375px) viewports. | **PASS** | Mobile card transformations and responsive table containers verified. |

### 9.2 Responsive Cross-Viewport Comparison Evidence

| Screen | Desktop (1280px) | Tablet (768px) | Mobile (375px) | Layout Adaptation Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **Login Screen** | Centered card (420px max-width) | Centered card (420px max-width) | Full-width container with 16px margins | Preserves form proportions; zero horizontal scroll |
| **Staff Queue** | Full tabular data grid with all columns | Condensed tabular layout | Card view with stacked status badges & priority pills | Table collapses into stacked cards on viewports < 768px |
| **Ticket Detail** | Two-column layout (ticket info + panel) | Stacked single-column layout | Stacked cards with touch-friendly action buttons | Controls wrap vertically; tabbed thread full-width |
| **User Management** | Full account table with actions | Horizontal scrolling container | Stacked card cards with action buttons | Action buttons retain accessible 44px touch targets |
