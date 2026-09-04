# AI Usage Log & Reflection — Lab 2: TokTickIT Requester Ticketing MVP

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents  
**Student Name:** Nitithorn Ketkaew ([@SANOP19](https://github.com/SANOP19))  
**Student ID:** `67070505203`  
**AI Assistant Platform:** Google DeepMind Antigravity AI Coding Agent (Claude 3.5 Sonnet / Gemini 2.5 Pro)  

---

## 1. AI Tooling & Workflow Overview

In Lab 2, the AI coding agent was utilized under strict **Spec-Driven Development (Spec DD)** and **Test-Driven Development (TDD)** methodologies. Rather than blindly accepting generated code, the workflow followed a disciplined pair-programming approach:
1. **Specification First:** The AI was first tasked with transforming the stakeholder requirements into numbered Business Rules (BR) and Acceptance Criteria (AC) in `specification.md`, `tests.md`, `ui-spec.md`, and `api-spec.md`.
2. **Failing Tests Before Implementation:** For each issue, the AI implemented automated Vitest tests (Supertest API tests and React Testing Library UI tests) before coding the feature logic.
3. **Incremental Implementation:** Code was generated feature-by-feature on dedicated feature branches, keeping PR scopes focused.
4. **Human Verification:** All generated code, database migrations, and design tokens were audited and tested before opening Pull Requests.

---

## 2. Key Prompts Table (Selected 8 Prompts)

| # | Development Phase | Issue / Context | Prompt Provided to AI Agent | Outcome / Artifact Produced |
|---|---|---|---|---|
| **1** | Specification & Contract | Issue 1 | *"Review the Lab 2 labsheet and decompose stakeholder requirements into a formal engineering contract. Generate `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md` with numbered Business Rules (BR-01 to BR-12) and Given-When-Then Acceptance Criteria (AC-01 to AC-10)."* | Created comprehensive sprint specifications and traceability matrix. |
| **2** | Data Modeling & Seeding | Issue 2 | *"Define the Prisma schema for `RequesterUser`, `Category`, `RelatedSystem`, `Ticket`, and `Attachment`. Create an idempotent seed script in `server/prisma/seed.ts` containing 4 active requesters, 1 inactive requester, 4 categories, and 7 related systems."* | Created database models, migration SQL, and seed script ensuring repeated seed safety. |
| **3** | UI Shell & Context | Issue 2 | *"Implement `DevRequesterSelector.tsx` and `RequesterContext.tsx` using the Zen Green palette (`#006B3C`, `#0B7A46`, `#EAF6EF`). Exclude inactive requesters from the selection dropdown and display active requester info in the Navbar."* | Built the development requester switcher component and persistent React context. |
| **4** | Ticket Creation & Validation | Issue 3 | *"Implement `POST /api/tickets` with sequential ticket number generation (`TKT-YYYY-XXXXXX`) and field-level validation (Summary 5-120 chars, Description 10-2000 chars, valid Category and System). Build `CreateTicket.tsx` with inline error messages and busy state."* | Implemented ticket submission API, client form with live validation, and preserved entries upon error. |
| **5** | Ticket List & Ownership | Issue 4 | *"Implement `GET /api/tickets` with pagination, keyword search, category/priority/status filters, and strict ownership isolation using `requesterId`. Build `MyTickets.tsx` supporting desktop table and mobile card layouts."* | Developed paginated ticket list ensuring Requester A cannot view Requester B's tickets. |
| **6** | Ticket Detail & Storage | Issue 5 | *"Configure `multer` disk storage for file attachments (<= 5MB, JPG/PNG/WEBP/PDF). Implement `GET /api/tickets/:id`, attachment upload endpoint, and download endpoint. Return 403 Forbidden for unauthorized access."* | Added attachment upload and download endpoints with size/type verification and 403 ownership checks. |
| **7** | Soft-Removal Lifecycle | Issue 5 | *"Implement soft-removal for attachments via `DELETE /api/tickets/:id/attachments/:attachmentId`. Require a removal reason of at least 5 characters. Retain metadata in audit history but strictly block download (404). Add soft-removal modal to `TicketDetail.tsx`."* | Built soft-removal flow with confirmation modal, audit trail, and blocked downloads. |
| **8** | E2E Testing & Release | Issue 6 | *"Create a Playwright E2E test in `e2e/lab-02/requester-ticket-flow.spec.ts` covering the complete user journey: select requester, create ticket, find in list, open detail, upload attachment, and soft-remove file."* | Automated end-to-end integration test validating the entire requester flow across screens. |

---

## 3. My Reflection on AI Use in Software Engineering

Using the AI agent throughout Lab 2 was an eye-opening and highly productive experience:
- **Accelerated Velocity with Structure:** Working with an AI agent allowed rapid translation of abstract stakeholder requests into working, full-stack code. However, the biggest lesson learned was that **unstructured AI prompts lead to unstructured code**. Applying Spec-Driven Development (Spec DD) gave the AI an explicit contract to adhere to, which eliminated hallucinated fields or inconsistent API contracts.
- **TDD as an AI Safety Guard:** Writing failing unit and API tests first proved to be the most effective way to guide the AI. When the AI knew exactly what HTTP status codes and payload shapes the tests expected, it implemented the logic with zero regressions.
- **Developer Oversight is Essential:** While the AI handled boilerplate generation and CSS layout effortlessly, critical engineering concerns—such as database connection fallbacks during local offline development, disk file cleanup upon rejected uploads (`fs.unlinkSync`), and precise permission boundaries (403 Forbidden)—required careful human auditing, testing, and steering.

---

## 4. Ethical & Academic Integrity Statement

The AI agent was utilized strictly as an intelligent software engineering assistant and pair programmer. All architectural designs, business rules, API schemas, and test scenarios were reviewed, understood, and verified by the student author. All Git commits, peer review interactions, and pull request approvals complied with the KMUTT CPE 334 academic integrity policy.
