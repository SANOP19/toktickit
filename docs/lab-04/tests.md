# Lab 4 Test-Driven Engineering Plan and Traceability Matrix

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents (Semester 1/2026)  
**Project:** TokTickIT Multi-Role IT Service Desk Platform  
**Sprint:** Sprint 4 (Actions Taken, Dashboards, and Final Regression)

---

## 1. Test Strategy Overview

Quality assurance for Sprint 4 is implemented following strict **Test-Driven Development (TDD)** and **Test-Driven Specification (Test DD)** principles. Test suites are established before and alongside implementation, verifying every layer of the full-stack architecture:

1. **Backend Integration & REST API Tier (`server/tests/lab-04/`):**
   - Validates data persistence, foreign key integrity, role authorization, optimistic concurrency, and the server-side Resolution Gate.
2. **Frontend UI Component & Vitest Tier (`client/tests/lab-04/`):**
   - Validates Zen Green presentation, responsive card adaptations, input validation feedback, and drill-down routing.
3. **End-to-End Playwright Multi-Role Tier (`e2e/lab-04/`):**
   - Simulates real browser interactions across Requester, IT Staff, and Administrator personas validating end-to-end workflows.
4. **Full Multi-Sprint Regression Suite:**
   - Guarantees 100% pass rate across all historical tests from Labs 1, 2, and 3.

---

## 2. Test Traceability Matrix (AC & BR to Automated Test Mapping)

| Test ID | Layer | Requirement / AC | What It Tests | Expected Result | Automated Test File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **API-01** | API | AC-01, BR-01, BR-03 | Create valid Action Taken | HTTP 201 Created, action saved with authenticated staff ID | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-02** | API | AC-02, BR-05 | Follow-up required without note | HTTP 400 `FOLLOW_UP_NOTE_REQUIRED` | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-03** | API | AC-02, BR-05 | Follow-up required with valid note | HTTP 201 Created, followUpNote stored | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-04** | API | AC-03, BR-04 | Requester attempts creating action | HTTP 403 Forbidden | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-05** | API | AC-04, BR-16 | Requester views owned ticket actions | HTTP 200 OK, returns actions array | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-06** | API | AC-04, BR-16 | Requester views other's ticket actions| HTTP 403/404 without leaking data | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-07** | API | AC-05, BR-07 | Assign action to inactive staff | HTTP 400 `INACTIVE_STAFF_MEMBER` | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-08** | API | AC-06, BR-03 | Update action status to Completed | HTTP 200 OK, status persists | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-09** | API | AC-07, BR-08 | Concurrency collision (stale version) | HTTP 409 Conflict `STALE_UPDATE_DETECTED` | `server/tests/lab-04/actions-taken.api.test.ts` | Planned |
| **API-10** | API | AC-08, BR-11 | Resolve ticket with 0 actions | HTTP 400 `RESOLUTION_GATE_FAILED` | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **API-11** | API | AC-09, BR-11 | Resolve ticket with >= 1 action | HTTP 200 OK, status advances to Resolved | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **API-12** | API | AC-10, BR-12 | Requester toggles problem resolved | HTTP 200 OK, isRequesterResolved = true, currentStatus intact | `server/tests/lab-04/ticket-workflow.api.test.ts` | Planned |
| **API-13** | API | AC-11, BR-14, BR-16 | IT Staff dashboard metrics query | HTTP 200 OK, matches DB counts | `server/tests/lab-04/staff-dashboard.api.test.ts` | Planned |
| **API-14** | API | AC-12, BR-14, BR-15 | Requester dashboard metrics isolation | HTTP 200 OK, returns only user's tickets | `server/tests/lab-04/requester-dashboard.api.test.ts` | Planned |
| **API-15** | API | AC-14, BR-17 | Zero-metric dashboard scenarios | HTTP 200 OK with clean 0 counters | `server/tests/lab-04/staff-dashboard.api.test.ts` | Planned |
| **UI-01** | UI | AC-01, AC-02 | Action Taken modal validation | Disables submit when followUpNote missing | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned |
| **UI-02** | UI | AC-04 | Requester view on Ticket Detail | Renders actions list; hides Add/Edit buttons | `client/tests/lab-04/ActionsTaken.test.tsx` | Planned |
| **UI-03** | UI | AC-08, AC-09 | Resolution Gate alert on detail | Displays warning when resolving with 0 actions | `client/tests/lab-04/TicketWorkflow.test.tsx` | Planned |
| **UI-04** | UI | AC-11, AC-13 | Staff Dashboard KPI cards & drill-down | Renders 5 KPI cards; clicking triggers route change | `client/tests/lab-04/StaffDashboard.test.tsx` | Planned |
| **UI-05** | UI | AC-12, AC-13 | Requester Dashboard cards & drill-down| Renders 4 KPI cards with personal ticket counts | `client/tests/lab-04/RequesterDashboard.test.tsx` | Planned |
| **E2E-01** | E2E | AC-01, AC-03, AC-04 | Multi-Role Actions Taken Journey | Staff records action -> Requester inspects in read-only | `e2e/lab-04/actions-taken-flow.spec.ts` | Planned |
| **E2E-02** | E2E | AC-08, AC-09, AC-10 | Resolution Gate & Status Flow | Blocked without actions -> Action recorded -> Resolved | `e2e/lab-04/ticket-resolution.spec.ts` | Planned |
| **E2E-03** | E2E | AC-11, AC-12, AC-13 | Dashboard Analytics & Drill-Down | Verifies metric counters and navigation to filtered tables | `e2e/lab-04/dashboards.spec.ts` | Planned |

---

## 3. Test Execution Commands & Regression Verification

### 3.1 Backend Integration Suites
```powershell
npm test --prefix server
```
*Executes all 17 integration suites across `tests/lab-01/`, `tests/lab-02/`, `tests/lab-03/`, and `tests/lab-04/`.*

### 3.2 Frontend Vitest Suites
```powershell
npm test --prefix client
```
*Executes all component test suites verifying clean DOM rendering and mock API integration.*

### 3.3 Playwright End-to-End Suites
```powershell
npx playwright test e2e/lab-04/
```
*Runs complete multi-browser end-to-end journey tests for Sprint 4 features.*
