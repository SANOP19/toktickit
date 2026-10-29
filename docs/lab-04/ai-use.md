# AI Assistance Record & Engineering Reflection — Lab 4

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents (Semester 1/2026)  
**Project:** TokTickIT Multi-Role IT Service Desk Platform  
**Sprint:** Sprint 4 (Final Operational Increment)  
**Student Author:** Nitithorn Ketkaew ([@SANOP19](https://github.com/SANOP19) — Student ID: `67070505203`)  
**AI Platform:** Google DeepMind Antigravity AI Coding Agent (Claude 3.5 Sonnet / Gemini 2.5 Pro)

---

## 1. Key Prompts Table (Sprint 4 Development Phases)

| # | Phase / Context | Prompt Provided to AI Agent | Outcome / Artifact Produced |
| :-: | :--- | :--- | :--- |
| **1** | **Specification & Contract** *(Issue 1)* | "Decompose the Lab 4 handout (all 11 pages) into formal engineering contracts in `docs/lab-04/`. Generate `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` with 12 FRs, 20 BRs, 15 ACs, the 8-state transition matrix with Resolution Gate, 2 database design justifications, and full test traceability." | Formulated comprehensive Sprint 4 contracts before writing implementation code. |
| **2** | **Actions Taken Foundation** *(Issue 2)* | "Evolve the Prisma schema with the `ActionTaken` parent-child model, `ActionStatus` enum, and foreign keys. Create non-destructive migration and idempotent seed data with 0, 1, and multiple actions. Implement backend REST endpoints with inactive staff rejection and follow-up validation." | Implemented `ActionTaken` schema, migration, seed, and automated API integration test suite. |
| **3** | **Actions Taken UI** *(Issue 3)* | "Design and implement the Zen Green `ActionsTakenSection` component on `StaffTicketDetail.tsx` (with modal for create/edit and status toggles) and read-only presentation on Requester's `TicketDetail.tsx`. Ensure responsive layout across 1280px, 768px, and 375px." | Delivered responsive Actions Taken UI with role-based write restrictions. |
| **4** | **Ticket Workflow & Resolution Gate** *(Issue 4)* | "Enforce the server-side Resolution Gate on `PATCH /api/staff/tickets/:id/status` blocking transitions to `Resolved` or `Closed` if ticket has zero actions. Maintain Requester problem resolved toggle as purely advisory. Implement optimistic concurrency detection." | Built defensive Resolution Gate returning HTTP 400 when attempting resolution without actions. |
| **5** | **Role Dashboards** *(Issue 5)* | "Build backend aggregation endpoints (`/api/dashboards/staff` and `/api/dashboards/requester`) using Prisma aggregate queries. Implement `StaffDashboard.tsx` and `RequesterDashboard.tsx` following teacher mockups with KPI cards, quick actions, and drill-down links." | Created operational dashboards with live query matching and seamless drill-down navigation. |
| **6** | **Final Hardening & Regression** *(Issue 6)* | "Author Playwright E2E suites for actions taken, resolution gate, and dashboards. Execute complete test suite across Labs 1-4 ensuring 100% pass rate. Purge obsolete UI elements and verify zero console warnings and zero horizontal overflow." | Verified full regression defense across all 153+ automated tests and final build integrity. |

---

## 2. Engineering Reflection on AI Agent Collaboration

### 2.1 Spec-Driven Precision Prevents Scope Creep
In Sprint 4, the introduction of parent-child operational interventions (Actions Taken) and complex cross-record business logic (Resolution Gate) could easily have caused architectural misalignment. By directing the AI agent to author complete, numbered contracts (`specification.md`, `api-spec.md`) before writing any code, we eliminated ambiguous requirements. The AI agent had strict, unambiguous boundaries regarding what was included (e.g. textual `attachmentNotes`) and what was explicitly excluded (e.g. external SLA clocks and notification engines).

### 2.2 TDD as a Defense Against Workflow Regression
Enforcing the Resolution Gate required strict negative testing (verifying that resolving a ticket with zero actions returns HTTP 400 `RESOLUTION_GATE_FAILED`). Directing the AI agent to implement automated tests first ensured that security and business rules were built defensively at the API middleware layer rather than relying on disabled UI buttons.

### 2.3 Authoritative Database Aggregation vs Client-Side Filtering
A critical architectural choice was demanding that dashboard metrics be calculated server-side via SQL/Prisma aggregation (`count`, `groupBy`) rather than sending full collections to the browser. This prevents client memory bloat and guarantees that dashboard metrics directly reflect database truth, satisfying course evaluation standards.

### 2.4 Rigorous Enforcement of Collaboration Rules (Rule 1 & Rule 5)
Leveraging AI acceleration did not bypass human peer review and course protocols. Every issue branched strictly from `lab4-staging`, opened linked PRs to GitHub Issues, and strictly observed **Rule 1** where the author never merged their own PR, relying on thorough inspection and approval from peer collaborators (`@Beethoven190` and `@Davidice23`).

---

## 3. Ethical & Academic Integrity Statement

The AI coding agent was used strictly as a pair-programming and design accelerator under human engineering supervision. All requirements, specifications, database models, business logic implementations, and automated test scenarios were directed, audited, understood, and validated by the student author. All Git operations, pull request discussions, peer code reviews, and project management artifacts adhere strictly to KMUTT and CPE 334 academic integrity standards.
