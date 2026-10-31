# Lab 4 Test-Driven Engineering Plan and Traceability Matrix

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents (Semester 1/2026)  
**Project:** TokTickIT Multi-Role IT Service Desk Platform  
**Sprint:** Sprint 4 (Actions Taken, Dashboards, and Final Regression)

---

## 1. Test Strategy Overview

Quality assurance for Sprint 4 is implemented following strict **Test-Driven Development (TDD)** and **Test-Driven Specification (Test DD)** principles. Test suites are established before and alongside implementation, verifying every layer of the full-stack architecture:

1. **Backend Integration & REST API Tier (`server/tests/lab-04/`):**
   - Validates data persistence, foreign key integrity, role authorization, optimistic concurrency, and the server-side Resolution Gate.
   - Result: **134 / 134 passed** across 17 test suites (100% pass rate).
2. **Frontend UI Component & Vitest Tier (`client/tests/lab-04/`):**
   - Validates Zen Green presentation, responsive card adaptations, input validation feedback, and drill-down routing.
   - Result: **73 / 73 passed** across 15 test suites (100% pass rate).
3. **End-to-End Playwright Multi-Role Tier (`e2e/lab-04/`):**
   - Simulates real browser interactions across Requester, IT Staff, and Administrator personas validating end-to-end workflows.
   - Result: **6 / 6 passed** (Sprint 4) and **12 / 12 passed** (Full Multi-Sprint E2E).
4. **Full Multi-Sprint Regression Suite:**
   - Guarantees 100% pass rate across all historical tests from Labs 1, 2, 3, and 4 (219 total automated tests).

---

## 2. Test Traceability Matrix (AC & BR to Automated Test Mapping)

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **API-01** | API | AC-01, BR-01, BR-03 | Create valid Action Taken | HTTP 201 Created, action saved with authenticated staff ID | `server/tests/lab-04/actions-taken.api.test.ts` | **Passed** |
| **API-02** | API | AC-02, BR-05 | Follow-up required without note | HTTP 400 `FOLLOW_UP_NOTE_REQUIRED` | `server/tests/lab-04/actions-taken.api.test.ts` | **Passed** |
| **API-03** | API | AC-02, BR-05 | Follow-up required with valid note | HTTP 201 Created, followUpNote stored | `server/tests/lab-04/actions-taken.api.test.ts` | **Passed** |
| **API-04** | API | AC-03, BR-04 | Requester attempts creating action | HTTP 403 Forbidden | `server/tests/lab-04/actions-taken.api.test.ts` | **Passed** |
| **API-05** | API | AC-04, BR-16 | Requester views owned ticket actions | HTTP 200 OK, returns actions array | `server/tests/lab-04/actions-taken.api.test.ts` | **Passed** |
| **API-06** | API | AC-04, BR-16 | Requester views other's ticket actions| HTTP 403/404 without leaking data | `server/tests/lab-04/actions-taken.api.test.ts` | **Passed** |
| **API-07** | API | AC-05, BR-07 | Assign action to inactive staff | HTTP 400 `INACTIVE_STAFF_MEMBER` | `server/tests/lab-04/actions-taken.api.test.ts` | **Passed** |
| **API-08** | API | AC-06, BR-03 | Update action status to Completed | HTTP 200 OK, status persists | `server/tests/lab-04/actions-taken.api.test.ts` | **Passed** |
| **API-09** | API | AC-07, BR-08 | Concurrency collision (stale version) | HTTP 409 Conflict `STALE_UPDATE_DETECTED` | `server/tests/lab-04/actions-taken.api.test.ts` | **Passed** |
| **API-10** | API | AC-08, BR-11 | Resolve ticket with 0 actions | HTTP 400 `RESOLUTION_GATE_FAILED` | `server/tests/lab-04/ticket-workflow.api.test.ts` | **Passed** |
| **API-11** | API | AC-09, BR-11 | Resolve ticket with >= 1 action | HTTP 200 OK, status advances to Resolved | `server/tests/lab-04/ticket-workflow.api.test.ts` | **Passed** |
| **API-12** | API | AC-10, BR-12 | Requester toggles problem resolved | HTTP 200 OK, isRequesterResolved = true, currentStatus intact | `server/tests/lab-04/ticket-workflow.api.test.ts` | **Passed** |
| **API-13** | API | AC-11, BR-14, BR-16 | IT Staff dashboard metrics query | HTTP 200 OK, matches DB counts | `server/tests/lab-04/staff-dashboard.api.test.ts` | **Passed** |
| **API-14** | API | AC-12, BR-14, BR-15 | Requester dashboard metrics isolation | HTTP 200 OK, returns only user's tickets | `server/tests/lab-04/requester-dashboard.api.test.ts` | **Passed** |
| **API-15** | API | AC-14, BR-17 | Zero-metric dashboard scenarios | HTTP 200 OK with clean 0 counters | `server/tests/lab-04/staff-dashboard.api.test.ts` | **Passed** |
| **UI-01** | UI | AC-01, AC-02 | Action Taken modal validation | Disables submit when followUpNote missing | `client/tests/lab-04/ActionsTaken.test.tsx` | **Passed** |
| **UI-02** | UI | AC-04 | Requester view on Ticket Detail | Renders actions list; hides Add/Edit buttons | `client/tests/lab-04/ActionsTaken.test.tsx` | **Passed** |
| **UI-03** | UI | AC-08, AC-09 | Resolution Gate alert on detail | Displays warning when resolving with 0 actions | `client/tests/lab-04/TicketWorkflow.test.tsx` | **Passed** |
| **UI-04** | UI | AC-11, AC-13 | Staff Dashboard KPI cards & drill-down | Renders 5 KPI cards; clicking triggers route change | `client/tests/lab-04/StaffDashboard.test.tsx` | **Passed** |
| **UI-05** | UI | AC-12, AC-13 | Requester Dashboard cards & drill-down| Renders 4 KPI cards with personal ticket counts | `client/tests/lab-04/RequesterDashboard.test.tsx` | **Passed** |
| **E2E-01** | E2E | AC-01, AC-03, AC-04 | Multi-Role Actions Taken Journey | Staff records action -> Requester inspects in read-only | `e2e/lab-04/actions-taken-flow.spec.ts` | **Passed** |
| **E2E-02** | E2E | AC-08, AC-09, AC-10 | Resolution Gate & Status Flow | Blocked without actions -> Action recorded -> Resolved | `e2e/lab-04/ticket-resolution.spec.ts` | **Passed** |
| **E2E-03** | E2E | AC-11, AC-12, AC-13 | Dashboard Analytics & Drill-Down | Verifies metric counters and navigation to filtered tables | `e2e/lab-04/dashboards.spec.ts` | **Passed** |

---

## 3. Test Execution Commands & Regression Verification Results

### 3.1 Backend Integration Suites
```powershell
npm test --prefix server
```
*Executes all 17 integration suites across `tests/lab-01/`, `tests/lab-02/`, `tests/lab-03/`, and `tests/lab-04/`.*  
**Result:** `17 passed (17), 134 passed (134)` in ~6.14s.

### 3.2 Frontend Vitest Suites
```powershell
npm test --prefix client -- --run
```
*Executes all component test suites verifying clean DOM rendering, mock API integration, and user interactions.*  
**Result:** `15 passed (15), 73 passed (73)` in ~8.34s.

### 3.3 Client Production Build
```powershell
npm --prefix client run build
```
*Compiles TypeScript and bundles via Vite.*  
**Result:** Built in ~699ms with 0 type errors and 0 warnings.

### 3.4 Playwright End-to-End Suites (Lab 4)
```powershell
npx playwright test e2e/lab-04/ --workers=1
```
*Runs complete multi-role end-to-end journey tests for Sprint 4 features.*  
**Result:** `6 passed (6)` in ~26.2s (100% pass rate across Desktop, Tablet, and Mobile).
