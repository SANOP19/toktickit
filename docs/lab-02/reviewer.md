# Peer Review Record — Lab 2: TokTickIT Requester Ticketing MVP

**Course:** CPE 334 Software Engineering in the Age of AI Agents  
**Semester:** 1/2026  
**Project:** TokTickIT IT Service Desk MVP (Requester Experience)  
**Repository Author:** Nitithorn Ketkaew ([@SANOP19](https://github.com/SANOP19) — Student ID: `67070505203`)  
**Primary Reviewer & Collaborator:** Supanut Watthanasimakorn ([@Beethoven190](https://github.com/Beethoven190) — Student ID: `67070505226`)  
**Cross-Review Collaborators:** [@Sxr1n](https://github.com/Sxr1n), [@FramePongrit](https://github.com/FramePongrit)  

---

## 1. Peer Review Process & Rules Adherence

Throughout the entire Lab 2 sprint, our engineering pair strictly followed the 5 mandatory collaboration rules:

1. **Rule 1 — Reviewer Merges PR (Mandatory):** The author of a Pull Request **never** merges their own code. The assigned peer reviewer conducts a thorough code review, leaves structured evaluation feedback, approves the PR, and clicks the green **`Merge pull request`** button.
2. **Rule 2 — Reply to All Review Comments:** Every comment, suggestion, or question raised during the peer review was answered and resolved before merging.
3. **Rule 3 — Link PR to Issue:** Every PR was linked to its corresponding GitHub Issue using the `Development` panel on GitHub, automating card progression.
4. **Rule 4 — Kanban Board Flow:** All cards transitioned through the defined Kanban stages: `Backlog` → `Specified` → `Started` → `PR Review` → `Fixing` (if needed) → `Done`.
5. **Rule 5 — Branch Flow Strategy:** All feature branches (`feature/X-...`) originated from and merged into `lab2-staging`. The final release is prepared by merging `lab2-staging` into `main`.

---

## 2. PRs Created by @SANOP19 (Reviewed & Merged by @Beethoven190)

| Issue # | Feature Branch | PR # | PR Link | Reviewer | Decision | Merged By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Issue 1** | `feature/1-sprint-spec` | #15 | [PR #15](https://github.com/SANOP19/toktickit/pull/15) | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 2** | `feature/2-requester-context` | #16 | [PR #16](https://github.com/SANOP19/toktickit/pull/16) | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 3** | `feature/3-ticket-creation` | #17 | [PR #17](https://github.com/SANOP19/toktickit/pull/17) | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 4** | `feature/4-my-tickets` | #18 | [PR #18](https://github.com/SANOP19/toktickit/pull/18) | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 5** | `feature/5-ticket-detail-attachments` | #19 | [PR #19](https://github.com/SANOP19/toktickit/pull/19) | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 6** | `feature/6-e2e-polish` | #20 | [PR #20](https://github.com/SANOP19/toktickit/pull/20) | @Beethoven190 | **Approved** | @Beethoven190 |
| **Release** | `lab2-staging` | #21 | [PR #21](https://github.com/SANOP19/toktickit/pull/21) | @Beethoven190 | **Approved** | @Beethoven190 |

### Detailed Evaluation of Author PRs:

#### PR #15 (Issue 1: Sprint Engineering Specification & Test Plan)
- **Author Summary:** Authored complete documentation for Lab 2 across `specification.md`, `tests.md`, `ui-spec.md`, and `api-spec.md` with numbered Business Rules (BR-01 to BR-12) and Acceptance Criteria (AC-01 to AC-10).
- **Review Feedback:** Verified that all FRs, BRs, ACs, and DoD matched the labsheet requirements. Traceability matrix accurately mapped all criteria to planned automated tests.
- **Outcome:** Approved and merged by @Beethoven190 into `lab2-staging`.

#### PR #16 (Issue 2: Development Requester Context & Selection Screen)
- **Author Summary:** Implemented `RequesterUser` Prisma schema, database migrations, idempotent seed data (4 active requesters + 1 inactive), `GET /api/dev-requesters` endpoint, and the `DevRequesterSelector` component with Zen Green styling.
- **Review Feedback:** Verified that inactive requester (`Metier Leviathan`) is properly excluded from the selection dropdown (BR-04, AC-02). Verified context switching across components.
- **Outcome:** Approved and merged by @Beethoven190 into `lab2-staging`.

#### PR #17 (Issue 3: Ticket Creation Screen & Unique Ticket Number API)
- **Author Summary:** Implemented `Ticket` and `RelatedSystem` models, sequential ticket number generation (`TKT-YYYY-XXXXXX`), `POST /api/tickets` with strict field validations, and the `CreateTicket.tsx` form with client validation, busy state, and safe failure preservation.
- **Review Feedback:** Tested that validation errors appear inline beneath invalid fields (BR-06, BR-07, AC-04) and form entries are preserved upon network or validation errors (BR-12).
- **Outcome:** Approved and merged by @Beethoven190 into `lab2-staging`.

#### PR #18 (Issue 4: My Tickets List, Search, Filters, Sorting, and Pagination)
- **Author Summary:** Built `GET /api/tickets` with query parameters (`search`, `categoryId`, `priority`, `status`, `page`, `limit`) and strict ownership isolation (`requesterId`). Implemented `MyTickets.tsx` with responsive desktop table, mobile card layouts, and pagination controls.
- **Review Feedback:** Verified requester data isolation (Requester A cannot see Requester B's tickets, AC-03, BR-05). Verified responsive card transitions for viewports < 768px.
- **Outcome:** Approved and merged by @Beethoven190 into `lab2-staging`.

#### PR #19 (Issue 5: Requester Ticket Detail Screen & Attachment Lifecycle)
- **Author Summary:** Implemented `Attachment` model, multer storage with 5 MB cap and MIME type validation (`BR-10`), `GET /api/tickets/:id` (with 403 ownership check), download endpoint (blocking removed files with 404), soft-removal endpoint requiring reason (>= 5 chars), and `TicketDetail.tsx` with active list, audit trail, and removal modal.
- **Review Feedback:** Verified soft-removal workflow: file moves to audit history, reason is displayed, and downloads are strictly blocked (BR-11, AC-08, AC-09).
- **Outcome:** Approved and merged by @Beethoven190 into `lab2-staging`.

#### PR #20 (Issue 6: Playwright E2E Test Suite & Documentation Finalization)
- **Author Summary:** Added Playwright E2E configuration and user journey test (`e2e/lab-02/requester-ticket-flow.spec.ts`), finalized `reviewer.md`, `ai-use.md`, and test execution outputs in `tests.md` with 35/35 passing tests.
- **Review Feedback:** Verified full user journey test coverage, documentation completeness, and 100% test pass rate.
- **Outcome:** Approved and merged by @Beethoven190 into `lab2-staging`.

#### PR #21 (Final Release: Merge `lab2-staging` into `main`)
- **Author Summary:** Final release PR delivering the complete Lab 2 product increment to `main`.
- **Review Feedback:** Verified all 6 feature issues merged, git flow followed, and clean test runs on release branch.
- **Outcome:** Approved and merged by @Beethoven190 into `main`.

---

## 3. PRs Reviewed & Merged by @SANOP19 (As Reviewer)

As part of collaborative peer review, @SANOP19 conducted comprehensive code reviews and executed merges for peer repositories:

| Author | Repository | PR # | Issue Reviewed | Review Decision | Merged By |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **@Beethoven190** | Beethoven190/toktickit | [PR #10](https://github.com/Beethoven190/toktickit/pull/10) | Issue 1: Engineering Contract | **Approved & Merged** | @SANOP19 |
| **@Beethoven190** | Beethoven190/toktickit | [PR #12](https://github.com/Beethoven190/toktickit/pull/12) | Issue 2: Requester Context | **Approved & Merged** | @SANOP19 |
| **@Beethoven190** | Beethoven190/toktickit | [PR #14](https://github.com/Beethoven190/toktickit/pull/14) | Issue 3: Ticket Creation Screen | **Approved & Merged** | @SANOP19 |
| **@Beethoven190** | Beethoven190/toktickit | [PR #16](https://github.com/Beethoven190/toktickit/pull/16) | Issue 4: My Tickets List & Filters | **Approved & Merged** | @SANOP19 |
| **@Beethoven190** | Beethoven190/toktickit | [PR #18](https://github.com/Beethoven190/toktickit/pull/18) | Issue 5: Ticket Detail & Attachments | **Approved & Merged** | @SANOP19 |
| **@Beethoven190** | Beethoven190/toktickit | [PR #20](https://github.com/Beethoven190/toktickit/pull/20) | Issue 6: Finalize docs & tests | **Approved & Merged** | @SANOP19 |
| **@Sxr1n** | Sxr1n/toktickit | [PR #19](https://github.com/Sxr1n/toktickit/pull/19) | Issue 2/3: Create Ticket & Models | **Approved & Merged** | @SANOP19 |
| **@FramePongrit** | FramePongrit/toktickit | [PR #22](https://github.com/FramePongrit/toktickit/pull/22) | Issue 4: My Tickets List API | **Approved & Merged** | @SANOP19 |
| **@FramePongrit** | FramePongrit/toktickit | [PR #36](https://github.com/FramePongrit/toktickit/pull/36) | Issue 6: Playwright E2E & Screenshot Evidence | **Approved & Merged** | @SANOP19 |

---

## 4. Quality Checklist & Verification Summary

| Check Item | Requirement | Status |
| :--- | :--- | :--- |
| **Branch Target** | All feature branches targeted `lab2-staging` before release | **PASS** |
| **Reviewer Merge Rule** | The assigned reviewer always merged PRs (never self-merged) | **PASS** |
| **Discussion & Comments** | All review comments and suggestions were answered and resolved | **PASS** |
| **Issue Traceability** | Every PR was explicitly linked to its GitHub Issue | **PASS** |
| **Kanban Flow** | Cards moved cleanly: `Backlog` → `Specified` → `Started` → `PR Review` → `Done` | **PASS** |
| **Automated Test Coverage** | 100% of automated tests (21 server + 14 client + 1 E2E) passed | **PASS** |
| **Design Tokens & UI** | Zen Green Theme strictly applied (`#006B3C`, `#0B7A46`, `#EAF6EF`, `#F5F7F6`) | **PASS** |
| **Responsive Design** | Clean rendering verified on Desktop (≥992px), Tablet (768–991px), and Mobile (<768px) | **PASS** |
