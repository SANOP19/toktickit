# Peer Review Record — Lab 3: TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents  
**Semester:** 1/2026  
**Project:** TokTickIT Multi-Role Service Desk Platform  
**Repository Author:** Nitithorn Ketkaew ([@SANOP19](https://github.com/SANOP19) — Student ID: `67070505203`)  
**Collaborators & Peer Reviewers:** Supanut Watthanasimakorn ([@Beethoven190](https://github.com/Beethoven190) — Student ID: `67070505226`), Wachirawit Photchamnian ([@Davidice23](https://github.com/Davidice23))  

---

## 1. Peer Review Process & Rules Adherence

Throughout Sprint 3, our engineering pair strictly enforced all core course collaboration rules:

1. **Rule 1 — Reviewer Merges PR (Strictly Enforced):** The author of a Pull Request (**@SANOP19**) **never** merges their own code. The assigned peer reviewer conducts a thorough line-by-line review against Acceptance Criteria, validates automated test results, submits structured feedback, approves the PR, and clicks the green **`Merge pull request`** button into `lab3-staging`.
2. **Rule 2 — Reply to All Review Comments:** Every comment, suggestion, or question raised during peer review is answered and verified before merge approval.
3. **Rule 3 — Link PR to Issue:** Every PR is explicitly linked to its corresponding GitHub Issue using the `Development` sidebar, automating Kanban card movement.
4. **Rule 4 — Kanban Board Lifecycle:** All issues progress through the defined Kanban stages: `Backlog` → `Specified` → `Started` → `PR Review` → `Fixing` (if needed) → `Done`.
5. **Rule 5 — Staging Branch Strategy:** All feature branches (`feature/X-...`) originate from and merge into `lab3-staging`. The final release is prepared by merging `lab3-staging` into `main`.

---

## 2. PRs Created by @SANOP19 (Reviewed & Merged by Collaborators)

### Table 1.1: Feature Pull Requests Authored by @SANOP19

| Issue # | Feature Branch | PR # | PR Link | Target Branch | Reviewer | Review Decision | Merged By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Issue 1** | `feature/1-sprint3-spec` | #22 | [PR #22](https://github.com/SANOP19/toktickit/pull/22) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 2** | `feature/2-auth-foundation` | #25 | [PR #25](https://github.com/SANOP19/toktickit/pull/25) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 3** | `feature/3-requester-continuation` | #27 | [PR #27](https://github.com/SANOP19/toktickit/pull/27) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 4** | `feature/4-staff-queue` | #29 | [PR #29](https://github.com/SANOP19/toktickit/pull/29) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 5** | `feature/5-staff-ticket-detail` | #31 | [PR #31](https://github.com/SANOP19/toktickit/pull/31) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 6** | `feature/6-admin-user-management` | #33 | [PR #33](https://github.com/SANOP19/toktickit/pull/33) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 7** | `feature/7-docs-e2e` | #35 | [PR #35](https://github.com/SANOP19/toktickit/pull/35) | `lab3-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Release** | `lab3-staging` | #37 | [PR #37](https://github.com/SANOP19/toktickit/pull/37) | `main` | @Beethoven190 | **Approved** | @Beethoven190 |

---

### Detailed Evaluation of Author PRs

#### PR #22 (Issue 1: Sprint 3 Engineering Specification, UI Guidelines & Test Plan)
- **Author Summary:** Authored the complete foundational Sprint 3 engineering contracts across `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md`. Formulated 12 Functional Requirements (FR-01 to FR-12), 21 numbered Business Rules (BR-01 to BR-21), 15 Acceptance Criteria (AC-01 to AC-15), the 8-state ticket transition matrix, Role × Endpoint authorization matrix, and Traceability Matrix.
- **Peer Review Feedback (@Beethoven190):** Verified that the 8-state transition matrix accurately models operational lifecycles, that internal notes are strictly restricted to staff/admin, and that the Traceability Matrix completely maps all 15 ACs to automated test files.
- **Outcome:** **Approved and merged** by @Beethoven190 into `lab3-staging`.

#### PR #25 (Issue 2: Database Models, Authentication Foundation & Password Quarantine)
- **Author Summary:** Implemented Prisma migration evolving `RequesterUser` into the unified `User` model, added bcrypt password hashing (10 salt rounds), JWT Bearer authentication middleware (`authenticateToken`, `requireRole`, `enforcePasswordChangeQuarantine`), `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`, `POST /api/auth/change-password`, `LoginScreen.tsx` with inline error validation and busy spinner, `MandatoryPasswordChangeModal.tsx` with live 8-character and matching checklist, and idempotent seed data.
- **Peer Review Feedback (@Beethoven190):** Verified that inactive accounts receive HTTP 401 (`ACCOUNT_INACTIVE`), first-login users are quarantined and blocked from functional endpoints (HTTP 403 `PASSWORD_CHANGE_REQUIRED`), and client navigation dynamically adapts to authenticated roles.
- **Outcome:** **Approved and merged** by @Beethoven190 into `lab3-staging`.

#### PR #27 (Issue 3: Requester Continuation, Public Comments & Problem Resolved Indicator)
- **Author Summary:** Migrated Requester features to use authenticated identity (`req.user.id`), completely removed temporary `DevRequesterSelector`, added threaded Public Comments (`GET/POST /api/tickets/:id/comments`), and added the "Problem Appears Resolved" toggle button (`PATCH /api/tickets/:id/resolve-indication`) with subtle resolved badge in ticket lists without changing formal ticket status.
- **Peer Review Feedback (@Beethoven190):** Verified that forged `requesterId` payloads are strictly ignored, ticket isolation prevents cross-requester access, and public comments append cleanly.
- **Outcome:** **Approved and merged** by @Beethoven190 into `lab3-staging`.

#### PR #29 (Issue 4: IT Staff Ticket Queue with Search, Filters, Sorting & Pagination)
- **Author Summary:** Built `GET /api/staff/tickets` endpoint supporting multi-field search (ticket number, summary), category/priority/status/ownership filtering, sorting, and pagination metadata. Implemented `StaffTicketQueue.tsx` adhering to Teacher Mockup 2 with summary metrics bar, query controls, desktop table, and mobile card views.
- **Peer Review Feedback (@Beethoven190):** Verified queue filtering combinations, responsive card transitions on viewports < 768px, and that non-staff users receive HTTP 403 Forbidden.
- **Outcome:** **Approved and merged** by @Beethoven190 into `lab3-staging`.

#### PR #31 (Issue 5: IT Staff Ticket Detail, Ownership, IT Priority, Workflow & Internal Notes)
- **Author Summary:** Implemented `GET /api/staff/tickets/:id`, claim ticket (`PATCH /api/staff/tickets/:id/claim`), IT priority update (`PATCH /api/staff/tickets/:id/it-priority`), status transition (`PATCH /api/staff/tickets/:id/status`), and confidential internal notes (`GET/POST /api/tickets/:id/notes`). Implemented `StaffTicketDetail.tsx` (Teacher Mockup 3) with operational control panel, green requester resolution banner, and visually distinct amber-bordered confidential internal notes.
- **Peer Review Feedback (@Beethoven190):** Verified that Requesters are strictly forbidden from viewing or posting internal notes (HTTP 403), status transitions enforce the 8-state matrix, and claiming assigns ownership properly.
- **Outcome:** **Approved and merged** by @Beethoven190 into `lab3-staging`.

#### PR #33 (Issue 6: Administrator User Management Screen & Safety Controls)
- **Author Summary:** Implemented `GET /api/admin/users`, `POST /api/admin/users`, `PATCH /api/admin/users/:id`, and `POST /api/admin/users/:id/reset-password`. Implemented `UserManagement.tsx` (Teacher Mockup 4) with Create User Modal, Edit User Modal, Reset Password Modal, and critical safety guards: Self-Deactivation Guard (HTTP 400 `CANNOT_DEACTIVATE_SELF`), Last Active Admin Guard (HTTP 400 `LAST_ADMIN_PROTECTED`), and Email Uniqueness Guard (HTTP 409 `EMAIL_ALREADY_EXISTS`).
- **Peer Review Feedback (@Beethoven190):** Verified that active toggle is safely disabled when an administrator edits their own account, password reset sets `mustChangePassword=true`, and non-admins receive HTTP 403.
- **Outcome:** **Approved and merged** by @Beethoven190 into `lab3-staging`.

#### PR #35 (Issue 7: Playwright Multi-Role E2E Test Suite & Documentation Wrap-Up)
- **Author Summary:** Implemented Playwright multi-role E2E suites (`authentication.spec.ts`, `staff-ticket-flow.spec.ts`, `user-administration.spec.ts`) covering all 3 personas, finalized `tests.md` with Section 4 test execution logs (153/153 passing tests), `ai-use.md` with 7-phase log and ethical integrity statement, and updated `reviewer.md`.
- **Peer Review Feedback (@Beethoven190):** Verified 100% test pass rate across all 27 automated test files (99 backend, 49 frontend, 5 E2E), verified zero TypeScript/build errors, and confirmed complete DoD compliance.
- **Outcome:** **Approved and merged** by @Beethoven190 into `lab3-staging`.

#### PR #37 (Sprint 3 Final Release: Merge lab3-staging into main)
- **Author Summary:** Terminal release Pull Request integrating all Lab 3 deliverables (Issues 1 through 7) from `lab3-staging` into `main`, closing Issue #36.
- **Peer Review Feedback (@Beethoven190 / @Davidice23):** Final release verification confirming all 153 automated tests pass, zero TypeScript compilation errors, complete screenshot evidence in `artifacts/lab-03/screenshots/`, and unbroken continuity with Lab 2.
- **Outcome:** **Approved and merged** into `main` by @Beethoven190.

---

## 3. Peer PRs Reviewed & Merged by @SANOP19 (As Reviewer)

As part of collaborative peer review, @SANOP19 conducted comprehensive code reviews and executed merges for peer repositories:

### Table 1.2: Peer Pull Requests Reviewed & Merged by @SANOP19

| Peer Author | Peer Repo | PR # | Issue Reviewed | Review Decision | Merged By |
| :--- | :--- | :--- | :--- | :--- | :--- |
| @Beethoven190 | `Beethoven190/toktickit` | #23 | [PR #23](https://github.com/Beethoven190/toktickit/pull/23) (Issue 1: Sprint 3 Engineering Contract) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #25 | [PR #25](https://github.com/Beethoven190/toktickit/pull/25) (Issue 2: Authentication Foundation) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #27 | [PR #27](https://github.com/Beethoven190/toktickit/pull/27) (Issue 3: IT Staff Ticket Queue) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #29 | [PR #29](https://github.com/Beethoven190/toktickit/pull/29) (Issue 4: IT Staff Ticket Operations) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #31 | [PR #31](https://github.com/Beethoven190/toktickit/pull/31) (Issue 5: Public Comments, Internal Notes & Problem Resolved) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #33 | [PR #33](https://github.com/Beethoven190/toktickit/pull/33) (Issue 6: Admin User Management) | **Approved** | @SANOP19 |
| @Beethoven190 | `Beethoven190/toktickit` | #34 | [PR #34](https://github.com/Beethoven190/toktickit/pull/34) (Sprint 3 Final Release) | **Approved** | @SANOP19 |

### Detailed Evaluation of Peer Reviews:

#### Peer PR #23 (Author: @Beethoven190 — Issue 1: Engineering Contract)
- **Review Scope:** Evaluated `docs/lab-03/specification.md`, `tests.md`, `api-spec.md`, and `ui-spec.md`.
- **Review Finding:** Confirmed that the 15 Acceptance Criteria (AC-01 to AC-15) and 21 Business Rules were clearly specified with test traceability.
- **Outcome:** **Approved and merged** into peer `lab3-staging` by @SANOP19.

#### Peer PR #25 (Author: @Beethoven190 — Issue 2: Authentication Foundation)
- **Review Scope:** Evaluated Prisma user model migration, JWT auth middleware, login/logout routes, and password quarantine modal.
- **Review Finding:** Verified that bcrypt password hashing is applied with salt rounds = 10, inactive account check returns 401, and quarantine intercept works reliably.
- **Outcome:** **Approved and merged** into peer `lab3-staging` by @SANOP19.

#### Peer PR #27 (Author: @Beethoven190 — Issue 3: IT Staff Ticket Queue)
- **Review Scope:** Evaluated IT staff queue endpoint, multi-field search, status/priority filtering, sorting, and responsive UI components.
- **Review Finding:** Verified that data isolation protects unassigned vs assigned tickets, search query performance is optimized, and non-staff access is blocked.
- **Outcome:** **Approved and merged** into peer `lab3-staging` by @SANOP19.

#### Peer PR #29 (Author: @Beethoven190 — Issue 4: IT Staff Ticket Operations)
- **Review Scope:** Evaluated ticket claiming, IT Priority setting, status transitions, public comments, and confidential internal notes.
- **Review Finding:** Confirmed that Requesters cannot see internal notes, status transitions reject illegal jumps with HTTP 400, and claim updates ownership.
- **Outcome:** **Approved and merged** into peer `lab3-staging` by @SANOP19.

#### Peer PR #31 (Author: @Beethoven190 — Issue 5: Public Comments, Internal Notes & Problem Resolved)
- **Review Scope:** Evaluated Public Comments (`GET/POST /api/tickets/:id/comments`), confidential Internal Notes (`GET/POST /api/tickets/:id/notes`), and Requester resolution indication (`POST /api/tickets/:id/resolve-indication`).
- **Review Finding:** Verified that Requester access to `/api/tickets/:id/notes` is strictly blocked with HTTP 403 Forbidden without leaking note existence (AC-14, BR-05). Verified that Requesters can toggle problem resolution indication without changing formal ticket status (FR-07, BR-07). Verified input length constraints (1–2,000 chars) and distinct visual separation between green comments and amber-bordered internal notes.
- **Outcome:** **Approved and merged** into peer `lab3-staging` by @SANOP19.

#### Peer PR #33 (Author: @Beethoven190 — Issue 6: Administrator User Management)
- **Review Scope:** Evaluated user listing, account creation, role editing, password reset modal, and administrative safety guards.
- **Review Finding:** Tested Self-Deactivation Guard (HTTP 400), Last Active Admin Guard (HTTP 400), ticket ownership safety, and verified that password reset flags `mustChangePassword = true`.
- **Outcome:** **Approved and merged** into peer `lab3-staging` by @SANOP19.

#### Peer PR #34 (Author: @Beethoven190 — Sprint 3 Final Release)
- **Review Scope:** Evaluated the comprehensive staging-to-main merge PR in peer repository. Verified git history, passing automated suites, and complete documentation.
- **Review Finding:** Clean staged integration with zero regression.
- **Outcome:** **Approved and merged** into peer `main` by @SANOP19.

---

## 4. Quality Checklist & Course Rules Adherence

| Check Item | Requirement | Status | Verification Evidence |
| :--- | :--- | :---: | :--- |
| **Rule 1: Reviewer Merges** | Author never merges own PR; reviewer inspects and merges | **PASS** | PRs #22, #25, #27, #29, #31, #33, #35 merged by @Beethoven190 |
| **Rule 2: Reply to Comments** | All review comments and suggestions answered and verified | **PASS** | 100% resolution across all PR discussions |
| **Rule 3: Link PR to Issue** | Every PR linked to corresponding GitHub Issue | **PASS** | Issues #23, #24, #26, #28, #30, #32, #34 linked and closed |
| **Rule 4: Kanban Progression** | Card moves through Backlog → Specified → Started → PR Review → Done | **PASS** | All 7 cards on Project #3 board transitioned to `Done` |
| **Rule 5: Branch Strategy** | Feature branches target `lab3-staging`; release targets `main` | **PASS** | All 7 feature branches merged into `lab3-staging` |
| **Backend Integration Tests** | 100% pass rate across Vitest server integration suites | **PASS** | 13 test files, 99/99 passed (1.81s) |
| **Frontend Component Tests** | 100% pass rate across Vitest client component suites | **PASS** | 11 test files, 49/49 passed (4.66s) |
| **Playwright E2E Suites** | 100% pass rate across multi-role end-to-end user journeys | **PASS** | 3 test files, 5/5 passed (6.3s) |
| **Production Build** | TypeScript compilation and Vite production bundle | **PASS** | 0 TypeScript errors, 0 Vite build warnings |
| **Total Test Suite** | Combined automated test coverage across full stack | **PASS** | **27 test files, 153/153 tests passed (100%)** |
