# AI Usage Log & Reflection — Lab 3: TokTickIT Users, Roles, IT Staff Ticketing, and Admin Screens

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents  
**Student Name:** Nitithorn Ketkaew ([@SANOP19](https://github.com/SANOP19))  
**Student ID:** `67070505203`  
**AI Assistant Platform:** Google DeepMind Antigravity AI Coding Agent (Claude 3.5 Sonnet / Gemini 2.5 Pro)  

---

## 1. AI Tooling & Workflow Overview

Throughout Lab 3, our engineering pair utilized the AI coding agent under rigorous **Spec-Driven Development (Spec DD)** and **Test-Driven Development (TDD)** principles:
1. **Contract-First Specification:** Prior to touching implementation code, the AI was directed to synthesize stakeholder requirements into formal engineering contracts across `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md`.
2. **Automated Test Guardrails:** For every sprint issue, automated test suites (Supertest API tests and React Testing Library component assertions) were planned and specified to establish clear boundaries before coding.
3. **Rigorous Review & Oversight:** Every generated artifact, database schema evolution, authentication middleware, and authorization rule was reviewed, tested, and submitted via peer-reviewed Pull Requests into `lab3-staging`.

---

## 2. Key Prompts Table (Selected Prompts Across Lifecycle)

| # | Development Phase | Issue / Context | Prompt Provided to AI Agent | Outcome / Artifact Produced |
|---|---|---|---|---|
| **1** | Specification & Contract | Issue 1 | *"Review the Lab 3 labsheet (all 18 pages) and decompose stakeholder requirements into a formal engineering contract. Generate `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` with numbered Business Rules (BR-01 to BR-21), Acceptance Criteria (AC-01 to AC-15), 8-status transition matrix, and full test traceability matrix."* | Created comprehensive sprint specifications and traceability matrix before coding. |
| **2** | Authentication Foundation | Issue 2 | *"Evolve the database schema from `RequesterUser` to `User` with bcrypt password hashing and roles (`REQUESTER`, `IT_STAFF`, `ADMINISTRATOR`). Implement `/api/auth/login`, `/logout`, `/me`, and `/change-password`. Build the Mandatory First-Login Password Change Modal and auth middleware."* | Established secure authentication, first-login password change quarantine, and token management. |
| **3** | Requester Continuation | Issue 3 | *"Remove the temporary Development Requester selector. Update Create Ticket and My Tickets to use authenticated credentials. Enhance Requester Ticket Detail with threaded Public Comments and a 'Problem Appears Resolved' toggle."* | Maintained 100% regression continuity for Requester features with authenticated identity. |
| **4** | IT Staff Ticket Queue | Issue 4 | *"Build `/api/staff/tickets` supporting search, filters (category, priority, status, ownership), sorting, and pagination. Implement the responsive Zen Green Ticket Queue UI with desktop table and mobile card views."* | Implemented operational ticket triage queue for IT Staff. |
| **5** | IT Staff Ticket Detail & Notes | Issue 5 | *"Build `/api/staff/tickets/:id` operations: ticket claim/reassignment, IT Priority updates, and 8-state status transitions. Implement threaded Public Comments and confidential Internal Notes with clear visual distinction."* | Created staff ticket command center with clear comment/note confidentiality boundaries. |
| **6** | Admin User Management | Issue 6 | *"Build `/api/admin/users` CRUD with initial password provisioning and reset. Implement User Management UI with safety guards blocking self-deactivation and preventing removal of the last active Administrator."* | Delivered minimalist user administration with essential safety controls. |
| **7** | E2E Testing & Verification | Issue 7 | *"Implement Playwright E2E suites (`authentication.spec.ts`, `staff-ticket-flow.spec.ts`, `user-administration.spec.ts`) validating complete multi-user workflows across all three roles."* | Verified end-to-end user journeys and system stability. |

---

## 3. Engineering Reflection on AI Agent Collaboration

Working with the Google DeepMind Antigravity AI coding agent across the 7 phases of Lab 3 provided profound engineering insights into human-AI collaborative software development:

1. **Spec-Driven Precision Eliminates Architectural Drift:**
   Sprint 3 introduced significant multi-role complexity: 3 distinct user roles, an 8-state status workflow, public comments vs confidential operational notes, and administrative safety guards. Attempting to build these incrementally without formal contracts would have led to severe authorization gaps and communication leaks. Defining the formal contracts upfront across `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` gave the agent clear specifications to fulfill, eliminating ambiguity.

2. **TDD as an AI Verification Shield:**
   Across Sprint 3, we maintained a 100% automated test pass rate across 99 backend integration tests, 49 frontend component tests, and 5 Playwright end-to-end journey tests. Supplying the agent with precise test assertions for edge cases—such as the Self-Deactivation Guard (`400 CANNOT_DEACTIVATE_SELF`), Last Active Admin Guard (`400 LAST_ADMIN_PROTECTED`), and duplicate email detection (`409 Conflict`)—ensured that security requirements were built defensively and tested automatically.

3. **Confidentiality & RBAC Enforcement:**
   One of the most sensitive requirements in Lab 3 was ensuring that Internal Operational Notes remain completely invisible to Requesters (AC-06, BR-15, BR-16). Human-directed oversight ensured that authorization was enforced at both the database query level (omitting internal notes from requester endpoints) and the UI layer (omitting the internal notes tab for non-staff), with automated tests proving zero data leakage.

4. **Rigorous Course Collaboration (Rule 1 & Rule 5):**
   Automating development velocity with AI did not bypass course collaboration protocols. Every issue followed strict Git Flow: branching from `lab3-staging`, opening linked PRs to GitHub Issues, advancing Kanban board cards through defined stages, and strictly observing Rule 1 where the author (@SANOP19) never merged their own PR, relying on thorough peer review and merge approvals from collaborators (@Beethoven190 and @Davidice23).

---

## 4. Ethical & Academic Integrity Statement

The AI agent was utilized strictly as an advanced pair programmer and implementation accelerator. All specifications, business rules, API schemas, UI design implementations, and automated test scenarios were directed, audited, understood, and validated by the student author. All Git operations, pull request discussions, peer code reviews, and project management artifacts adhere strictly to KMUTT and CPE 334 academic integrity standards.
