# Lab 3 Test Engineering Specification & Traceability Matrix

## 1. Test Strategy & Engineering Overview

The Sprint 3 testing architecture establishes rigorous validation across all tiers of the full-stack system:
1. **Backend Integration & API Tests (`server/tests/lab-03/`):** Supertest integration tests verifying authentication, token verification, strict role-based access control (RBAC), ticket queue search/filter/sort/pagination, operational state transitions, and administrator safety constraints.
2. **Frontend Component Tests (`client/tests/lab-03/`):** React Testing Library tests verifying form validation, busy states, password complexity checklist, role-based navigation rendering, operational controls, and administrative modals.
3. **End-to-End User Journey Tests (`e2e/lab-03/`):** Playwright automated browser tests simulating complete multi-user workflows across Requester, IT Staff, and Administrator roles.

---

## 2. Test Traceability Matrix Across Acceptance Criteria

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File Path | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API-01** | API | AC-01, BR-01 | Valid credentials login | HTTP 200, JWT token returned, user profile populated | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-02** | API | AC-01, BR-03 | Invalid password login | HTTP 401 Unauthorized (`INVALID_CREDENTIALS`) | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-03** | API | AC-02, BR-01 | Inactive account login | HTTP 401 Unauthorized (`ACCOUNT_INACTIVE`) | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-04** | API | AC-03, BR-02 | First-login user access to normal endpoints | HTTP 403 Forbidden (`PASSWORD_CHANGE_REQUIRED`) | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-05** | API | AC-03, BR-02 | Change password for quarantined user | HTTP 200, password updated, `mustChangePassword` cleared | `server/tests/lab-03/auth.api.test.ts` | Pass |
| **API-06** | API | AC-04, BR-05 | Requester queries tickets | Returns only tickets where `requesterId == req.user.id` | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| **API-07** | API | AC-04, BR-06 | Requester accesses other's ticket | HTTP 404/403 without leaking data | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| **API-08** | API | AC-06, BR-15 | Requester requests Internal Notes | HTTP 403 Forbidden with zero notes returned | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| **API-09** | API | AC-05, BR-14 | Post Public Comment on ticket | HTTP 201 Created, comment visible to requester and staff | `server/tests/lab-03/requester-continuation.api.test.ts` | Pass |
| **API-10** | API | AC-06, BR-15 | IT Staff posts Internal Note | HTTP 201 Created, internal note saved with staff author | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| **API-11** | API | AC-07, BR-08 | IT Staff queries ticket queue | Returns paginated queue matching search and filter parameters | `server/tests/lab-03/staff-queue.api.test.ts` | Pass |
| **API-12** | API | AC-08, BR-12 | IT Staff claims unassigned ticket | Ticket `ownerId` set to staff member; status advances to Open | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| **API-13** | API | AC-08, BR-11 | Update IT Priority | `itPriority` updated; `requestedPriority` remains untouched | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| **API-14** | API | AC-09, BR-09 | Valid ticket status transition | Status advances according to 8-state transition matrix | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| **API-15** | API | AC-09, BR-09 | Invalid ticket status transition | HTTP 400 Bad Request (`INVALID_STATUS_TRANSITION`) | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| **API-16** | API | AC-14, BR-10 | Requester signals problem resolved | `isRequesterResolved` becomes true; formal status unchanged | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pass |
| **API-17** | API | AC-10, BR-20 | Admin creates user | HTTP 201 Created with initial password and forced change flag | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-18** | API | AC-10, BR-20 | Admin creates user with duplicate email | HTTP 409 Conflict (`EMAIL_ALREADY_EXISTS`) | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-19** | API | AC-11, BR-18 | Admin attempts self-deactivation | HTTP 400 Bad Request (`CANNOT_DEACTIVATE_SELF`) | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-20** | API | AC-12, BR-19 | Admin deactivates sole active admin | HTTP 400 Bad Request (`LAST_ADMIN_PROTECTED`) | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| **API-21** | API | AC-13, BR-07 | Non-admin accesses user management API | HTTP 403 Forbidden | `server/tests/lab-03/authorization.api.test.ts` | Pass |
| **UI-01** | UI | AC-01 | Login screen validation | Shows inline error on empty inputs; shows busy spinner | `client/tests/lab-03/Login.test.tsx` | Pass |
| **UI-02** | UI | AC-03 | Mandatory Change Password modal | Enforces 8-char rule & password match before submit | `client/tests/lab-03/ChangePassword.test.tsx` | Pass |
| **UI-03** | UI | AC-07 | Staff Ticket Queue table & filters | Renders ticket rows, filter dropdowns, and pagination controls | `client/tests/lab-03/StaffTicketQueue.test.tsx` | Pass |
| **UI-04** | UI | AC-08, AC-09 | Staff Ticket Detail controls | Renders Owner claim, IT priority, and status dropdowns | `client/tests/lab-03/StaffTicketDetail.test.tsx` | Pass |
| **UI-05** | UI | AC-05, AC-06 | Distinct Comments vs Internal Notes | Distinct visual styling for public comments vs amber notes | `client/tests/lab-03/StaffTicketDetail.test.tsx` | Pass |
| **UI-06** | UI | AC-10, AC-11 | User Management & Admin safety | Disables self-deactivation toggle on own account row | `client/tests/lab-03/UserManagement.test.tsx` | Pass |
| **E2E-01** | E2E | AC-01, AC-03 | Login & First-Login Password Change | User logs in with initial password, forced to change, enters app | `e2e/lab-03/authentication.spec.ts` | Pass |
| **E2E-02** | E2E | AC-04, AC-08, AC-09 | End-to-End Ticket Lifecycle | Requester creates -> Staff claims/updates/notes -> Resolved | `e2e/lab-03/staff-ticket-flow.spec.ts` | Pass |
| **E2E-03** | E2E | AC-10, AC-11, AC-12 | Admin User Lifecycle & Safety Guards | Create user, edit role, verify self-deactivation blocked | `e2e/lab-03/user-administration.spec.ts` | Pass |

---

## 3. Test Execution Commands

```bash
# Execute Backend API & Security Suites (Server)
cd server
npm test -- --run

# Execute Frontend Component Suites (Client)
cd ../client
npm test

# Execute Playwright End-to-End Multi-Role Suites
cd ..
npx playwright test e2e/lab-03/
```

---

## 4. Final Test Execution Results & Metrics

All automated test suites across all three architectural layers pass 100% with zero disabled or skipped tests:

### 4.1 Backend Integration & Security Suites (`npm test -- --run` in `server/`)
```text
 ✓ tests/lab-01/health.test.ts (1 test)
 ✓ tests/lab-01/categories.test.ts (1 test)
 ✓ tests/lab-02/requester-context.api.test.ts (2 tests)
 ✓ tests/lab-02/create-ticket.api.test.ts (3 tests)
 ✓ tests/lab-02/my-tickets.api.test.ts (4 tests)
 ✓ tests/lab-02/ticket-detail.api.test.ts (3 tests)
 ✓ tests/lab-03/staff-queue.api.test.ts (13 tests)
 ✓ tests/lab-03/requester-continuation.api.test.ts (9 tests)
 ✓ tests/lab-03/authorization.api.test.ts (3 tests)
 ✓ tests/lab-02/attachments.api.test.ts (7 tests)
 ✓ tests/lab-03/staff-ticket-detail.api.test.ts (22 tests)
 ✓ tests/lab-03/users-admin.api.test.ts (19 tests)
 ✓ tests/lab-03/auth.api.test.ts (12 tests)

 Test Files  13 passed (13)
      Tests  99 passed (99)
   Duration  1.77s
```

### 4.2 Frontend Component Suites (`npm test` in `client/`)
```text
 ✓ tests/lab-03/ChangePassword.test.tsx (4 tests)
 ✓ tests/lab-03/Login.test.tsx (6 tests)
 ✓ tests/lab-02/MyTickets.test.tsx (3 tests)
 ✓ tests/lab-01/App.test.tsx (3 tests)
 ✓ tests/lab-02/RequesterContext.test.tsx (2 tests)
 ✓ tests/lab-02/CreateTicket.test.tsx (3 tests)
 ✓ tests/lab-03/StaffTicketQueue.test.tsx (7 tests)
 ✓ tests/lab-03/RequesterContinuation.test.tsx (3 tests)
 ✓ tests/lab-02/TicketDetail.test.tsx (3 tests)
 ✓ tests/lab-03/StaffTicketDetail.test.tsx (8 tests)
 ✓ tests/lab-03/UserManagement.test.tsx (7 tests)

 Test Files  11 passed (11)
      Tests  49 passed (49)
   Duration  4.49s
```

### 4.3 Playwright End-to-End Multi-Role Suites (`npx playwright test e2e/lab-03/`)
```text
  ok [chromium] › e2e/lab-03/authentication.spec.ts: valid credentials login across Requester, IT Staff, and Admin roles
  ok [chromium] › e2e/lab-03/authentication.spec.ts: inactive account login is rejected with HTTP 401 and error message
  ok [chromium] › e2e/lab-03/authentication.spec.ts: first-login quarantine intercepts user and forces password change
  ok [chromium] › e2e/lab-03/staff-ticket-flow.spec.ts: full operational ticket lifecycle across Requester and IT Staff personas
  ok [chromium] › e2e/lab-03/user-administration.spec.ts: admin user provisioning, role editing, self-deactivation protection, and password reset

  5 passed (7.4s)
```

### 4.4 Summary Quality Metrics
- **Total Automated Test Suites:** 27 test files
- **Total Passing Automated Tests:** 153 tests (100% pass rate)
- **Regression Defects:** 0
- **TypeScript Compilation Errors:** 0 (`tsc` on server, `tsc && vite build` on client)
