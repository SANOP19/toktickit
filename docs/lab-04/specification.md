# Lab 4 Sprint Engineering Specification: TokTickIT Actions Taken, Dashboards, and Final Regression

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents (Semester 1/2026)  
**Project:** TokTickIT Multi-Role IT Service Desk Platform  
**Sprint:** Sprint 4 (Final Operational Increment)  
**Author:** Nitithorn Ketkaew ([@SANOP19](https://github.com/SANOP19) — Student ID: `67070505203`)  
**Collaborator & Peer Reviewer:** Supanut Watthanasimakorn ([@Beethoven190](https://github.com/Beethoven190))

---

## 1. Sprint Goal
Complete the core TokTickIT service-desk operational workflow by introducing a parent-child work-tracking structure (**Actions Taken by IT Staff**), enforcing the final **Ticket status rules and Resolution Gate**, delivering role-appropriate **Operational Dashboards** for Requesters and IT Staff, and performing full application hardening and regression defense across all capabilities built in Labs 1 through 3 under the Zen Green design system.

---

## 2. Stakeholder Request Interpretation
The stakeholder requires TokTickIT to bridge the gap between triage and actual problem resolution:
1. **Actions Taken Tracking:** The service desk must record the actual technical interventions performed under each Ticket. Each Action Taken entry must capture the creation date/time, detailed description, operational result, performing staff member (auto-attributed), a follow-up requirement indicator with mandatory notes when required, and textual attachment notes identifying relevant visual/diagnostic evidence.
2. **Teamwork & Ownership Coordination:** While the primary Ticket Owner remains responsible for coordinating the ticket overall, any authorized IT Staff member may intervene and record Actions Taken.
3. **Resolution Authority & Resolution Gate:** Requesters may continue to signal that their problem appears resolved, but this indication is strictly advisory. IT Staff and Administrators remain solely responsible for formally advancing ticket status. Furthermore, the backend must enforce that a Ticket cannot be marked as `Resolved` or `Closed` unless operational actions have been recorded.
4. **Role-Appropriate Dashboards:** Operational leaders, IT Staff, and Requesters require dedicated starting dashboards that summarize live system state concisely and provide seamless drill-down links to filtered lists, without duplicating detailed data tables or replacing granular ticket views.
5. **Quality & Regression Continuity:** All previous functionalities—authentication, first-login quarantine, requester ticket creation, attachment management, public comments, internal notes, and administrator user management—must continue to operate without defect under the unified Zen Green aesthetic.

---

## 3. Scope Boundaries

### 3.1 Included Scope
1. **Actions Taken Data & Workflow (Parent-Child Model):**
   - New `ActionTaken` entity linked to `Ticket` and performing `User`.
   - Fields: `actionDateTime`, `description`, `result`, `status` (`IN_PROGRESS`, `COMPLETED`, `CANCELLED`), `performedById`, `followUpRequired` (boolean), `followUpNote` (mandatory when `followUpRequired = true`), `attachmentNotes`.
   - Viewable by Requesters on their owned tickets (read-only).
   - Create, edit, and status-transition capabilities restricted strictly to IT Staff and Administrators.
   - Validation against inactive staff assignees and empty/whitespace inputs.
   - Optimistic concurrency control / stale-update collision detection.
2. **Ticket Workflow Hardening & Resolution Gate:**
   - Strict 8-State status transition matrix (`New`, `Open`, `In Progress`, `Waiting for Requester`, `Resolved`, `Closed`, `Reopened`, `Cancelled`).
   - Server-enforced **Resolution Gate**: Transitioning to `Resolved` or `Closed` is blocked (HTTP 400 `RESOLUTION_GATE_FAILED`) unless at least one valid `ActionTaken` record exists on the ticket.
   - Requester "Problem Appears Resolved" toggle remains advisory (`isRequesterResolved: true`) and does not modify formal `currentStatus`.
3. **Role-Appropriate Dashboards:**
   - **IT Staff Dashboard (`StaffDashboard.tsx`):** Operational metrics bar (`New`, `Open`, `In Progress`, `Waiting for Requester`, `My Assigned`), recent tickets list, urgent triage indicator, and `Quick Actions` panel (`Create Ticket`, `Search Tickets`, `My Queue`).
   - **Requester Dashboard (`RequesterDashboard.tsx`):** Personal ticket summary (`My Open Tickets`, `In Progress`, `Resolved`, `Closed`), recent tickets list, and `Quick Actions` panel (`Create Ticket`, `View My Tickets`).
   - **Administrator Dashboard:** Reuses IT Staff operational metrics with concise user management shortcuts.
   - Backend-driven SQL/Prisma aggregations with database query verification evidence.
   - Interactive drill-down navigation from dashboard cards to pre-filtered lists.
4. **Application Hardening & Regression Defense:**
   - 100% automated test pass rate across Unit, API, Component, Regression, and Playwright E2E suites.
   - Clean removal of obsolete, duplicate, or temporary UI artifacts left from earlier labs.
   - Zero console errors, WCAG AA contrast compliance, keyboard focus outlines, and zero horizontal scroll across Desktop (1280px), Tablet (768px), and Mobile (375px).

### 3.2 Explicitly Excluded Scope
- Automatic SLA calculation clocks, escalation engines, and breach notifications.
- Outbound notification services (Email, SMS, LINE, Push).
- Inventory consumption, spare-parts management, or purchasing logs.
- Timesheet billing, payroll, or labor-cost financial calculations.
- Multi-level approval workflows and cryptographic electronic signatures.
- Advanced business-intelligence platforms or external data warehouses.
- Multi-tenant cloud clustering or self-registration workflows.

---

## 4. Functional Requirements (FR)

- **FR-01 (Actions Taken Creation):** The system shall allow authenticated IT Staff and Administrators to record an Action Taken on any accessible ticket, capturing timestamp, description, result, follow-up flags, and attachment notes, with automatic actor attribution.
- **FR-02 (Follow-Up Enforcement):** When `followUpRequired` is marked `true`, the system shall enforce that `followUpNote` is populated with non-whitespace text (minimum 5 characters).
- **FR-03 (Actions Taken Update & Lifecycle):** Authorized staff shall be able to update action descriptions, results, follow-up status, and transition action status between `IN_PROGRESS`, `COMPLETED`, and `CANCELLED`.
- **FR-04 (Requester Action Visibility):** Requesters shall be able to view all Actions Taken on tickets they own in read-only presentation; create and edit controls shall be strictly unavailable.
- **FR-05 (Inactive Staff Guard):** The system shall reject assigning or attributing an Action Taken to any inactive (`isActive = false`) user account.
- **FR-06 (Optimistic Concurrency Detection):** The system shall detect stale or concurrent updates during Action Taken modifications, returning HTTP 409 Conflict if the record has been modified by another session.
- **FR-07 (Ticket Resolution Gate):** The backend shall reject any attempt to advance a Ticket to `Resolved` or `Closed` status if the ticket has zero recorded Actions Taken.
- **FR-08 (Advisory Requester Resolution):** The system shall allow Requesters to toggle `isRequesterResolved` on owned tickets without mutating the formal ticket lifecycle status.
- **FR-09 (IT Staff Dashboard Aggregation):** The system shall provide an endpoint returning authoritative counts of `New`, `Open`, `In Progress`, `Waiting for Requester`, and `Assigned to Current User` tickets, along with recent ticket summaries.
- **FR-10 (Requester Dashboard Isolation):** The system shall provide an endpoint returning counts of `Open`, `In Progress`, `Resolved`, and `Closed` tickets strictly owned by the authenticated Requester.
- **FR-11 (Dashboard Interactive Drill-Down):** Clicking any dashboard metric card shall navigate to the corresponding queue/list view pre-filtered by that criterion.
- **FR-12 (Full Regression Defense):** All authentication, quarantine, ticket creation, attachment, public comment, internal note, and user management capabilities from Labs 1 through 3 shall remain operational.

---

## 5. Business Rules (BR)

### 5.1 Actions Taken Rules
- **BR-01 (Single Ticket Binding):** Each Action Taken record belongs to exactly one Ticket (`ticketId` foreign key).
- **BR-02 (Independent Interventions):** The primary Ticket Owner coordinates the Ticket, but any active IT Staff member or Administrator may perform and record an Action Taken.
- **BR-03 (Automatic Actor Attribution):** The `performedById` field is derived securely from the authenticated session (`req.user.id`) and cannot be spoofed by client payloads.
- **BR-04 (Role Restriction):** Only users with role `IT_STAFF` or `ADMINISTRATOR` may create or edit Actions Taken. Requesters attempting write operations receive HTTP 403 Forbidden.
- **BR-05 (Conditional Follow-Up Requirement):** If `followUpRequired` is `true`, `followUpNote` must contain between 5 and 2,000 characters of non-whitespace text. If `followUpRequired` is `false`, `followUpNote` is optional or null.
- **BR-06 (Action Content Validation):** `description` and `result` must each contain between 5 and 2,000 characters of non-whitespace text. `attachmentNotes` is optional with a maximum length of 1,000 characters.
- **BR-07 (Inactive Assignee Rejection):** An Action Taken cannot be created or updated with an inactive staff user (`isActive = false`).
- **BR-08 (Concurrency Protection):** Updates must supply the current record version/timestamp; mismatched state returns HTTP 409 Conflict.
- **BR-09 (Chronological Audit Order):** Actions Taken are returned sorted chronologically by `actionDateTime` ascending.

### 5.2 Ticket Workflow & Resolution Gate Rules
- **BR-10 (8-State Matrix Compliance):** Tickets must progress strictly through the permitted 8-state transition matrix:
  - `New` → `Open`, `Cancelled`
  - `Open` → `In Progress`, `Cancelled`
  - `In Progress` → `Waiting for Requester`, `Resolved`, `Cancelled`
  - `Waiting for Requester` → `In Progress`, `Resolved`
  - `Resolved` → `Closed`, `Reopened`
  - `Reopened` → `In Progress`, `Waiting for Requester`, `Resolved`
  - `Closed`, `Cancelled` are terminal states.
- **BR-11 (Resolution Gate Enforcement):** Advancing status to `Resolved` or `Closed` requires that the ticket has at least one recorded `ActionTaken`. Violations return HTTP 400 `RESOLUTION_GATE_FAILED`.
- **BR-12 (Advisory Resolution Authority):** Requester's "Problem Appears Resolved" toggle alters only `isRequesterResolved: boolean`. It does not satisfy the Resolution Gate nor mutate `currentStatus`.
- **BR-13 (Auto-Advance on Claim):** Assigning an owner to an unassigned ticket in `New` status automatically advances its status to `Open`.

### 5.3 Dashboard Calculation & Drill-Down Rules
- **BR-14 (Authoritative Backend Metrics):** Dashboard metrics are computed server-side using SQL aggregate counts (`COUNT`, `GROUP BY`) rather than transferring entire collections to the client.
- **BR-15 (Requester Isolation):** Requester dashboard metrics are strictly filtered by `requesterId == req.user.id`.
- **BR-16 (IT Staff Queue Metrics):** IT Staff dashboard metrics aggregate system-wide active operational tickets, while `My Assigned` filters by `ownerId == req.user.id`.
- **BR-17 (Zero Metric Stability):** Metrics with zero matching records return `0` cleanly; corresponding lists render explicit empty state components.
- **BR-18 (Drill-Down Continuity):** Dashboard drill-down navigation must pass valid query parameters (`?status=...&owner=...`) matching ticket table filter definitions.

### 5.4 System Integrity Rules
- **BR-19 (Soft Deactivation & Audit Trail):** Users are deactivated (`isActive: false`) rather than physically deleted to maintain ticket and action audit trails.
- **BR-20 (Zero Regression Guarantee):** All previous endpoints and UI screens from Labs 1, 2, and 3 must pass automated regression testing without behavioral drift.

---

### 8-State Ticket Status Transition Matrix Table

| Current Status | Allowed Next Statuses | Terminal? | Permitted Roles | Prerequisite Checks |
| :--- | :--- | :---: | :--- | :--- |
| **New** | `Open`, `Cancelled` | No | IT_STAFF, ADMINISTRATOR | Claim auto-advances to `Open` |
| **Open** | `In Progress`, `Cancelled` | No | IT_STAFF, ADMINISTRATOR | None |
| **In Progress** | `Waiting for Requester`, `Resolved`, `Cancelled` | No | IT_STAFF, ADMINISTRATOR | `Resolved` requires **Resolution Gate** (>= 1 Action Taken) |
| **Waiting for Requester** | `In Progress`, `Resolved` | No | IT_STAFF, ADMINISTRATOR | `Resolved` requires **Resolution Gate** (>= 1 Action Taken) |
| **Resolved** | `Closed`, `Reopened` | No | IT_STAFF, ADMINISTRATOR | `Closed` requires **Resolution Gate** |
| **Reopened** | `In Progress`, `Waiting for Requester`, `Resolved`| No | IT_STAFF, ADMINISTRATOR | `Resolved` requires **Resolution Gate** |
| **Closed** | None (Terminal) | Yes | None | Read-only |
| **Cancelled** | None (Terminal) | Yes | None | Read-only |

---

## 6. UI Specification Summary

1. **Design System Consistency:** Full adherence to Zen Green design tokens (`#006B3C` primary brand, `#0B7A46` hover/focus, `#EAF6EF` light tint, `#F5F7F6` background).
2. **IT Staff Dashboard (`StaffDashboard.tsx`):**
   - KPI metric cards with icons and numerical indicators.
   - Interactive drill-down navigation routing to `StaffTicketQueue.tsx`.
   - Real-time `Refresh` action.
   - "My Recent Tickets" quick-access table.
   - Quick Actions: `Create Ticket`, `Search Tickets`, `My Queue`.
3. **Requester Dashboard (`RequesterDashboard.tsx`):**
   - Personal KPI cards (`My Open`, `In Progress`, `Resolved`, `Closed`).
   - "My Recent Tickets" list with status pills.
   - Quick Actions: `Create Ticket`, `View My Tickets`.
4. **Actions Taken Component (`ActionsTakenSection.tsx`):**
   - Integrated as a first-class tab on `StaffTicketDetail.tsx` and `TicketDetail.tsx`.
   - Chronological list of actions showing date, description, result, performed by, follow-up badge, and attachment notes.
   - Staff controls: `+ Add Action Taken` modal/drawer with validation, status toggle, and edit action.
   - Requester view: Read-only presentation with clean informative styling.
5. **Responsive Conventions:**
   - Desktop (1280px): Multi-column grids and high-density tables.
   - Tablet (768px): 2-column KPI grid and condensed cards.
   - Mobile (375px): 1-column stacked cards, full-width touch buttons (>= 44px touch targets), zero horizontal scroll.

*(See `docs/lab-04/ui-spec.md` for complete layout diagrams, color tokens, and Visual Checklist).*

---

## 7. Data Changes & Migration Decisions

### 7.1 Prisma Schema Extension

```prisma
enum ActionStatus {
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model ActionTaken {
  id               Int          @id @default(autoincrement())
  ticketId         Int
  ticket           Ticket       @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  performedById    Int
  performedBy      User         @relation(fields: [performedById], references: [id])
  actionDateTime   DateTime     @default(now())
  description      String       @db.VarChar(2000)
  result           String       @db.VarChar(2000)
  status           ActionStatus @default(COMPLETED)
  followUpRequired Boolean      @default(false)
  followUpNote     String?      @db.VarChar(2000)
  attachmentNotes  String?      @db.VarChar(1000)
  version          Int          @default(1)
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@index([ticketId])
  @@index([performedById])
}
```

### 7.2 Database Design Justifications (Handout Section 5.1 Requirement)
1. **Justification 1 — Dedicated Parent-Child Entity (`ActionTaken` Table):**
   - *Rationale:* Rather than embedding unstructured JSON or appending notes to the ticket row, a dedicated table with relational foreign keys (`ticketId`, `performedById`) guarantees strong referential integrity, indexes for fast chronological queries, and complete immutability for audit compliance.
2. **Justification 2 — Optimistic Concurrency Control (`version` & `updatedAt`):**
   - *Rationale:* IT Service desks frequently involve multiple team members triaging issues simultaneously. Implementing optimistic locking via a `version` counter prevents silent overwrites (lost updates) when two technicians update actions concurrently, returning an explicit HTTP 409 Conflict.

### 7.3 Migration & Seed Strategy
- Non-destructive Prisma migration (`20261029_lab4_actions_taken`).
- Existing Tickets without Actions Taken remain valid for historical inspection.
- Seed data provisions realistic tickets with:
  - 0 Actions Taken (for testing Resolution Gate blockage).
  - 1 Action Taken (for testing basic resolution).
  - Multiple Actions Taken across different IT Staff members (testing collaborative work).
  - Zero-metric dashboard scenarios (testing clean empty states).

---

## 8. API Contract Summary (18 Endpoints)

| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, issues JWT token |
| `GET` | `/api/auth/me` | All Authenticated | Returns current authenticated user session |
| `POST` | `/api/auth/logout` | All Authenticated | Invalidates session and clears credentials |
| `POST` | `/api/auth/change-password` | Quarantined / All | Mandatory first-login password change |
| `GET` | `/api/dashboards/staff` | IT_STAFF, ADMIN | Returns aggregated queue metrics, recent/urgent tickets |
| `GET` | `/api/dashboards/requester` | All Roles | Returns requester-isolated ticket metrics and recent items |
| `GET` | `/api/tickets/:id/actions-taken` | All Roles (Scoped) | Retrieves chronological list of Actions Taken for a ticket |
| `POST` | `/api/tickets/:id/actions-taken` | IT_STAFF, ADMIN | Creates new Action Taken (enforces follow-up note validation) |
| `PATCH` | `/api/tickets/:id/actions-taken/:actionId` | IT_STAFF, ADMIN | Modifies Action Taken (status, result, detects 409 conflict) |
| `GET` | `/api/staff/tickets` | IT_STAFF, ADMIN | Paginated IT Staff queue with search, filters, sorting |
| `GET` | `/api/staff/tickets/:id` | IT_STAFF, ADMIN | Operational ticket detail view |
| `PATCH` | `/api/staff/tickets/:id/claim` | IT_STAFF, ADMIN | Claims unassigned ticket or reassigns ownership |
| `PATCH` | `/api/staff/tickets/:id/it-priority` | IT_STAFF, ADMIN | Updates operational IT priority |
| `PATCH` | `/api/staff/tickets/:id/status` | IT_STAFF, ADMIN | Advances ticket status enforcing **Resolution Gate** |
| `GET/POST`| `/api/tickets/:id/comments` | All Roles | Threaded public comments visible to all parties |
| `GET/POST`| `/api/tickets/:id/notes` | IT_STAFF, ADMIN | Role-restricted internal notes (Requester receives 403) |
| `PATCH` | `/api/tickets/:id/resolve-indication`| REQUESTER | Toggles advisory `isRequesterResolved` flag |
| `GET/POST/PATCH` | `/api/admin/users/*` | ADMIN | Administrator User Management and safety guards |

*(See `docs/lab-04/api-spec.md` for exhaustive payload schemas, headers, query parameters, and error status codes).*

---

## 9. Acceptance Criteria (AC-01 to AC-15)

- **AC-01 (Valid Actions Taken Creation):** Given an authenticated IT Staff user, when submitting a valid Action Taken payload with description and result, then the record is created under the specified ticket with `performedById` bound to the user's ID and HTTP 201 is returned.
- **AC-02 (Follow-Up Note Validation):** Given an IT Staff user creating an Action Taken with `followUpRequired: true`, when `followUpNote` is empty or whitespace, then the request is rejected with HTTP 400 `FOLLOW_UP_NOTE_REQUIRED`.
- **AC-03 (Requester Action Creation Blocked):** Given an authenticated Requester user, when attempting `POST /api/tickets/:id/actions-taken`, then the server rejects the request with HTTP 403 Forbidden.
- **AC-04 (Requester Action Reading Scoped):** Given an authenticated Requester, when accessing `GET /api/tickets/:id/actions-taken` for an owned ticket, then actions are returned successfully; when accessing a ticket owned by another user, HTTP 403/404 is returned without data leakage.
- **AC-05 (Inactive Staff Action Blocked):** Given a request to record an Action Taken for a deactivated staff member, then the server rejects the request with HTTP 400 `INACTIVE_STAFF_MEMBER`.
- **AC-06 (Action Taken Status Transition):** Given an existing Action Taken in `IN_PROGRESS`, when an IT Staff member updates status to `COMPLETED` or `CANCELLED`, then the status update persists and HTTP 200 is returned.
- **AC-07 (Stale Action Update Conflict):** Given an Action Taken record, when a client attempts to update it with an outdated version number, then HTTP 409 Conflict `STALE_UPDATE_DETECTED` is returned.
- **AC-08 (Resolution Gate Rejection):** Given a ticket in `In Progress` status with zero recorded Actions Taken, when an IT Staff user attempts to transition status to `Resolved`, then the update is rejected with HTTP 400 `RESOLUTION_GATE_FAILED`.
- **AC-09 (Resolution Gate Success):** Given a ticket with at least one completed Action Taken, when an IT Staff user updates status to `Resolved`, then the status transition succeeds with HTTP 200.
- **AC-10 (Advisory Resolution Toggle):** Given an open ticket, when the ticket's Requester clicks "Problem Appears Resolved", then `isRequesterResolved` toggles to `true` while `currentStatus` remains unchanged.
- **AC-11 (IT Staff Dashboard Aggregation):** Given an authenticated IT Staff user, when requesting `GET /api/dashboards/staff`, then accurate aggregated metric counts matching authoritative database queries are returned.
- **AC-12 (Requester Dashboard Isolation):** Given an authenticated Requester, when requesting `GET /api/dashboards/requester`, then only metrics and recent tickets authored by that requester are returned.
- **AC-13 (Dashboard Drill-Down Navigation):** Given a user on either dashboard, when clicking any metric card, then the application navigates to the corresponding ticket list with matching filter query parameters active.
- **AC-14 (Dashboard Zero Metrics Empty States):** Given a user with zero matching tickets for a metric, when viewing the dashboard, the card displays `0` and clicking it displays an informative empty state component.
- **AC-15 (Full Multi-Sprint Regression):** Given the complete test suite across Labs 1 through 4, when executed against `main`, then all 153+ automated tests pass with 100% success rate.

---

## 10. Definition of Done (DoD) for Sprint 4

A feature or user story is considered **Done** only when:
1. **Contract Adherence:** Fully implements all specifications in `specification.md`, `api-spec.md`, and `ui-spec.md`.
2. **Criteria Verification:** Satisfies all Acceptance Criteria (AC-01 through AC-15).
3. **Automated Testing:** 100% test pass rate across unit, integration, UI, regression, and Playwright E2E tiers.
4. **Zero Warnings:** Zero TypeScript compiler errors, zero lint warnings, and zero browser console errors.
5. **Git Flow Protocol:** Originated from and merged into `lab4-staging` via Pull Request with formal Issue linking.
6. **Peer Review Enforcement (Rule 1):** Verified, reviewed, and merged by peer reviewer (`@Beethoven190`); strictly no author self-merges.
7. **Zen Green UI Polish:** Verified responsive rendering across Desktop (1280px), Tablet (768px), and Mobile (375px), with full keyboard accessibility and zero horizontal scroll.

---

## 11. Assumptions and Architectural Decisions

1. **Textual Attachment Notes:** In accordance with the stakeholder request, Actions Taken include an `attachmentNotes` textual field to reference relevant files, diagrams, or diagnostic captures without introducing redundant binary upload overhead.
2. **Resolution Gate Rule Definition:** A ticket is defined as eligible for resolution if it contains >= 1 `ActionTaken` entry with status `COMPLETED`.
3. **Stateless Aggregation Queries:** Dashboard metrics are computed on-the-fly using optimized Prisma aggregate queries (`groupBy`, `count`) rather than maintaining denormalized counter tables.
4. **Unified Component Reusability:** The `ActionsTakenSection` component is designed as a shared Zen Green component capable of switching between editable Staff mode and read-only Requester mode via props.
5. **Session-Bound Identity:** All operational actions and dashboard scopes rely on validated server-side JWT claims (`req.user.id`, `req.user.role`), guaranteeing zero privilege escalation.
