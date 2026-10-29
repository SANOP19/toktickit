# Peer Review Record — Lab 4: TokTickIT Actions Taken, Dashboards, and Final Regression

**Course:** CPE 334 Introduction to Software Engineering in the Age of AI Agents  
**Semester:** 1/2026  
**Project:** TokTickIT Multi-Role Service Desk Platform  
**Repository Author:** Nitithorn Ketkaew ([@SANOP19](https://github.com/SANOP19) — Student ID: `67070505203`)  
**Collaborators & Peer Reviewers:** Supanut Watthanasimakorn ([@Beethoven190](https://github.com/Beethoven190) — Student ID: `67070505226`), Wachirawit Photchamnian ([@Davidice23](https://github.com/Davidice23))

---

## 1. Peer Review Process & Course Rules Adherence

Throughout Sprint 4, our engineering pair continues to strictly enforce all core course collaboration rules:

1. **Rule 1 — Reviewer Merges PR (Strictly Enforced):** The author of a Pull Request (**@SANOP19**) **never** merges their own code. The assigned peer reviewer conducts a thorough line-by-line review against Acceptance Criteria, validates automated test results, submits structured feedback, approves the PR, and clicks the green **`Merge pull request`** button into `lab4-staging`.
2. **Rule 2 — Reply to All Review Comments:** Every comment, suggestion, or question raised during peer review is answered and verified before merge approval.
3. **Rule 3 — Link PR to Issue:** Every PR is explicitly linked to its corresponding GitHub Issue using the `Development` sidebar, automating Kanban card movement.
4. **Rule 4 — Kanban Board Lifecycle:** All issues progress through the defined Kanban stages: `Backlog` → `Specified` → `Started` → `PR Review` → `Fixing` (if needed) → `Done`.
5. **Rule 5 — Staging Branch Strategy:** All feature branches (`feature/X-...`) originate from and merge into `lab4-staging`. The final release is prepared by merging `lab4-staging` into `main`.

---

## 2. PRs Created by @SANOP19 (Reviewed & Merged by Collaborators)

### Table 1.1: Feature Pull Requests Authored by @SANOP19

| Issue # | Feature Branch | PR # | PR Link | Target Branch | Reviewer | Review Decision | Merged By |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Issue 1** | `feature/1-sprint4-spec` | #38 | [PR #38](https://github.com/SANOP19/toktickit/pull/38) | `lab4-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 2** | `feature/2-actions-foundation` | #46 | [PR #46](https://github.com/SANOP19/toktickit/pull/46) | `lab4-staging` | @Beethoven190 | **Approved** | @Beethoven190 |
| **Issue 3** | `feature/3-actions-ui` | TBD | TBD | `lab4-staging` | @Beethoven190 | Pending | Pending |
| **Issue 4** | `feature/4-ticket-workflow` | TBD | TBD | `lab4-staging` | @Beethoven190 | Pending | Pending |
| **Issue 5** | `feature/5-dashboards` | TBD | TBD | `lab4-staging` | @Beethoven190 | Pending | Pending |
| **Issue 6** | `feature/6-final-hardening` | TBD | TBD | `lab4-staging` | @Beethoven190 | Pending | Pending |
| **Release** | `lab4-staging` | TBD | TBD | `main` | @Beethoven190 | Pending | Pending |

---

## 3. Detailed Evaluation of Author PRs

### PR #38 (Issue 1: Sprint 4 Engineering Contracts & Specifications)
- **Author Summary:** Authored the complete foundational Sprint 4 engineering contracts across `specification.md`, `api-spec.md`, `ui-spec.md`, and `tests.md`. Formulated 12 Functional Requirements (FR-01 to FR-12), 20 numbered Business Rules (BR-01 to BR-20), 15 Acceptance Criteria (AC-01 to AC-15), 2 database design justifications, the 8-state ticket transition matrix with the **Resolution Gate**, and the full Traceability Matrix.
- **Peer Review Feedback (@Beethoven190):** Verified that the Resolution Gate properly requires at least one Action Taken before resolution, that the 2 database justifications meet course requirements, and that dashboard aggregation schemas are authoritative.
- **Outcome:** **Approved and merged** by @Beethoven190 into `lab4-staging`.

### PR #46 (Issue 2: Actions Taken Database Models, Seed Data, and REST API Foundation)
- **Author Summary:** Extended Prisma schema with `ActionTaken` model and `ActionStatus` enum. Implemented non-destructive database migration and seed data covering 0, 1, and multi-action scenarios. Created REST endpoints (`POST`, `GET`, `PATCH /api/tickets/:id/actions-taken`) enforcing role checks, inactive staff rejection, conditional `followUpNote` validation, and optimistic concurrency version tracking. Authored 12 automated API tests in `server/tests/lab-04/actions-taken.api.test.ts`. Full server regression: 111/111 passing tests.
- **Peer Review Feedback (@Beethoven190):** Thoroughly verified API endpoints, schema relations, and concurrency conflict handling (HTTP 409). Confirmed all 111 server tests pass with 100% success.
- **Outcome:** **Approved and merged** by @Beethoven190 into `lab4-staging`.

---

## 4. Reciprocal Peer Reviews Authored by @SANOP19 on Collaborator PRs

| Collaborator | Repository | PR # | PR Title | Review Decision | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **@Beethoven190** | `Beethoven190/toktickit` | #36 | [Issue 1] Sprint 4 Engineering Contracts & Specifications | **Approved** | Merged |
| **@Beethoven190** | `Beethoven190/toktickit` | #38 | [Issue 2] Actions Taken Backend Foundation, Schema Migration & REST API | **Approved** | Merged |

### Summary of Reciprocal Reviews Conducted:
- **Beethoven190 PR #36 (Issue 1):** Inspected Sprint 4 engineering specifications, Zen Green UI tokens, and test traceability matrix. Verified all acceptance criteria and rules. Approved.
- **Beethoven190 PR #38 (Issue 2):** Inspected 992 additions across Prisma schema, migration, seed data, REST endpoints, and 18 new automated integration tests. Verified conditional `followUpNote` enforcement, terminal status guard, and JWT auto-attribution. Submitted comprehensive English review approving the pull request.

